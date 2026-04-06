'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Step {
  stepNumber: number;
  technique: string;
  action: string;
  rationale: string;
  ifPositive: string;
  ifResist: string;
}

interface Stack {
  name: string;
  philosophy: string;
  steps: Step[];
}

interface SavedStack {
  id: string;
  label: string;
  goal: string;
  stack: Stack;
  savedAt: string;
}

const PRESET_GOALS = [
  'Negotiate Salary',
  'Close a Deal',
  'Win Back Someone',
  'Set Boundaries',
  'Get Buy-In',
  'Handle Conflict',
];

const STORAGE_KEY = 'shadow-stacks-data';

function loadSavedStacks(): SavedStack[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedStacks(stacks: SavedStack[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stacks));
}

// Find technique slug for linking to library
function techniqueSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function StackingPage() {
  const [goal, setGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryStack, setPrimaryStack] = useState<Stack | null>(null);
  const [alternatives, setAlternatives] = useState<Stack[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [activeAlternative, setActiveAlternative] = useState(0);
  const [savedStacks, setSavedStacks] = useState<SavedStack[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');

  useEffect(() => {
    setSavedStacks(loadSavedStacks());
  }, []);

  const generateStack = async () => {
    const finalGoal = goal === 'custom' ? customGoal.trim() : goal;
    if (!finalGoal) return;

    setIsLoading(true);
    setError(null);
    setPrimaryStack(null);
    setAlternatives([]);
    setShowAlternatives(false);
    setCurrentGoal(finalGoal);

    try {
      const res = await fetch('/api/stacking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: finalGoal }),
      });

      if (!res.ok) throw new Error('Failed to generate technique stack.');

      const data = await res.json();
      setPrimaryStack(data.primary || null);
      setAlternatives(data.alternatives || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (stack: Stack) => {
    const label = saveLabel.trim() || stack.name;
    const newSaved: SavedStack = {
      id: Date.now().toString(),
      label,
      goal: currentGoal,
      stack,
      savedAt: new Date().toISOString(),
    };
    const updated = [newSaved, ...savedStacks];
    setSavedStacks(updated);
    saveSavedStacks(updated);
    setShowSaveInput(false);
    setSaveLabel('');
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedStacks.filter((s) => s.id !== id);
    setSavedStacks(updated);
    saveSavedStacks(updated);
  };

  const loadSavedStack = (saved: SavedStack) => {
    setPrimaryStack(saved.stack);
    setAlternatives([]);
    setShowAlternatives(false);
    setCurrentGoal(saved.goal);
    setShowSaved(false);
  };

  const renderStack = (stack: Stack, isCurrent = true) => (
    <div className="space-y-1">
      {/* Stack header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono text-lg font-bold text-white">{stack.name}</h3>
          <p className="text-gray-500 text-xs italic">{stack.philosophy}</p>
        </div>
        {isCurrent && (
          <button
            onClick={() => {
              if (showSaveInput) {
                handleSave(stack);
              } else {
                setShowSaveInput(true);
              }
            }}
            className="text-xs font-mono text-gray-500 hover:text-[#D4A017] transition-colors border border-[#333] hover:border-[#D4A017] px-3 py-1.5 rounded"
          >
            {showSaveInput ? 'Confirm Save' : 'Save Stack'}
          </button>
        )}
      </div>

      {showSaveInput && isCurrent && (
        <div className="mb-4">
          <input
            type="text"
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder={stack.name}
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4A017] transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(stack);
            }}
          />
        </div>
      )}

      {/* Steps */}
      <div className="relative">
        {stack.steps.map((step, idx) => (
          <div key={step.stepNumber} className="relative">
            {/* Connecting line */}
            {idx < stack.steps.length - 1 && (
              <div className="absolute left-[18px] top-[44px] bottom-0 w-px bg-[#333333]" />
            )}

            <div className="flex gap-4 pb-6">
              {/* Step number circle */}
              <div className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-[#D4A017] flex items-center justify-center z-10">
                <span className="font-mono font-bold text-[#0A0A0A] text-sm">
                  {step.stepNumber}
                </span>
              </div>

              {/* Step content */}
              <div className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 hover:border-[#D4A017]/30 transition-colors">
                {/* Technique name */}
                <Link
                  href={`/app/library/${techniqueSlug(step.technique)}`}
                  className="font-mono font-bold text-[#D4A017] text-sm uppercase tracking-wider hover:underline"
                >
                  {step.technique}
                </Link>

                {/* Action */}
                <p className="text-white text-sm mt-2 leading-relaxed">
                  {step.action}
                </p>

                {/* Rationale */}
                <p className="text-gray-500 text-xs mt-2 italic">
                  {step.rationale}
                </p>

                {/* Branching */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-green-900/10 border border-green-900/30 rounded px-2.5 py-1.5">
                    <span className="text-green-400 text-xs font-mono block mb-0.5">
                      If positive:
                    </span>
                    <span className="text-green-300/70 text-xs">{step.ifPositive}</span>
                  </div>
                  <div className="bg-red-900/10 border border-red-900/30 rounded px-2.5 py-1.5">
                    <span className="text-red-400 text-xs font-mono block mb-0.5">
                      If resist:
                    </span>
                    <span className="text-red-300/70 text-xs">{step.ifResist}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
          <span className="text-[#D4A017]">{'\u{1F9E9}'}</span> Technique Stacking
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Combine techniques in sequence for maximum impact. Visual flowcharts with branching paths.
        </p>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Goal Selector */}
      <div className="space-y-4">
        <label className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold block">
          What are you trying to do?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_GOALS.map((g) => (
            <button
              key={g}
              onClick={() => {
                setGoal(g);
                setCustomGoal('');
              }}
              className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                goal === g
                  ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                  : 'border-[#333333] bg-[#1A1A1A] text-gray-300 hover:border-[#555]'
              }`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setGoal('custom')}
            className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
              goal === 'custom'
                ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                : 'border-[#333333] bg-[#1A1A1A] text-gray-300 hover:border-[#555]'
            }`}
          >
            Custom...
          </button>
        </div>

        {goal === 'custom' && (
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Describe your goal..."
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4A017] transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customGoal.trim()) generateStack();
            }}
          />
        )}

        <button
          onClick={generateStack}
          disabled={
            isLoading || (!goal || (goal === 'custom' && !customGoal.trim()))
          }
          className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Generating...' : 'Generate Stack'}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg">
          <div className="animate-pulse space-y-2">
            <p className="font-mono text-lg text-[#D4A017]">BUILDING TECHNIQUE STACK...</p>
            <p className="text-sm text-gray-500">
              Analyzing optimal technique sequences for &ldquo;{currentGoal}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Primary Stack */}
      {primaryStack && !isLoading && (
        <div className="bg-[#111] border border-[#D4A017]/30 rounded-lg p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-[#D4A017] mb-4">
            Primary Stack for: {currentGoal}
          </p>
          {renderStack(primaryStack)}
        </div>
      )}

      {/* Alternatives */}
      {primaryStack && alternatives.length > 0 && !isLoading && (
        <div>
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full py-3 bg-[#1A1A1A] border border-[#333333] text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
          >
            {showAlternatives ? 'Hide Alternatives' : 'Want a different approach?'}
          </button>

          {showAlternatives && (
            <div className="mt-4 space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                {alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveAlternative(idx)}
                    className={`flex-1 py-2 rounded-lg border transition-all font-mono text-xs uppercase tracking-wider ${
                      activeAlternative === idx
                        ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                        : 'border-[#333333] bg-[#1A1A1A] text-gray-500 hover:border-[#555]'
                    }`}
                  >
                    {alt.name}
                  </button>
                ))}
              </div>

              {/* Active alternative */}
              <div className="bg-[#111] border border-[#333333] rounded-lg p-5">
                {renderStack(alternatives[activeAlternative], false)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Stacks */}
      <div className="border-t border-[#222] pt-6">
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gray-500 hover:text-[#D4A017] transition-colors"
        >
          <span
            className={`inline-block transition-transform ${showSaved ? 'rotate-90' : ''}`}
          >
            {'\u25B6'}
          </span>
          Saved Stacks ({savedStacks.length})
        </button>

        {showSaved && (
          <div className="mt-4 space-y-2">
            {savedStacks.length === 0 && (
              <p className="text-gray-600 text-sm">No saved stacks yet. Generate one and save it.</p>
            )}
            {savedStacks.map((saved) => (
              <div
                key={saved.id}
                className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 flex items-center justify-between hover:border-[#555] transition-colors"
              >
                <button
                  onClick={() => loadSavedStack(saved)}
                  className="text-left flex-1"
                >
                  <p className="text-white text-sm font-mono">{saved.label}</p>
                  <p className="text-gray-600 text-xs">
                    {saved.goal} -- {new Date(saved.savedAt).toLocaleDateString()}
                  </p>
                </button>
                <button
                  onClick={() => handleDeleteSaved(saved.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs ml-3 font-mono"
                >
                  [DEL]
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
