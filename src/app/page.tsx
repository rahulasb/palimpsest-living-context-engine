import Link from 'next/link';
import { Brain, Zap, Search, Clock, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--black-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--black-border)] glass">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-emerald-600 flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">
                  Palimpsest - Living Context Engine
                </h1>
                <a
                  href="https://www.linkedin.com/in/rahul-adhini-satheesh-babu-4b3aa3285/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  AUTHORED BY RAHUL ADHINI
                </a>
              </div>
            </div>

            {/* Sign In Button */}
            <Link href="/login" className="btn btn-secondary px-8 min-w-[120px] whitespace-nowrap">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 mb-8">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--accent-primary)] font-medium">
              AI-Powered Context Memory
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
            Never Lose Your
            <span className="text-gradient block mt-2">Working Context</span>
          </h2>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            A real-time personal cognition layer that captures, compresses, and resurfaces
            your working context across code, documents, and decisions.
          </p>

          {/* CTA Button */}
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-emerald-500 text-[var(--black-primary)] hover:shadow-lg hover:shadow-[var(--accent-primary)]/25 transition-all hover:-translate-y-1"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-sm text-[var(--text-muted)] mt-4">
            No credit card required • Personal workspace included
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-[var(--black-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              How It Works
            </h3>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Automatically capture your engineering workflow and transform it into searchable, actionable context.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/5 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-7 h-7 text-[var(--accent-primary)]" />
              </div>
              <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                Capture Everything
              </h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Ingest events from Git commits, file changes, terminal commands, and browser activity automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-secondary)]/20 to-[var(--accent-secondary)]/5 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-7 h-7 text-[var(--accent-secondary)]" />
              </div>
              <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                AI Synthesis
              </h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Gemini AI clusters your events into focus sessions and synthesizes meaningful context capsules.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-info)]/20 to-[var(--accent-info)]/5 flex items-center justify-center mx-auto mb-6">
                <Search className="w-7 h-7 text-[var(--accent-info)]" />
              </div>
              <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                Semantic Search
              </h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Ask questions like "What was I working on last week?" and get instant, context-aware answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 border-t border-[var(--black-border)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
                Built for Engineers
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-medium mb-1">
                      Focus Session Tracking
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Automatically group your work into meaningful focus sessions with AI-generated summaries.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-secondary)]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[var(--accent-secondary)]" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-medium mb-1">
                      Decision Logging
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Log decisions, tradeoffs, and assumptions tied to specific work sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-info)]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[var(--accent-info)]" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-medium mb-1">
                      Personal & Private
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Your context stays yours. Each user has their own private workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8 bg-gradient-to-br from-[var(--black-secondary)] to-[var(--black-tertiary)]">
              <div className="text-[var(--text-muted)] text-sm mb-4">Example Query</div>
              <div className="bg-[var(--black-primary)] rounded-lg p-4 mb-6 font-mono text-sm">
                <span className="text-[var(--accent-primary)]">&quot;</span>
                <span className="text-[var(--text-primary)]">What decisions did I make about the auth system?</span>
                <span className="text-[var(--accent-primary)]">&quot;</span>
              </div>
              <div className="text-[var(--text-muted)] text-sm mb-4">AI Response</div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Based on your focus sessions, you decided to use Supabase Auth with Row Level Security
                for per-user data isolation. This was logged 2 hours ago during your &quot;Auth Implementation&quot; session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-[var(--black-border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Ready to remember everything?
          </h3>
          <p className="text-[var(--text-secondary)] mb-8">
            Start capturing your engineering context today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-emerald-500 text-[var(--black-primary)] hover:shadow-lg hover:shadow-[var(--accent-primary)]/25 transition-all hover:-translate-y-1"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--black-border)] py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-emerald-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">
                Palimpsest - Living Context Engine
              </span>
            </div>

            <a
              href="https://www.linkedin.com/in/rahul-adhini-satheesh-babu-4b3aa3285/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
            >
              © 2025 Rahul Adhini
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
