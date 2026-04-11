'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Copy, Lightbulb, Zap } from 'lucide-react';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';

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

export default function RewritePage() {
    const [originalMessage, setOriginalMessage] = useState('');
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RewriteResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { categories: taxonomyCategories } = useTaxonomy();
    const [goalFocused, setGoalFocused] = useState(false);
    const goalRef = useRef<HTMLDivElement>(null);

    // Flatten all use cases for autocomplete
    const allUseCases = useMemo(() =>
      taxonomyCategories.flatMap(cat =>
        cat.useCases.map(uc => ({ ...uc, categoryName: cat.name, emoji: cat.emoji }))
      ), [taxonomyCategories]);

    // Filter suggestions based on input
    const suggestions = useMemo(() => {
      if (!goal.trim()) return allUseCases.slice(0, 6); // show 6 popular when empty
      const lower = goal.toLowerCase();
      return allUseCases.filter(uc =>
        uc.title.toLowerCase().includes(lower) ||
        uc.categoryName.toLowerCase().includes(lower)
      ).slice(0, 6);
    }, [goal, allUseCases]);

    // Close dropdown on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (goalRef.current && !goalRef.current.contains(e.target as Node)) {
          setGoalFocused(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleRewrite = async () => {
        if (!originalMessage.trim()) return;
        
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
                    message: originalMessage,
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
        // TODO: Add toast notification
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-green-400 bg-green-400/10';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
            case 'HIGH': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
                    Message Rewriter — Influence Optimization
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Transform weak messages into psychologically optimized communications
                </p>
            </header>

            {/* Input Section */}
            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333] space-y-4">
                <div>
                    <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                        Original Message
                    </label>
                    <textarea
                        value={originalMessage}
                        onChange={(e) => setOriginalMessage(e.target.value)}
                        placeholder="Hey, how was your day? I had a pretty good day today. What are you up to?"
                        className="w-full h-32 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#D4A017]"
                    />
                </div>

                <div ref={goalRef} className="relative">
                    <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                        Goal (Optional)
                    </label>
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => { setGoal(e.target.value); setGoalFocused(true); }}
                        onFocus={() => setGoalFocused(true)}
                        placeholder="What are you trying to achieve? e.g., get a raise, close a deal..."
                        className="w-full bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-md p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                    />
                    {goalFocused && suggestions.length > 0 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                            {suggestions.map((uc) => (
                                <button
                                    key={uc.id}
                                    onClick={() => { setGoal(uc.title); setGoalFocused(false); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors flex items-center gap-3"
                                >
                                    <span className="text-sm text-gray-900 dark:text-white">{uc.title}</span>
                                    <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">{uc.emoji} {uc.categoryName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleRewrite}
                    disabled={!originalMessage.trim() || isLoading}
                    className="w-full bg-[#D4A017] text-[#0A0A0A] font-mono uppercase py-3 px-4 rounded-md hover:bg-[#F4D03F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? '[REWRITING...]' : '🔄 REWRITE MESSAGE'}
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg animate-pulse">
                    <p className="font-mono text-lg">[ANALYZING & OPTIMIZING...]</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Metrics */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-[#D4A017]">{result.confidence}%</div>
                                <div className="text-sm font-mono uppercase text-gray-500 dark:text-gray-400">Processing Confidence</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-400">
                                    +{Math.max(...result.versions.map(v => v.powerIncrease))}%
                                </div>
                                <div className="text-sm font-mono uppercase text-gray-500 dark:text-gray-400">Max Power Increase</div>
                            </div>
                        </div>
                    </div>

                    {/* Rewritten Versions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-mono uppercase text-[#D4A017]">
                            Optimized Versions
                        </h2>
                        
                        {result.versions.map((version, index) => (
                            <div key={index} className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333] space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-mono uppercase text-[#D4A017] font-bold">
                                            {version.type}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-mono ${getRiskColor(version.riskLevel)}`}>
                                            {version.riskLevel} RISK
                                        </span>
                                    </div>
                                    <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                        Power: +{version.powerIncrease}%
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600 dark:text-gray-300">{version.description}</p>

                                {/* Rewritten Message */}
                                <div className="bg-gray-50 dark:bg-[#222222] p-4 rounded-md relative group">
                                    <p className="text-gray-900 dark:text-white font-medium">{version.message}</p>
                                    <button
                                        onClick={() => handleCopy(version.message)}
                                        className="absolute top-3 right-3 p-2 bg-gray-200 dark:bg-[#333333] rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-[#444444]"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Explanation */}
                                <div className="flex items-start gap-2 bg-[#FAFAF8] dark:bg-[#0A0A0A] p-3 rounded-md">
                                    <Lightbulb className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{version.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}