-- Living Context Engine Database Schema

-- Raw events table for captured events
CREATE TABLE IF NOT EXISTS raw_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time TIMESTAMPTZ NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('git', 'file', 'browser', 'terminal', 'meeting', 'manual')),
  object TEXT NOT NULL,
  inferred_intent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus sessions (Context Capsules)
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time_start TIMESTAMPTZ NOT NULL,
  time_end TIMESTAMPTZ NOT NULL,
  title VARCHAR(255) NOT NULL,
  goal TEXT NOT NULL,
  key_actions TEXT[] NOT NULL DEFAULT '{}',
  artifacts TEXT[] NOT NULL DEFAULT '{}',
  subsystem VARCHAR(100),
  vector_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decisions linked to focus sessions
CREATE TABLE IF NOT EXISTS decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  decision_type VARCHAR(50) NOT NULL CHECK (decision_type IN ('made', 'tradeoff', 'rejected', 'assumption')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_events_time ON raw_events(time DESC);
CREATE INDEX IF NOT EXISTS idx_raw_events_source ON raw_events(source);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_time ON focus_sessions(time_start DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_session ON decisions(session_id);

-- Enable Row Level Security (optional, for multi-user)
-- ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
