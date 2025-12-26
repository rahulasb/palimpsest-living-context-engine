import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DecisionRequest } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: DecisionRequest = await request.json();
        const { session_id, content, decision_type } = body;

        if (!session_id || !content || !decision_type) {
            return NextResponse.json(
                { error: 'session_id, content, and decision_type are required' },
                { status: 400 }
            );
        }

        // Validate decision_type
        if (!['made', 'tradeoff', 'rejected', 'assumption'].includes(decision_type)) {
            return NextResponse.json(
                { error: 'Invalid decision_type. Must be: made, tradeoff, rejected, or assumption' },
                { status: 400 }
            );
        }

        // Verify session exists
        const { data: session, error: sessionError } = await supabase
            .from('focus_sessions')
            .select('id')
            .eq('id', session_id)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Insert decision
        const { data, error } = await supabase
            .from('decisions')
            .insert({
                session_id,
                content,
                decision_type,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating decision:', error);
            return NextResponse.json(
                { error: 'Failed to create decision' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            decision: data,
        });
    } catch (error) {
        console.error('Decision error:', error);
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        let query = supabase
            .from('decisions')
            .select('*, focus_sessions(title, goal)')
            .order('created_at', { ascending: false });

        if (sessionId) {
            query = query.eq('session_id', sessionId);
        }

        const { data, error } = await query.limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ decisions: data });
    } catch (error) {
        console.error('Error fetching decisions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch decisions' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Decision ID is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('decisions')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting decision:', error);
        return NextResponse.json(
            { error: 'Failed to delete decision' },
            { status: 500 }
        );
    }
}
