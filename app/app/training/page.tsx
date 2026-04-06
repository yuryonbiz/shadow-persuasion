'use client';

import { useState } from 'react';
import { scenarios, Scenario } from '@/lib/scenarios';
import { ScenarioCard } from '@/components/app/ScenarioCard';

const categories = ['All', 'Career', 'Relationships', 'Sales', 'Social', 'Defense'];

export default function TrainingArenaPage() {
  const [filter, setFilter] = useState('All');

  const filteredScenarios = filter === 'All'
    ? scenarios
    : scenarios.filter(s => s.category === filter);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Training Arena
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Select a scenario to begin your simulation.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map(scenario => (
          <ScenarioCard key={scenario.id} scenario={scenario} basePath="/app/training" />
        ))}
      </div>
    </div>
  );
}
