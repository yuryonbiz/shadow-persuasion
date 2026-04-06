'use client';

import { useState } from 'react';

interface Tactic {
  quote: string;
  tactic: string;
  category: string;
  explanation: string;
  counterResponse: string;
}

interface ScanResult {
  threatScore: number;
  tactics: Tactic[];
  overallAssessment: string;
  counterScript: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Urgency: 'bg-red-900/40 text-red-300 border-red-800',
  'Social Proof': 'bg-blue-900/40 text-blue-300 border-blue-800',
  Authority: 'bg-purple-900/40 text-purple-300 border-purple-800',
  Guilt: 'bg-orange-900/40 text-orange-300 border-orange-800',
  Misdirection: 'bg-pink-900/40 text-pink-300 border-pink-800',
  Scarcity: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  Fear: 'bg-red-900/40 text-red-300 border-red-800',
  Flattery: 'bg-emerald-900/40 text-emerald-300 border-emerald-800',
  Reciprocity: 'bg-cyan-900/40 text-cyan-300 border-cyan-800',
  Anchoring: 'bg-indigo-900/40 text-indigo-300 border-indigo-800',
};

function getCategoryStyle(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-900/40 text-gray-300 border-gray-700';
}

function getThreatColor(score: number): string {
  if (score <= 3) return 'bg-green-500';
  if (score <= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getThreatLabel(score: number): string {
  if (score <= 3) return 'Low Threat';
  if (score <= 6) return 'Moderate Threat';
  return 'High Threat';
}

function getThreatTextColor(score: number): string {
  if (score <= 3) return 'text-green-400';
  if (score <= 6) return 'text-yellow-400';
  return 'text-red-400';
}

function highlightText(original: string, tactics: Tactic[]): React.ReactNode[] {
  if (!tactics.length) return [original];

  // Sort quotes by their position in the text (longest first for greedy matching)
  const sortedTactics = [...tactics]
    .filter((t) => original.includes(t.quote))
    .sort((a, b) => original.indexOf(a.quote) - original.indexOf(b.quote));

  if (!sortedTactics.length) return [original];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const tactic of sortedTactics) {
    const idx = original.indexOf(tactic.quote, lastIndex);
    if (idx === -1) continue;

    if (idx > lastIndex) {
      parts.push(original.slice(lastIndex, idx));
    }

    parts.push(
      <span
        key={idx}
        className={`border-b-2 border-dashed ${
          tactic.category === 'Urgency' || tactic.category === 'Fear'
            ? 'border-red-400'
            : tactic.category === 'Guilt'
            ? 'border-orange-400'
            : tactic.category === 'Authority'
            ? 'border-purple-400'
            : 'border-yellow-400'
        }`}
        title={`${tactic.tactic} (${tactic.category})`}
      >
        {tactic.quote}
      </span>
    );

    lastIndex = idx + tactic.quote.length;
  }

  if (lastIndex < original.length) {
    parts.push(original.slice(lastIndex));
  }

  return parts;
}

export default function ScannerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to scan text.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
          <span className="text-[#D4A017]">&#128737;</span> Manipulation Scanner
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Paste any message, email, or sales pitch. Every manipulation tactic will be detected and neutralized.
        </p>
      </header>

      {!result && !isLoading && (
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any message, email, or sales pitch..."
            className="w-full h-48 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4A017] transition-colors resize-none"
            autoFocus
          />

          <button
            onClick={handleScan}
            disabled={!text.trim()}
            className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Scan for Manipulation
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg">
          <div className="animate-pulse space-y-2">
            <p className="font-mono text-lg text-[#D4A017]">[SCANNING...]</p>
            <p className="text-sm text-gray-500">Detecting manipulation tactics</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Threat Score */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">
                Threat Level
              </span>
              <span className={`font-mono text-2xl font-bold ${getThreatTextColor(result.threatScore)}`}>
                {result.threatScore}/10
              </span>
            </div>
            <div className="w-full h-3 bg-[#333333] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getThreatColor(result.threatScore)}`}
                style={{ width: `${result.threatScore * 10}%` }}
              />
            </div>
            <p className={`text-sm mt-2 font-mono ${getThreatTextColor(result.threatScore)}`}>
              {getThreatLabel(result.threatScore)} &mdash; {result.tactics.length} tactic{result.tactics.length !== 1 ? 's' : ''} detected
            </p>
          </div>

          {/* Highlighted Original Text */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold block mb-3">
              Analyzed Text
            </span>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {highlightText(text, result.tactics)}
            </p>
          </div>

          {/* Tactics Found */}
          {result.tactics.length > 0 && (
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">
                Tactics Detected
              </span>
              {result.tactics.map((tactic, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-mono text-white font-bold">{tactic.tactic}</h3>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded border whitespace-nowrap ${getCategoryStyle(tactic.category)}`}
                    >
                      {tactic.category}
                    </span>
                  </div>
                  <blockquote className="border-l-2 border-[#D4A017] pl-3 text-sm text-gray-400 italic">
                    &ldquo;{tactic.quote}&rdquo;
                  </blockquote>
                  <p className="text-sm text-gray-300">{tactic.explanation}</p>
                  <div className="bg-[#0A0A0A] border border-[#333333] rounded p-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold block mb-1">
                      Counter:
                    </span>
                    <p className="text-sm text-white">&ldquo;{tactic.counterResponse}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Counter-Script */}
          <div className="bg-[#1A1A1A] border border-[#D4A017] rounded-lg p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold block mb-3">
              Full Counter-Script
            </span>
            <p className="text-white leading-relaxed">{result.counterScript}</p>
          </div>

          {/* Overall Assessment */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold block mb-3">
              Overall Assessment
            </span>
            <p className="text-gray-300 text-sm leading-relaxed">{result.overallAssessment}</p>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 bg-[#1A1A1A] border border-[#333333] text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
          >
            Scan Another Text
          </button>
        </div>
      )}
    </div>
  );
}
