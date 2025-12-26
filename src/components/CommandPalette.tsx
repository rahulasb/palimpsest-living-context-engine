'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Command, X, Clock, Layers, ArrowRight } from 'lucide-react';
import { ContextCapsule } from '@/types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    onTriggerCluster: () => void;
    recentSessions: ContextCapsule[];
}

export default function CommandPalette({
    isOpen,
    onClose,
    onSearch,
    onTriggerCluster,
    recentSessions,
}: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const commands = [
        {
            id: 'search',
            label: 'Search context',
            description: 'Semantic search across your focus sessions',
            icon: Search,
            action: () => {
                if (query.trim()) {
                    onSearch(query);
                    onClose();
                }
            },
        },
        {
            id: 'cluster',
            label: 'Trigger clustering',
            description: 'Process recent events into focus sessions',
            icon: Layers,
            action: () => {
                onTriggerCluster();
                onClose();
            },
        },
    ];

    const filteredCommands = query.trim()
        ? commands.filter(
            (cmd) =>
                cmd.label.toLowerCase().includes(query.toLowerCase()) ||
                cmd.description.toLowerCase().includes(query.toLowerCase())
        )
        : commands;

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    Math.min(prev + 1, filteredCommands.length + recentSessions.slice(0, 3).length - 1)
                );
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex < filteredCommands.length) {
                    filteredCommands[selectedIndex].action();
                } else {
                    const sessionIndex = selectedIndex - filteredCommands.length;
                    if (recentSessions[sessionIndex]) {
                        onSearch(recentSessions[sessionIndex].title);
                        onClose();
                    }
                }
            }
        },
        [filteredCommands, recentSessions, selectedIndex, onClose, onSearch]
    );

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Palette */}
            <div className="relative w-full max-w-xl bg-[var(--black-tertiary)] border border-[var(--black-border)] rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-[var(--black-border)]">
                    <Search className="w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Search or type a command..."
                        className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-lg"
                    />
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <kbd className="px-1.5 py-0.5 bg-[var(--black-secondary)] rounded">esc</kbd>
                        <span>to close</span>
                    </div>
                </div>

                {/* Commands */}
                <div className="max-h-80 overflow-y-auto">
                    {filteredCommands.length > 0 && (
                        <div className="p-2">
                            <div className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Commands
                            </div>
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedIndex === index
                                            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                            : 'text-[var(--text-primary)] hover:bg-[var(--black-hover)]'
                                        }`}
                                >
                                    <cmd.icon className="w-5 h-5" />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">{cmd.label}</div>
                                        <div className="text-sm text-[var(--text-muted)]">
                                            {cmd.description}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent Sessions */}
                    {recentSessions.length > 0 && (
                        <div className="p-2 border-t border-[var(--black-border)]">
                            <div className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                Recent Sessions
                            </div>
                            {recentSessions.slice(0, 3).map((session, index) => {
                                const itemIndex = filteredCommands.length + index;
                                return (
                                    <button
                                        key={session.id}
                                        onClick={() => {
                                            onSearch(session.title);
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedIndex === itemIndex
                                                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                                : 'text-[var(--text-primary)] hover:bg-[var(--black-hover)]'
                                            }`}
                                    >
                                        <Clock className="w-5 h-5" />
                                        <div className="flex-1 text-left truncate">
                                            <div className="font-medium truncate">{session.title}</div>
                                            <div className="text-sm text-[var(--text-muted)] truncate">
                                                {session.goal}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-3 border-t border-[var(--black-border)] text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-[var(--black-secondary)] rounded">↑↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-[var(--black-secondary)] rounded">↵</kbd>
                            select
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Command className="w-3 h-3" />
                        <span>K to open</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
