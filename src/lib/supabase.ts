import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client (for auth and client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
}

// Database types based on our schema
export type Database = {
    public: {
        Tables: {
            raw_events: {
                Row: {
                    id: string;
                    time: string;
                    source: string;
                    object: string;
                    inferred_intent: string | null;
                    metadata: Record<string, unknown> | null;
                    user_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    time: string;
                    source: string;
                    object: string;
                    inferred_intent?: string | null;
                    metadata?: Record<string, unknown> | null;
                    user_id?: string | null;
                    created_at?: string;
                };
            };
            focus_sessions: {
                Row: {
                    id: string;
                    time_start: string;
                    time_end: string;
                    title: string;
                    goal: string;
                    key_actions: string[];
                    artifacts: string[];
                    subsystem: string | null;
                    vector_id: string | null;
                    user_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    time_start: string;
                    time_end: string;
                    title: string;
                    goal: string;
                    key_actions: string[];
                    artifacts: string[];
                    subsystem?: string | null;
                    vector_id?: string | null;
                    user_id?: string | null;
                    created_at?: string;
                };
            };
            decisions: {
                Row: {
                    id: string;
                    session_id: string;
                    content: string;
                    decision_type: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    session_id: string;
                    content: string;
                    decision_type: string;
                    created_at?: string;
                };
            };
        };
    };
};
