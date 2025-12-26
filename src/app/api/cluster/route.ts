import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { synthesizeContextCapsule, generateEmbedding } from '@/lib/gemini';
import { upsertVector } from '@/lib/pinecone';
import { RawEvent } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const hoursBack = body.hours_back || 1;

        // Calculate time window
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000);

        // Fetch raw events from the time window
        const { data: events, error } = await supabase
            .from('raw_events')
            .select('*')
            .gte('time', startTime.toISOString())
            .lte('time', endTime.toISOString())
            .order('time', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            return NextResponse.json(
                { error: 'Failed to fetch events', details: error.message },
                { status: 500 }
            );
        }

        if (!events || events.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No events found in the specified time window',
                capsules_created: 0,
            });
        }

        // Cluster events into focus sessions (simple time-based clustering)
        const clusters = clusterEvents(events as RawEvent[], 30); // 30-minute gaps

        const createdCapsules = [];

        for (const cluster of clusters) {
            if (cluster.length < 2) continue; // Skip very small clusters

            // Synthesize Context Capsule using Gemini
            const capsule = await synthesizeContextCapsule(cluster);

            // Store in Supabase
            const { data: savedCapsule, error: saveError } = await supabase
                .from('focus_sessions')
                .insert({
                    time_start: capsule.time_start,
                    time_end: capsule.time_end,
                    title: capsule.title,
                    goal: capsule.goal,
                    key_actions: capsule.key_actions,
                    artifacts: capsule.artifacts,
                    subsystem: capsule.subsystem || null,
                })
                .select()
                .single();

            if (saveError) {
                console.error('Error saving capsule:', saveError);
                continue;
            }

            // Generate embedding for semantic search
            const embeddingText = `${capsule.title}. ${capsule.goal}. ${capsule.key_actions.join('. ')}`;
            const embedding = await generateEmbedding(embeddingText);

            // Store in Pinecone
            if (embedding.length > 0 && embedding.some(v => v !== 0)) {
                await upsertVector(savedCapsule.id, embedding, {
                    title: capsule.title,
                    goal: capsule.goal,
                    time_start: capsule.time_start,
                    time_end: capsule.time_end,
                    subsystem: capsule.subsystem || 'unknown',
                });

                // Update vector_id in Supabase
                await supabase
                    .from('focus_sessions')
                    .update({ vector_id: savedCapsule.id })
                    .eq('id', savedCapsule.id);
            }

            createdCapsules.push(savedCapsule);
        }

        return NextResponse.json({
            success: true,
            events_processed: events.length,
            clusters_found: clusters.length,
            capsules_created: createdCapsules.length,
            capsules: createdCapsules,
        });
    } catch (error) {
        console.error('Cluster error:', error);
        return NextResponse.json(
            { error: 'Failed to process clustering' },
            { status: 500 }
        );
    }
}

// Cluster events based on time gaps
function clusterEvents(events: RawEvent[], maxGapMinutes: number): RawEvent[][] {
    if (events.length === 0) return [];

    const clusters: RawEvent[][] = [];
    let currentCluster: RawEvent[] = [events[0]];

    for (let i = 1; i < events.length; i++) {
        const prevTime = new Date(events[i - 1].time).getTime();
        const currTime = new Date(events[i].time).getTime();
        const gapMinutes = (currTime - prevTime) / (1000 * 60);

        if (gapMinutes > maxGapMinutes) {
            clusters.push(currentCluster);
            currentCluster = [events[i]];
        } else {
            currentCluster.push(events[i]);
        }
    }

    if (currentCluster.length > 0) {
        clusters.push(currentCluster);
    }

    return clusters;
}

export async function GET() {
    try {
        // Get recent focus sessions
        const { data, error } = await supabase
            .from('focus_sessions')
            .select('*')
            .order('time_start', { ascending: false })
            .limit(20);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ sessions: data });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}
