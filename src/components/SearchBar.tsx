'use client';

import { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { SearchResult } from '@/types';

interface SearchBarProps {
    onResults: (results: SearchResult[], answer: string) => void;
}

export default function SearchBar({ onResults }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, top_k: 5 }),
            });

            const data = await response.json();
            onResults(data.results || [], data.answer || '');
        } catch (error) {
            console.error('Search failed:', error);
            onResults([], 'Search failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setQuery('');
        onResults([], '');
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative flex items-center">
                <div className="absolute left-4 text-[var(--text-muted)]">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search your context... (e.g., 'What was I doing last week?')"
                    className="input py-4 text-base"
                    style={{ paddingLeft: '3.5rem', paddingRight: '3rem' }}
                    disabled={isLoading}
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                Press Enter to search • Semantic search across your focus sessions
            </p>
        </div>
    );
}
