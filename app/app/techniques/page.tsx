'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, RotateCcw, CheckCircle2, Star } from 'lucide-react';
import { useTechniques, type APITechnique } from '@/lib/hooks/useTechniques';
import { type SRCard } from '@/lib/spaced-repetition';
import { useAuth } from '@/lib/auth-context';

// ── Library constants ──
const categories = ['All', 'Influence', 'Negotiation', 'Rapport', 'Framing', 'Defense'];

// ── Stacking types & helpers ──
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

function techniqueSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ══════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════

export default function TechniquesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'stacking'>('library');

  const getHeaders = useCallback(async () => {
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  return (
    <div className="space-y-6">
      {/* ── Tab toggle ── */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-[#222222] p-1 rounded-lg max-w-xs">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-mono font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'library'
              ? 'bg-[#D4A017] text-[#0A0A0A]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setActiveTab('stacking')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-mono font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'stacking'
              ? 'bg-[#D4A017] text-[#0A0A0A]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Stacking
        </button>
      </div>

      {activeTab === 'library' ? <LibraryTab getHeaders={getHeaders} /> : <StackingTab getHeaders={getHeaders} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Library Tab
// ══════════════════════════════════════════════════════════════════════

function LibraryTab({ getHeaders }: { getHeaders: () => Promise<Record<string, string>> }) {
  const { techniques: apiTechniques, loading: techniquesLoading } = useTechniques();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dueCards, setDueCards] = useState<SRCard[]>([]);
  const [cardStatusMap, setCardStatusMap] = useState<Record<string, SRCard['status']>>({});
  const [nextReview, setNextReview] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Format snake_case/slug categories into display names
  const formatCategory = (cat: string) => cat
    .split(/[_-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Map text difficulty to numeric for stars
  const difficultyToNum = (d: string | number): number => {
    if (typeof d === 'number') return d;
    const map: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
    return map[d?.toLowerCase()] || 1;
  };

  // Derive category list dynamically from API data
  const dynamicCategories = ['All', ...Array.from(new Set(apiTechniques.map(t => t.category))).sort()];
  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const loadCards = async () => {
      setMounted(true);
      try {
        const headers = await getHeaders();
        const [dueRes, allRes] = await Promise.all([
          fetch('/api/spaced-repetition?due=true', { headers }),
          fetch('/api/spaced-repetition', { headers }),
        ]);
        if (dueRes.ok) {
          const dueData = await dueRes.json();
          setDueCards(dueData.cards || []);
        }
        if (allRes.ok) {
          const allData = await allRes.json();
          const allCards: SRCard[] = allData.cards || [];
          const statusMap: Record<string, SRCard['status']> = {};
          for (const card of allCards) {
            statusMap[card.techniqueId] = card.status;
          }
          setCardStatusMap(statusMap);
          // Find next review date
          const today = new Date().toISOString().split('T')[0];
          let earliest: string | null = null;
          for (const card of allCards) {
            if (card.nextReviewDate > today) {
              if (!earliest || card.nextReviewDate < earliest) {
                earliest = card.nextReviewDate;
              }
            }
          }
          setNextReview(earliest);
        }
      } catch (e) {
        console.error('Failed to load spaced repetition data:', e);
      }
    };
    loadCards();
  }, [getHeaders]);

  const filteredTechniques = apiTechniques
    .filter(t => filter === 'All' || t.category === filter)
    .filter(t => difficultyFilter === 'All' || formatCategory(String(t.difficulty)) === difficultyFilter)
    .filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Techniques
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{"The operator's manual for influence."}</p>
      </header>

      {/* Due for Review */}
      {mounted && (
        <section className="p-5 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="h-4 w-4 text-[#D4A017]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Due for Review
            </h2>
            {dueCards.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500/20 text-red-400">
                {dueCards.length}
              </span>
            )}
          </div>

          {dueCards.length === 0 ? (
            <div className="flex items-center gap-2 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <p className="text-sm text-gray-500">
                All caught up!{' '}
                {nextReview ? (
                  <>Next review: <span className="text-gray-500 dark:text-gray-400">{new Date(nextReview).toLocaleDateString()}</span></>
                ) : (
                  'Start practicing techniques to build your review schedule.'
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {dueCards.map((card) => (
                <Link
                  key={card.techniqueId}
                  href={`/app/techniques/${card.techniqueId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#252525] hover:border-[#D4A017]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-[#D4A017] transition-colors">
                        {card.techniqueName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="text-[10px] text-gray-600">
                          Last reviewed: {card.lastReviewDate ? new Date(card.lastReviewDate).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium px-3 py-1 rounded-lg bg-[#D4A017]/10 text-[#D4A017] group-hover:bg-[#D4A017] group-hover:text-[#0A0A0A] transition-colors">
                    Practice Now
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Search & category filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search techniques..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 bg-gray-50 dark:bg-[#222222] rounded-lg border border-gray-200 dark:border-[#333333] focus:ring-2 focus:ring-[#D4A017]"
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {dynamicCategories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors whitespace-nowrap
                  ${filter === category
                    ? 'bg-[#D4A017] text-[#0A0A0A]'
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#222222]'}
                `}
              >
                {formatCategory(category)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {difficultyOptions.map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors whitespace-nowrap
                  ${difficultyFilter === d
                    ? 'bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]'
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#222222] border border-gray-200 dark:border-[#444]'}
                `}
              >
                {d === 'All' ? 'All Levels' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {techniquesLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333] animate-pulse">
              <div className="flex justify-between items-start">
                <div className="h-5 w-20 bg-gray-200 dark:bg-[#333] rounded-full" />
                <div className="flex gap-1">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 w-4 bg-gray-200 dark:bg-[#333] rounded" />
                  ))}
                </div>
              </div>
              <div className="h-5 w-36 bg-gray-200 dark:bg-[#333] rounded mt-3" />
              <div className="h-4 w-full bg-gray-200 dark:bg-[#333] rounded mt-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-[#333] rounded mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!techniquesLoading && apiTechniques.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333]">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Upload books in Admin to populate techniques</p>
        </div>
      )}

      {/* Cards grid */}
      {!techniquesLoading && filteredTechniques.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechniques.map(technique => (
            <Link
              key={technique.id}
              href={`/app/techniques/${technique.id}`}
              className="block p-5 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333] transition-all hover:border-[#D4A017] hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase bg-[#D4A017]/20 text-[#D4A017] px-2 py-1 rounded-full">{formatCategory(technique.category)}</span>
                  {mounted && cardStatusMap[technique.id] && (
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        cardStatusMap[technique.id] === 'mastered' ? 'bg-green-400' :
                        cardStatusMap[technique.id] === 'learning' ? 'bg-yellow-400' :
                        cardStatusMap[technique.id] === 'due' ? 'bg-red-400' : 'bg-gray-600'
                      }`}
                      title={cardStatusMap[technique.id]}
                    />
                  )}
                </div>
                <div className="flex">
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < difficultyToNum(technique.difficulty) ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold mt-3">{technique.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {technique.chunkCount} knowledge chunk{technique.chunkCount !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Stacking Tab
// ══════════════════════════════════════════════════════════════════════

function StackingTab({ getHeaders }: { getHeaders: () => Promise<Record<string, string>> }) {
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
    const loadSaved = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch('/api/stacking/saved', { headers });
        if (res.ok) {
          const data = await res.json();
          setSavedStacks(data.stacks || []);
        }
      } catch (e) {
        console.error('Failed to load saved stacks:', e);
      }
    };
    loadSaved();
  }, [getHeaders]);

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

  const handleSave = async (stack: Stack) => {
    const label = saveLabel.trim() || stack.name;
    const newSaved: SavedStack = {
      id: Date.now().toString(),
      label,
      goal: currentGoal,
      stack,
      savedAt: new Date().toISOString(),
    };
    setSavedStacks((prev) => [newSaved, ...prev]);
    setShowSaveInput(false);
    setSaveLabel('');
    try {
      const headers = await getHeaders();
      await fetch('/api/stacking/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(newSaved),
      });
    } catch (e) {
      console.error('Failed to save stack:', e);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    setSavedStacks((prev) => prev.filter((s) => s.id !== id));
    try {
      const headers = await getHeaders();
      await fetch(`/api/stacking/saved?id=${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      console.error('Failed to delete stack:', e);
    }
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
          <h3 className="font-mono text-lg font-bold text-gray-900 dark:text-white">{stack.name}</h3>
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
            className="text-xs font-mono text-gray-500 hover:text-[#D4A017] transition-colors border border-gray-200 dark:border-[#333] hover:border-[#D4A017] px-3 py-1.5 rounded"
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
            className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-2 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
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
            {idx < stack.steps.length - 1 && (
              <div className="absolute left-[18px] top-[44px] bottom-0 w-px bg-gray-200 dark:bg-[#333333]" />
            )}

            <div className="flex gap-4 pb-6">
              <div className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-[#D4A017] flex items-center justify-center z-10">
                <span className="font-mono font-bold text-[#0A0A0A] text-sm">
                  {step.stepNumber}
                </span>
              </div>

              <div className="flex-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 hover:border-[#D4A017]/30 transition-colors">
                <Link
                  href={`/app/techniques/${techniqueSlug(step.technique)}`}
                  className="font-mono font-bold text-[#D4A017] text-sm uppercase tracking-wider hover:underline"
                >
                  {step.technique}
                </Link>

                <p className="text-gray-900 dark:text-white text-sm mt-2 leading-relaxed">
                  {step.action}
                </p>

                <p className="text-gray-500 text-xs mt-2 italic">
                  {step.rationale}
                </p>

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
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Technique Stacking
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
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
        <label className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold block">
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
                  : 'border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-[#555]'
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
                : 'border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-[#555]'
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
            className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-3 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
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
        <div className="bg-gray-50 dark:bg-[#111] border border-[#D4A017]/30 rounded-lg p-5">
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
            className="w-full py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
          >
            {showAlternatives ? 'Hide Alternatives' : 'Want a different approach?'}
          </button>

          {showAlternatives && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                {alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveAlternative(idx)}
                    className={`flex-1 py-2 rounded-lg border transition-all font-mono text-xs uppercase tracking-wider ${
                      activeAlternative === idx
                        ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                        : 'border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1A1A1A] text-gray-500 hover:border-gray-400 dark:hover:border-[#555]'
                    }`}
                  >
                    {alt.name}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
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
                className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-3 flex items-center justify-between hover:border-gray-400 dark:hover:border-[#555] transition-colors"
              >
                <button
                  onClick={() => loadSavedStack(saved)}
                  className="text-left flex-1"
                >
                  <p className="text-gray-900 dark:text-white text-sm font-mono">{saved.label}</p>
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
