'use client';

import { useState, useEffect } from 'react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { Calendar, RefreshCw, Loader2 } from 'lucide-react';
import ContextCapsuleCard from './ContextCapsule';
import { ContextCapsule, Decision } from '@/types';

interface TimelineSession extends ContextCapsule {
    decisions?: Decision[];
}

interface TimelineProps {
    sessions: TimelineSession[];
    isLoading: boolean;
    onRefresh: () => void;
    onLogDecision: (sessionId: string) => void;
}

export default function Timeline({
    sessions,
    isLoading,
    onRefresh,
    onLogDecision
}: TimelineProps) {
    // Group sessions by date
    const groupedSessions = sessions.reduce((groups, session) => {
        const date = startOfDay(new Date(session.time_start)).toISOString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(session);
        return groups;
    }, {} as Record<string, TimelineSession[]>);

    const sortedDates = Object.keys(groupedSessions).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'EEEE, MMMM d');
    };

    if (isLoading && sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin mb-4" />
                <p className="text-[var(--text-muted)]">Loading your context timeline...</p>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 mb-4 rounded-full bg-[var(--black-elevated)] flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    No Focus Sessions Yet
                </h3>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-md mb-4">
                    Start capturing your context by sending events to the ingest API,
                    then trigger clustering to create focus sessions.
                </p>
                <button onClick={onRefresh} className="btn btn-secondary">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Refresh button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="btn btn-ghost text-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
                {sortedDates.map((dateStr) => (
                    <div key={dateStr} className="relative">
                        {/* Date header */}
                        <div className="sticky top-0 z-10 mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--black-secondary)] rounded-full border border-[var(--black-border)]">
                                <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                    {getDateLabel(dateStr)}
                                </span>
                            </div>
                        </div>

                        {/* Sessions */}
                        <div className="space-y-4">
                            {groupedSessions[dateStr]
                                .sort((a, b) => new Date(b.time_start).getTime() - new Date(a.time_start).getTime())
                                .map((session, index) => (
                                    <div key={session.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                                        <ContextCapsuleCard
                                            capsule={session}
                                            decisions={session.decisions}
                                            onLogDecision={onLogDecision}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
