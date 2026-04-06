'use client';

import { useState } from 'react';

interface QuickfireResponse {
  sayThis: string;
  why: string;
  avoid: string;
  ifBackfires: string;
}

export default function QuickfirePage() {
  const [situation, setSituation] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [response, setResponse] = useState<QuickfireResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!situation.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/quickfire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situation.trim(),
          context: showContext && context.trim() ? context.trim() : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get tactical response.');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResponse(null);
    setSituation('');
    setContext('');
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
          <span className="text-[#D4A017]">&#9889;</span> Quick-Fire Mode
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Real-time tactical responses. Type your situation, get exact words in seconds.
        </p>
      </header>

      {!response && !isLoading && (
        <div className="space-y-4">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I'm in a meeting and my boss just..."
            className="w-full h-32 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-[#D4A017] transition-colors resize-none"
            autoFocus
          />

          <div>
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-sm text-gray-500 hover:text-[#D4A017] transition-colors flex items-center gap-1"
            >
              <span className={`inline-block transition-transform ${showContext ? 'rotate-90' : ''}`}>
                &#9654;
              </span>
              Who is this about?
            </button>

            {showContext && (
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. My manager Sarah, tends to be passive-aggressive"
                className="w-full mt-2 bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4A017] transition-colors"
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!situation.trim()}
            className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <span>&#9889;</span> Get Tactical Response
          </button>

          <p className="text-center text-xs text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] rounded text-gray-400 text-xs">Cmd+Enter</kbd> to submit
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg">
          <div className="animate-pulse space-y-2">
            <p className="font-mono text-lg text-[#D4A017]">&#9889; ANALYZING SITUATION...</p>
            <p className="text-sm text-gray-500">Generating tactical response</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {response && (
        <div className="space-y-4">
          {/* SAY THIS */}
          <div className="bg-[#1A1A1A] border border-[#D4A017] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold">
                Say This:
              </span>
              <button
                onClick={() => copyToClipboard(response.sayThis)}
                className="text-xs text-gray-500 hover:text-[#D4A017] transition-colors font-mono"
              >
                {copied ? '[ COPIED ]' : '[ COPY ]'}
              </button>
            </div>
            <p className="text-white text-xl leading-relaxed">
              &ldquo;{response.sayThis}&rdquo;
            </p>
          </div>

          {/* WHY */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">
              Why:
            </span>
            <p className="text-gray-300 mt-1 text-sm">{response.why}</p>
          </div>

          {/* AVOID */}
          <div className="bg-[#1A1A1A] border border-red-900/50 rounded-lg p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold">
              Avoid:
            </span>
            <p className="text-gray-300 mt-1 text-sm">{response.avoid}</p>
          </div>

          {/* IF IT BACKFIRES */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
            <span className="font-mono text-xs uppercase tracking-wider text-yellow-600 font-bold">
              If It Backfires:
            </span>
            <p className="text-gray-300 mt-1 text-sm">&ldquo;{response.ifBackfires}&rdquo;</p>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 bg-[#1A1A1A] border border-[#333333] text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
          >
            New Situation
          </button>
        </div>
      )}
    </div>
  );
}
