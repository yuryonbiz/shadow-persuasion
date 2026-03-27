'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Scenario } from '@/lib/scenarios';

interface ScenarioCardProps {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Link href={`/app/scenarios/${scenario.id}`} className="block p-5 bg-[#1A1A1A] rounded-xl border border-[#333333] transition-all hover:border-[#D4A017] hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono uppercase bg-[#D4A017]/20 text-[#D4A017] px-2 py-1 rounded-full">{scenario.category}</span>
        <div className="flex">
            {[...Array(3)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < scenario.difficulty ? 'text-[#D4A017] fill-current' : 'text-gray-600'}`} />
            ))}
        </div>
      </div>
      <h3 className="text-lg font-bold mt-3">{scenario.title}</h3>
      <p className="text-sm text-gray-400 mt-1">{scenario.description}</p>
    </Link>
  );
}
