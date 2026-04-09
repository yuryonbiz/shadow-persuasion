'use client';

import { useState, useEffect, useMemo } from 'react';
import { ScenarioCard } from '@/components/app/ScenarioCard';
import { Star, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const ADMIN_EMAILS = ['ybyalik@gmail.com'];

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
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [difficulty, setDifficulty] = useState(0);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/scenarios/list')
      .then(res => res.json())
      .then(data => setScenarios(data.scenarios || []))
      .catch(err => console.error('Failed to fetch scenarios:', err))
      .finally(() => setLoading(false));
  }, []);

  // Derive categories dynamically from fetched data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(scenarios.map(s => s.category))).sort();
    return ['All', ...cats];
  }, [scenarios]);

  const filteredScenarios = scenarios.filter(s => {
    const categoryMatch = filter === 'All' || s.category === filter;
    const difficultyMatch = difficulty === 0 || s.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: filter !== 'All' ? filter : undefined,
          count: 3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newScenarios = data.scenarios || [];
        setScenarios(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const unique = newScenarios.filter((s: Scenario) => !existingIds.has(s.id));
          return [...prev, ...unique];
        });
      } else {
        console.error('Failed to generate scenarios');
      }
    } catch (err) {
      console.error('Error generating scenarios:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
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
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase bg-[#D4A017] text-[#0A0A0A] rounded-lg hover:bg-[#E8B030] transition-colors disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {generating ? 'Generating...' : 'Generate New Scenarios'}
          </button>
        )}
      </header>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-[#333333] pb-2">
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
            {category}
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
    </div>
  );
}
