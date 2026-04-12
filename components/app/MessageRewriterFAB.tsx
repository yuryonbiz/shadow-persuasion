'use client';

import { useState } from 'react';
import { Edit, X, Copy, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RewriteResult {
    versions: {
        type: string;
        description: string;
        message: string;
        explanation: string;
        powerIncrease: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
    originalPowerScore: number;
    confidence: number;
}

export function MessageRewriterFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RewriteResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const goals = [
        'Build Authority & Credibility',
        'Create Urgency & Motivation', 
        'Establish Rapport & Connection',
        'Redirect Frame & Control',
        'Generate Reciprocity & Obligation',
        'Increase Intrigue & Interest'
    ];

    const handleQuickRewrite = async () => {
        if (!message.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/rewrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    goal: goal || 'General Improvement'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to rewrite message');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-green-400 bg-green-400/10';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
            case 'HIGH': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10';
        }
    };

    const openFullPage = () => {
        setIsOpen(false);
        router.push('/app/rewrite');
    };

    if (isOpen) {
        return (
            <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#333333]">
                        <div>
                            <h2 className="text-xl font-mono uppercase text-[#D4A017]">Quick Rewriter</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Optimize your message instantly</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={openFullPage}
                                className="px-3 py-1 text-xs bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-[#444444]"
                            >
                                Full Page
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-[#333333] rounded transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Input */}
                        <div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message to optimize..."
                                className="w-full h-24 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-md p-3 text-gray-900 dark:text-white resize-none focus:outline-none focus:border-[#D4A017]"
                            />
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-md p-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#D4A017]"
                            >
                                <option value="">Select goal...</option>
                                {goals.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleQuickRewrite}
                                disabled={!message.trim() || isLoading}
                                className="px-6 py-2 bg-[#D4A017] text-[#0A0A0A] font-mono text-sm rounded hover:bg-[#F4D03F] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Rewriting...' : 'Rewrite'}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Results */}
                        {result && (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {result.versions.slice(0, 2).map((version, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-[#222222] p-4 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-mono text-sm text-[#D4A017] uppercase">
                                                    {version.type}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded text-xs font-mono ${getRiskColor(version.riskLevel)}`}>
                                                    {version.riskLevel}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">+{version.powerIncrease}%</span>
                                        </div>
                                        
                                        <div className="bg-gray-200 dark:bg-[#333333] p-3 rounded relative group">
                                            <p className="text-gray-900 dark:text-white text-sm">{version.message}</p>
                                            <button
                                                onClick={() => handleCopy(version.message)}
                                                className="absolute top-2 right-2 p-1 bg-gray-300 dark:bg-[#444444] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Lightbulb className="h-3 w-3 text-[#D4A017] mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{version.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {result.versions.length > 2 && (
                                    <button
                                        onClick={openFullPage}
                                        className="w-full py-2 text-sm text-[#D4A017] hover:text-[#F4D03F] border border-gray-200 dark:border-[#333333] rounded hover:border-[#D4A017] transition-colors"
                                    >
                                        View All {result.versions.length} Versions
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-[#D4A017] text-[#0A0A0A] p-4 rounded-full shadow-lg hover:bg-[#F4D03F] transition-colors z-40 group"
        >
            <Edit className="h-6 w-6" />
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Quick Message Rewriter
            </div>
        </button>
    );
}