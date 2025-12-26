// Types for the Living Context Engine

export interface RawEvent {
  id?: string;
  time: string;
  source: 'git' | 'file' | 'browser' | 'terminal' | 'meeting' | 'manual';
  object: string;
  inferred_intent?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface ContextCapsule {
  id?: string;
  time_start: string;
  time_end: string;
  title: string;
  goal: string;
  key_actions: string[];
  artifacts: string[];
  subsystem?: string;
  vector_id?: string;
  created_at?: string;
}

export interface Decision {
  id?: string;
  session_id: string;
  content: string;
  decision_type: 'made' | 'tradeoff' | 'rejected' | 'assumption';
  created_at?: string;
}

export interface SearchResult {
  capsule: ContextCapsule;
  score: number;
  decisions?: Decision[];
}

export interface ClusterRequest {
  hours_back?: number;
}

export interface IngestRequest {
  events: RawEvent[];
}

export interface SearchRequest {
  query: string;
  top_k?: number;
}

export interface DecisionRequest {
  session_id: string;
  content: string;
  decision_type: Decision['decision_type'];
}
