import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Get focus sessions with their decisions
        const { data: sessions, error: sessionsError } = await supabase
            .from('focus_sessions')
            .select(`
        *,
        decisions (*)
      `)
            .order('time_start', { ascending: false })
            .limit(30);

        if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError);
            return NextResponse.json(
                { error: 'Failed to fetch timeline data' },
                { status: 500 }
            );
        }

        // Get recent raw events for context
        const { data: recentEvents } = await supabase
            .from('raw_events')
            .select('*')
            .order('time', { ascending: false })
            .limit(50);

        return NextResponse.json({
            sessions: sessions || [],
            recentEvents: recentEvents || [],
        });
    } catch (error) {
        console.error('Timeline error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch timeline' },
            { status: 500 }
        );
    }
}
