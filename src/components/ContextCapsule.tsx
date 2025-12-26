'use client';

import { format, formatDistanceToNow } from 'date-fns';
import {
    Clock,
    Target,
    Zap,
    FileCode,
    ChevronDown,
    ChevronUp,
    Layers
} from 'lucide-react';
import { useState } from 'react';
import { ContextCapsule, Decision } from '@/types';

interface ContextCapsuleCardProps {
    capsule: ContextCapsule;
    decisions?: Decision[];
    score?: number;
    onLogDecision?: (sessionId: string) => void;
}

export default function ContextCapsuleCard({
    capsule,
    decisions = [],
    score,
    onLogDecision
}: ContextCapsuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const timeStart = new Date(capsule.time_start);
    const timeEnd = new Date(capsule.time_end);
    const duration = Math.round((timeEnd.getTime() - timeStart.getTime()) / (1000 * 60));
    const durationStr = duration < 60
        ? `${duration}m`
        : `${Math.floor(duration / 60)}h ${duration % 60}m`;

    const getDecisionTypeColor = (type: string) => {
        switch (type) {
            case 'made': return 'tag-green';
            case 'tradeoff': return 'tag-amber';
            case 'rejected': return 'tag-red';
            case 'assumption': return 'tag-blue';
            default: return 'tag-blue';
        }
    };

    return (
        <div className="card p-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {score !== undefined && (
                            <span className="tag tag-green text-xs">
                                {Math.round(score * 100)}% match
                            </span>
                        )}
                        {capsule.subsystem && (
                            <span className="tag tag-blue">
                                <Layers className="w-3 h-3 mr-1" />
                                {capsule.subsystem}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
                        {capsule.title}
                    </h3>
                </div>
                <div className="text-right text-sm text-[var(--text-muted)] whitespace-nowrap">
                    <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(timeStart, { addSuffix: true })}
                    </div>
                    <div className="text-xs mt-0.5">{durationStr}</div>
                </div>
            </div>

            {/* Goal */}
            <div className="flex items-start gap-2 mb-4">
                <Target className="w-4 h-4 text-[var(--accent-primary)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[var(--text-secondary)]">{capsule.goal}</p>
            </div>

            {/* Key Actions */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Key Actions</span>
                </div>
                <ul className="space-y-1.5 ml-6">
                    {capsule.key_actions.map((action, i) => (
                        <li
                            key={i}
                            className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                        >
                            <span className="text-[var(--accent-primary)] mt-1">•</span>
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Expandable Section */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-full"
            >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {capsule.artifacts.length > 0 && `${capsule.artifacts.length} artifacts`}
                {decisions.length > 0 && ` • ${decisions.length} decisions`}
            </button>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[var(--black-border)] animate-fade-in">
                    {/* Artifacts */}
                    {capsule.artifacts.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileCode className="w-4 h-4 text-[var(--accent-info)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">Artifacts</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 ml-6">
                                {capsule.artifacts.map((artifact, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-2 py-1 bg-[var(--black-secondary)] rounded text-[var(--text-secondary)] font-mono"
                                    >
                                        {artifact.split('/').pop()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Decisions */}
                    {decisions.length > 0 && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-[var(--text-primary)] block mb-2">Decisions</span>
                            <div className="space-y-2 ml-6">
                                {decisions.map((decision) => (
                                    <div
                                        key={decision.id}
                                        className="text-sm p-2 bg-[var(--black-secondary)] rounded-lg"
                                    >
                                        <span className={`tag ${getDecisionTypeColor(decision.decision_type)} mr-2`}>
                                            {decision.decision_type}
                                        </span>
                                        <span className="text-[var(--text-secondary)]">{decision.content}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Time Details */}
                    <div className="text-xs text-[var(--text-dim)] space-y-0.5">
                        <p>Started: {format(timeStart, 'PPpp')}</p>
                        <p>Ended: {format(timeEnd, 'PPpp')}</p>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            {onLogDecision && (
                <div className="mt-4 pt-4 border-t border-[var(--black-border)]">
                    <button
                        onClick={() => onLogDecision(capsule.id!)}
                        className="btn btn-secondary text-xs"
                    >
                        Log Decision
                    </button>
                </div>
            )}
        </div>
    );
}
