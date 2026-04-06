'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Loader2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

type FeedbackOutcome = 'worked' | 'partially' | 'failed';

type FeedbackAnalysis = {
  analysis: string;
  whatWorked: string;
  whatToImprove: string;
  adjustedApproach: string;
};

interface FeedbackButtonProps {
  type: 'rewrite' | 'quickfire' | 'decode' | 'strategy';
  referenceId?: string;
  originalAdvice: string;
  techniqueId?: string;
}

const STORAGE_KEY = 'shadow-feedback-data';

function saveFeedback(record: any) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function FeedbackButton({ type, referenceId, originalAdvice, techniqueId }: FeedbackButtonProps) {
  const [stage, setStage] = useState<'idle' | 'notes' | 'loading' | 'result'>('idle');
  const [outcome, setOutcome] = useState<FeedbackOutcome | null>(null);
  const [notes, setNotes] = useState('');
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function handleOutcome(selected: FeedbackOutcome) {
    setOutcome(selected);
    setStage('notes');
  }

  async function submitFeedback() {
    if (!outcome) return;
    setStage('loading');
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          referenceId,
          originalAdvice: originalAdvice.slice(0, 2000),
          outcome,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      const data = await res.json();

      // Save feedback record locally
      saveFeedback({
        ...data.feedbackRecord,
        techniqueId,
        analysis: data.analysis,
      });

      setAnalysis({
        analysis: data.analysis,
        whatWorked: data.whatWorked,
        whatToImprove: data.whatToImprove,
        adjustedApproach: data.adjustedApproach,
      });
      setStage('result');
    } catch (e) {
      console.error('Feedback error:', e);
      setError('Failed to submit feedback. Try again.');
      setStage('notes');
    }
  }

  if (stage === 'idle') {
    return (
      <div className="mt-3 pt-3 border-t border-[#252525]">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2 font-mono">
          Did this work?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleOutcome('worked')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#252525] text-green-400 hover:bg-green-400/10 hover:border-green-400/30 transition-colors"
          >
            <ThumbsUp className="h-3 w-3" />
            Worked
          </button>
          <button
            onClick={() => handleOutcome('partially')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#252525] text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/30 transition-colors"
          >
            <Minus className="h-3 w-3" />
            Partially
          </button>
          <button
            onClick={() => handleOutcome('failed')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[#252525] text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-colors"
          >
            <ThumbsDown className="h-3 w-3" />
            {"Didn't Work"}
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'notes') {
    return (
      <div className="mt-3 pt-3 border-t border-[#252525]">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              outcome === 'worked'
                ? 'bg-green-400/20 text-green-400'
                : outcome === 'partially'
                ? 'bg-yellow-400/20 text-yellow-400'
                : 'bg-red-400/20 text-red-400'
            }`}
          >
            {outcome === 'worked' ? 'Worked' : outcome === 'partially' ? 'Partially' : "Didn't Work"}
          </span>
          <button
            onClick={() => { setOutcome(null); setStage('idle'); }}
            className="text-[10px] text-gray-600 hover:text-gray-400"
          >
            Change
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional: What happened? Any context..."
          className="w-full p-2 text-xs bg-[#0A0A0A] border border-[#333333] rounded-lg text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-[#D4A017]/50"
          rows={2}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => { setStage('idle'); setOutcome(null); setNotes(''); }}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitFeedback}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#D4A017] text-[#0A0A0A] hover:bg-[#D4A017]/90 transition-colors"
          >
            Submit Feedback
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="mt-3 pt-3 border-t border-[#252525]">
        <div className="flex items-center gap-2 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-[#D4A017]" />
          <span className="text-xs text-gray-500">Analyzing your feedback...</span>
        </div>
      </div>
    );
  }

  // Result stage
  if (stage === 'result' && analysis) {
    return (
      <div className="mt-3 pt-3 border-t border-[#252525]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-left mb-2"
        >
          <MessageSquare className="h-4 w-4 text-[#D4A017]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4A017]">
            AI Analysis
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-gray-500 ml-auto" />
          ) : (
            <ChevronDown className="h-3 w-3 text-gray-500 ml-auto" />
          )}
        </button>
        {expanded && (
          <div className="space-y-2 text-xs">
            <p className="text-gray-300">{analysis.analysis}</p>
            {analysis.whatWorked && (
              <div className="p-2 rounded bg-green-400/5 border border-green-400/10">
                <span className="font-bold text-green-400">What worked:</span>{' '}
                <span className="text-gray-400">{analysis.whatWorked}</span>
              </div>
            )}
            {analysis.whatToImprove && (
              <div className="p-2 rounded bg-yellow-400/5 border border-yellow-400/10">
                <span className="font-bold text-yellow-400">To improve:</span>{' '}
                <span className="text-gray-400">{analysis.whatToImprove}</span>
              </div>
            )}
            {analysis.adjustedApproach && (
              <div className="p-2 rounded bg-[#D4A017]/5 border border-[#D4A017]/10">
                <span className="font-bold text-[#D4A017]">Try next time:</span>{' '}
                <span className="text-gray-400">{analysis.adjustedApproach}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
