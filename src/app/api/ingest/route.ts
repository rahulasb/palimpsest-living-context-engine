import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RawEvent } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Support both single event and array of events
        const events: RawEvent[] = Array.isArray(body.events)
            ? body.events
            : Array.isArray(body)
                ? body
                : [body];

        if (events.length === 0) {
            return NextResponse.json(
                { error: 'No events provided' },
                { status: 400 }
            );
        }

        // Validate events
        const validEvents = events.filter((event) => {
            return (
                event.time &&
                event.source &&
                event.object &&
                ['git', 'file', 'browser', 'terminal', 'meeting', 'manual'].includes(event.source)
            );
        });

        if (validEvents.length === 0) {
            return NextResponse.json(
                { error: 'No valid events provided. Each event must have time, source, and object.' },
                { status: 400 }
            );
        }

        // Insert events into Supabase
        const { data, error } = await supabase
            .from('raw_events')
            .insert(
                validEvents.map((event) => ({
                    time: event.time,
                    source: event.source,
                    object: event.object,
                    inferred_intent: event.inferred_intent || null,
                    metadata: event.metadata || null,
                }))
            )
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to store events', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            inserted: data?.length || 0,
            events: data,
        });
    } catch (error) {
        console.error('Ingest error:', error);
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}

export async function GET() {
    try {
        // Get recent events for debugging
        const { data, error } = await supabase
            .from('raw_events')
            .select('*')
            .order('time', { ascending: false })
            .limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ events: data });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
