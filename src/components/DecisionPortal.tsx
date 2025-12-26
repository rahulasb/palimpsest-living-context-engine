'use client';

import { useState } from 'react';
import { X, MessageSquare, Save, Loader2 } from 'lucide-react';

interface DecisionPortalProps {
    isOpen: boolean;
    sessionId: string | null;
    sessionTitle?: string;
    onClose: () => void;
    onSave: () => void;
}

type DecisionType = 'made' | 'tradeoff' | 'rejected' | 'assumption';

export default function DecisionPortal({
    isOpen,
    sessionId,
    sessionTitle,
    onClose,
    onSave
}: DecisionPortalProps) {
    const [content, setContent] = useState('');
    const [decisionType, setDecisionType] = useState<DecisionType>('made');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const decisionTypes: { value: DecisionType; label: string; description: string }[] = [
        { value: 'made', label: 'Decision Made', description: 'A concrete choice or direction taken' },
        { value: 'tradeoff', label: 'Tradeoff Chosen', description: 'Accepted compromise between options' },
        { value: 'rejected', label: 'Approach Rejected', description: 'Something deliberately avoided' },
        { value: 'assumption', label: 'Assumption', description: 'Underlying belief or expectation' },
    ];

    const handleSave = async () => {
        if (!content.trim() || !sessionId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    content: content.trim(),
                    decision_type: decisionType,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save decision');
            }

            setContent('');
            setDecisionType('made');
            onSave();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save decision');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[var(--black-tertiary)] border border-[var(--black-border)] rounded-xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--black-border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Log Decision
                            </h2>
                            {sessionTitle && (
                                <p className="text-sm text-[var(--text-muted)] truncate max-w-xs">
                                    {sessionTitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--black-hover)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Decision Type */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                            Decision Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {decisionTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setDecisionType(type.value)}
                                    className={`p-3 text-left rounded-lg border transition-all ${decisionType === type.value
                                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                            : 'border-[var(--black-border)] bg-[var(--black-secondary)] hover:border-[var(--black-muted)]'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${decisionType === type.value
                                            ? 'text-[var(--accent-primary)]'
                                            : 'text-[var(--text-primary)]'
                                        }`}>
                                        {type.label}
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {type.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Input */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            What was decided?
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe the decision, tradeoff, or assumption..."
                            rows={4}
                            className="input resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-lg bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/20">
                            <p className="text-sm text-[var(--accent-danger)]">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--black-border)]">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!content.trim() || isLoading}
                        className="btn btn-primary"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Decision
                    </button>
                </div>
            </div>
        </div>
    );
}
