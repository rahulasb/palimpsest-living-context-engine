-- Add user_id column to tables for per-user data isolation
ALTER TABLE raw_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security on all tables
ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can view own events" ON raw_events;
DROP POLICY IF EXISTS "Users can insert own events" ON raw_events;
DROP POLICY IF EXISTS "Users can view own sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can view own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can insert own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can delete own decisions" ON decisions;

-- Create RLS policies for raw_events
CREATE POLICY "Users can view own events" ON raw_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON raw_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for focus_sessions
CREATE POLICY "Users can view own sessions" ON focus_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON focus_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for decisions (tied to sessions)
CREATE POLICY "Users can view own decisions" ON decisions
  FOR SELECT USING (
    session_id IN (SELECT id FROM focus_sessions WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert own decisions" ON decisions
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM focus_sessions WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own decisions" ON decisions
  FOR DELETE USING (
    session_id IN (SELECT id FROM focus_sessions WHERE user_id = auth.uid())
  );
