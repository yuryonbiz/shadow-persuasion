'use client';

import { useState, useEffect, useMemo } from 'react';
import { ScenarioCard } from '@/components/app/ScenarioCard';
import { Star, Loader2, Plus, X, Check, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTaxonomy, TaxonomyCategory } from '@/lib/hooks/useTaxonomy';
import { getCategoryIcon } from '@/lib/category-icons';

// Map old scenario category names to taxonomy category IDs
const CATEGORY_TO_TAXONOMY: Record<string, string> = {
  Career: 'career',
  Sales: 'business',
  Relationships: 'relationships',
  Social: 'relationships',
  Defense: 'defense',
};

import { useAdmin } from '@/lib/hooks/useAdmin';

type Scenario = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  description: string;
  objective: string;
  techniques: string[];
  is_generated?: boolean;
};

const difficultyLevels = [
  { value: 0, label: 'All' },
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
];

export default function TrainingArenaPage() {
  const { user } = useAuth();
  const isAdmin = useAdmin();
  const { categories: taxonomyCategories, loading: taxonomyLoading } = useTaxonomy();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [difficulty, setDifficulty] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'config' | 'loading' | 'preview'>('config');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [generateCount, setGenerateCount] = useState(5);
  const [generatedScenarios, setGeneratedScenarios] = useState<Scenario[]>([]);
  const [checkedScenarios, setCheckedScenarios] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/scenarios/list')
      .then(res => res.json())
      .then(data => setScenarios(data.scenarios || []))
      .catch(err => console.error('Failed to fetch scenarios:', err))
      .finally(() => setLoading(false));
  }, []);

  // Pre-filter from onboarding context
  useEffect(() => {
    const onboardingFilter = sessionStorage.getItem('onboarding-training-filter');
    if (onboardingFilter) {
      sessionStorage.removeItem('onboarding-training-filter');
      setFilter(onboardingFilter);
    }
  }, []);

  // Use taxonomy categories for filter tabs
  const categories = useMemo(() => {
    return ['All', ...taxonomyCategories.map(c => c.id)];
  }, [taxonomyCategories]);

  // Build display label map: category id -> name (icons rendered inline)
  const categoryLabels = useMemo(() => {
    const map: Record<string, string> = { All: 'All' };
    for (const c of taxonomyCategories) {
      map[c.id] = c.name;
    }
    return map;
  }, [taxonomyCategories]);

  const filteredScenarios = scenarios.filter(s => {
    if (filter === 'All') {
      return difficulty === 0 || s.difficulty === difficulty;
    }
    // Map old scenario category to taxonomy ID, then compare
    const scenarioTaxId = CATEGORY_TO_TAXONOMY[s.category] || s.category.toLowerCase();
    const categoryMatch = scenarioTaxId === filter;
    const difficultyMatch = difficulty === 0 || s.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });

  const openModal = () => {
    // Pre-check the current filter category, or all if on "All"
    if (filter === 'All') {
      setSelectedCategories(taxonomyCategories.map(c => c.id));
    } else {
      setSelectedCategories([filter]);
    }
    setGenerateCount(5);
    setGeneratedScenarios([]);
    setCheckedScenarios(new Set());
    setModalStep('config');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === taxonomyCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(taxonomyCategories.map(c => c.id));
    }
  };

  const handleGenerate = async () => {
    setModalStep('loading');
    try {
      const res = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          count: generateCount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newScenarios: Scenario[] = data.scenarios || [];
        setGeneratedScenarios(newScenarios);
        setCheckedScenarios(new Set(newScenarios.map(s => s.id)));
        setModalStep('preview');
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Failed to generate scenarios:', data.error);
        setModalStep('config');
      }
    } catch (err) {
      console.error('Error generating scenarios:', err);
      setModalStep('config');
    }
  };

  const toggleScenarioCheck = (id: string) => {
    setCheckedScenarios(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveSelected = async () => {
    const toSave = generatedScenarios.filter(s => checkedScenarios.has(s.id));
    if (toSave.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', scenarios: toSave }),
      });
      if (res.ok) {
        const data = await res.json();
        const savedScenarios: Scenario[] = data.scenarios || toSave;
        setScenarios(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const unique = savedScenarios.filter(s => !existingIds.has(s.id));
          return [...prev, ...unique];
        });
        setSuccessMessage(`${savedScenarios.length} scenario${savedScenarios.length > 1 ? 's' : ''} saved successfully!`);
        setTimeout(() => setSuccessMessage(null), 4000);
        closeModal();
      } else {
        console.error('Failed to save scenarios');
      }
    } catch (err) {
      console.error('Error saving scenarios:', err);
    } finally {
      setSaving(false);
    }
  };

  const difficultyLabel = (d: number) =>
    d === 1 ? 'Beginner' : d === 2 ? 'Intermediate' : d === 3 ? 'Advanced' : 'Unknown';

  if (loading || taxonomyLoading) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
            Training Arena
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Loading scenarios...</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
            Training Arena
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Select a scenario to begin your simulation.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase bg-[#D4A017] text-[#0A0A0A] rounded-lg hover:bg-[#E8B030] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Generate New Scenarios
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-[#333333] pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors
              ${filter === category
                ? 'bg-[#D4A017] text-[#0A0A0A]'
                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#222222]'}
            `}
          >
            {category !== 'All' && (() => { const Icon = getCategoryIcon(category); return <Icon className="h-4 w-4 inline-block mr-1" />; })()}
            {categoryLabels[category] || category}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Difficulty:</span>
        {difficultyLevels.map(level => (
          <button
            key={level.value}
            onClick={() => setDifficulty(level.value)}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full font-semibold transition-colors
              ${difficulty === level.value
                ? 'bg-[#D4A017] text-[#0A0A0A]'
                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#222222]'}
            `}
          >
            {level.value > 0 && (
              <span className="flex">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < level.value ? 'text-[#D4A017] fill-current' : 'text-gray-400'} ${difficulty === level.value && i < level.value ? 'text-[#0A0A0A] fill-current' : ''}`} />
                ))}
              </span>
            )}
            {level.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map(scenario => (
          <ScenarioCard key={scenario.id} scenario={scenario} basePath="/app/training" />
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No scenarios found for this filter.</p>
        </div>
      )}

      {/* Success toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg font-semibold text-sm animate-in slide-in-from-bottom-4">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Generate Scenarios Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Config step */}
            {modalStep === 'config' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-mono uppercase tracking-wider">
                    Generate New Training Scenarios
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    AI will create practice scenarios based on your knowledge base
                  </p>
                </div>

                {/* Category checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono uppercase text-gray-500 dark:text-gray-400">Categories</span>
                    <button
                      onClick={toggleAllCategories}
                      className="text-xs font-semibold text-[#D4A017] hover:text-[#E8B030] transition-colors"
                    >
                      {selectedCategories.length === taxonomyCategories.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {taxonomyCategories.map(cat => {
                      const Icon = getCategoryIcon(cat.id);
                      const checked = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border
                            ${checked
                              ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                              : 'border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-[#555555]'}
                          `}
                        >
                          {checked ? <CheckSquare className="h-4 w-4 shrink-0" /> : <Square className="h-4 w-4 shrink-0" />}
                          <Icon className="h-4 w-4 shrink-0" />
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Count selector */}
                <div className="space-y-3">
                  <span className="text-sm font-mono uppercase text-gray-500 dark:text-gray-400">How many scenarios?</span>
                  <div className="flex gap-2">
                    {[3, 5, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setGenerateCount(n)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-colors
                          ${generateCount === n
                            ? 'bg-[#D4A017] text-[#0A0A0A]'
                            : 'border border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-[#555555]'}
                        `}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={selectedCategories.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase font-bold bg-[#D4A017] text-[#0A0A0A] rounded-lg hover:bg-[#E8B030] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Generate {generateCount} Scenarios
                </button>
              </div>
            )}

            {/* Loading step */}
            {modalStep === 'loading' && (
              <div className="p-6 flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#D4A017]" />
                <p className="text-gray-400 text-sm font-mono">
                  Generating scenarios from your knowledge base...
                </p>
              </div>
            )}

            {/* Preview step */}
            {modalStep === 'preview' && (
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold font-mono uppercase tracking-wider">
                    Preview Generated Scenarios
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {generatedScenarios.length} scenario{generatedScenarios.length !== 1 ? 's' : ''} generated.
                    Select which to save.
                  </p>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {generatedScenarios.map(s => {
                    const checked = checkedScenarios.has(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleScenarioCheck(s.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-colors
                          ${checked
                            ? 'border-[#D4A017] bg-[#D4A017]/5'
                            : 'border-gray-200 dark:border-[#333333] opacity-60'}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {checked
                              ? <CheckSquare className="h-5 w-5 text-[#D4A017]" />
                              : <Square className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">{s.title}</span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-[#D4A017]/20 text-[#D4A017] font-semibold">
                                {s.category}
                              </span>
                              <span className="flex items-center gap-0.5">
                                {[...Array(3)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < s.difficulty ? 'text-[#D4A017] fill-current' : 'text-gray-600'}`} />
                                ))}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{s.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveSelected}
                    disabled={checkedScenarios.size === 0 || saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase font-bold bg-[#D4A017] text-[#0A0A0A] rounded-lg hover:bg-[#E8B030] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {saving ? 'Saving...' : `Save Selected (${checkedScenarios.size})`}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-mono uppercase font-bold border border-gray-200 dark:border-[#333333] text-gray-400 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Discard All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
