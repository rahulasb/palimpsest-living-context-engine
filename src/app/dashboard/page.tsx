'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Command,
  Sparkles,
  Clock,
  MessageSquare,
  Layers,
  LogOut,
  User,
  Loader2
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import Timeline from '@/components/Timeline';
import DecisionPortal from '@/components/DecisionPortal';
import CommandPalette from '@/components/CommandPalette';
import ContextCapsuleCard from '@/components/ContextCapsule';
import { ContextCapsule, Decision, SearchResult } from '@/types';
import { useAuth } from '@/lib/auth';

interface TimelineSession extends ContextCapsule {
  decisions?: Decision[];
}

export default function Dashboard() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<TimelineSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchAnswer, setSearchAnswer] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [isDecisionPortalOpen, setIsDecisionPortalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState<string>('');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchTimeline = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/timeline');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const triggerCluster = async () => {
    try {
      const response = await fetch('/api/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours_back: 24 }),
      });
      const data = await response.json();
      console.log('Clustering result:', data);
      fetchTimeline();
    } catch (error) {
      console.error('Clustering failed:', error);
    }
  };

  const handleSearchResults = (results: SearchResult[], answer: string) => {
    setSearchResults(results);
    setSearchAnswer(answer);
    setIsSearching(results.length > 0 || answer !== '');
  };

  const handleLogDecision = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    setSelectedSessionId(sessionId);
    setSelectedSessionTitle(session?.title || '');
    setIsDecisionPortalOpen(true);
  };

  const handleDecisionSaved = () => {
    fetchTimeline();
  };

  const handleSearch = (query: string) => {
    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: 5 }),
    })
      .then(res => res.json())
      .then(data => handleSearchResults(data.results || [], data.answer || ''))
      .catch(console.error);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTimeline();
    }
  }, [user, fetchTimeline]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--black-primary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--black-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--black-border)] glass">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dim)] flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-[var(--black-primary)]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">
                  Palimpsest
                </h1>
                <a
                  href="https://www.linkedin.com/in/rahul-adhini-satheesh-babu-4b3aa3285/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  by Rahul Adhini
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="btn btn-secondary"
              >
                <Command className="w-4 h-4" />
                <span className="hidden sm:inline">Command</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-[var(--black-tertiary)] rounded ml-2">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={triggerCluster}
                className="btn btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Process Events</span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2 pl-3 border-l border-[var(--black-border)]">
                <div className="w-8 h-8 rounded-full bg-[var(--black-elevated)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-ghost text-sm"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Section */}
        <section className="mb-10">
          <SearchBar onResults={handleSearchResults} />
        </section>

        {/* Search Results */}
        {isSearching && (
          <section className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
                Search Results
              </h2>
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                  setSearchAnswer('');
                }}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            </div>

            {/* AI Answer */}
            {searchAnswer && (
              <div className="card p-5 mb-6 border-[var(--accent-primary)]/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                      Context-Aware Answer
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {searchAnswer}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Sessions */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <ContextCapsuleCard
                    key={result.capsule.id}
                    capsule={result.capsule}
                    decisions={result.decisions}
                    score={result.score}
                    onLogDecision={handleLogDecision}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {sessions.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Focus Sessions</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-secondary)]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[var(--accent-secondary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {sessions.reduce((acc, s) => acc + (s.decisions?.length || 0), 0)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Decisions Logged</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-info)]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--accent-info)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {sessions.reduce((acc, s) => {
                    const start = new Date(s.time_start).getTime();
                    const end = new Date(s.time_end).getTime();
                    return acc + (end - start) / (1000 * 60 * 60);
                  }, 0).toFixed(1)}h
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Focus Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
            Timeline
          </h2>
          <Timeline
            sessions={sessions}
            isLoading={isLoading}
            onRefresh={fetchTimeline}
            onLogDecision={handleLogDecision}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--black-border)] py-6 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">
            Palimpsest - Living Context Engine
          </span>
          <a
            href="https://www.linkedin.com/in/rahul-adhini-satheesh-babu-4b3aa3285/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
          >
            © 2025 Rahul Adhini
          </a>
        </div>
      </footer>

      {/* Modals */}
      <DecisionPortal
        isOpen={isDecisionPortalOpen}
        sessionId={selectedSessionId}
        sessionTitle={selectedSessionTitle}
        onClose={() => setIsDecisionPortalOpen(false)}
        onSave={handleDecisionSaved}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSearch={handleSearch}
        onTriggerCluster={triggerCluster}
        recentSessions={sessions.slice(0, 5)}
      />
    </div>
  );
}
