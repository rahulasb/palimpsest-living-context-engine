import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding, answerContextQuery } from '@/lib/gemini';
import { queryVectors } from '@/lib/pinecone';
import { ContextCapsule, SearchResult } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, top_k = 5 } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // If embedding fails (rate limit, etc), fall back to text search
        if (queryEmbedding.every(v => v === 0)) {
            console.log('Embedding failed, falling back to text search');
            return await textSearchFallback(query, top_k);
        }

        // Search Pinecone for similar capsules
        const matches = await queryVectors(queryEmbedding, top_k);

        if (matches.length === 0) {
            // Fall back to text search if no vector matches
            return await textSearchFallback(query, top_k);
        }

        // Fetch full capsule data from Supabase
        const capsuleIds = matches.map((m) => m.id);
        const { data: capsules, error } = await supabase
            .from('focus_sessions')
            .select('*')
            .in('id', capsuleIds);

        if (error) {
            console.error('Error fetching capsules:', error);
            return NextResponse.json(
                { error: 'Failed to fetch capsule details' },
                { status: 500 }
            );
        }

        // Fetch associated decisions
        const { data: decisions } = await supabase
            .from('decisions')
            .select('*')
            .in('session_id', capsuleIds);

        // Build results with scores
        const results: SearchResult[] = matches.map((match) => {
            const capsule = capsules?.find((c) => c.id === match.id) as ContextCapsule | undefined;
            const capsuleDecisions = decisions?.filter((d) => d.session_id === match.id);

            return {
                capsule: capsule || {
                    id: match.id,
                    title: match.metadata?.title as string || 'Unknown',
                    goal: match.metadata?.goal as string || '',
                    time_start: match.metadata?.time_start as string || '',
                    time_end: match.metadata?.time_end as string || '',
                    key_actions: [],
                    artifacts: [],
                },
                score: match.score || 0,
                decisions: capsuleDecisions,
            };
        }).filter((r) => r.capsule);

        // Generate an AI answer based on relevant context
        const answer = await answerContextQuery(query, results);

        return NextResponse.json({
            results,
            answer,
            total_matches: results.length,
        });
    } catch (error) {
        console.error('Search error:', error);
        // Fall back to text search on any error
        try {
            const body = await request.clone().json();
            return await textSearchFallback(body.query || '', body.top_k || 5);
        } catch {
            return NextResponse.json(
                { error: 'Search failed', results: [], answer: '' },
                { status: 200 } // Return 200 with empty results instead of 500
            );
        }
    }
}

// Fallback: Simple text search in Supabase
async function textSearchFallback(query: string, limit: number) {
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);

    // Get all sessions and filter client-side (simple approach)
    const { data: sessions, error } = await supabase
        .from('focus_sessions')
        .select(`*, decisions(*)`)
        .order('time_start', { ascending: false })
        .limit(20);

    if (error || !sessions) {
        return NextResponse.json({
            results: [],
            answer: 'Unable to search at this time. Please try again later.',
            fallback: true
        });
    }

    // Simple text matching
    const results: SearchResult[] = sessions
        .filter(session => {
            const text = `${session.title} ${session.goal} ${session.key_actions?.join(' ')}`.toLowerCase();
            return searchTerms.some(term => text.includes(term));
        })
        .slice(0, limit)
        .map(session => ({
            capsule: session as ContextCapsule,
            score: 0.5, // Placeholder score for text matches
            decisions: session.decisions || [],
        }));

    // If no matches, return most recent sessions
    if (results.length === 0) {
        const recentResults = sessions.slice(0, limit).map(session => ({
            capsule: session as ContextCapsule,
            score: 0.3,
            decisions: session.decisions || [],
        }));

        return NextResponse.json({
            results: recentResults,
            answer: `No exact matches found. Showing ${recentResults.length} recent sessions.`,
            fallback: true
        });
    }

    return NextResponse.json({
        results,
        answer: `Found ${results.length} sessions matching your query. (Note: Using text search - semantic search temporarily unavailable)`,
        total_matches: results.length,
        fallback: true
    });
}
