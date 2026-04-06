'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Technique } from '@/lib/techniques';

type SRStatus = 'not-started' | 'learning' | 'due' | 'mastered';

interface TechniqueCardProps {
  technique: Technique;
  href?: string;
  srStatus?: SRStatus;
}

const STATUS_COLORS: Record<SRStatus, string> = {
  mastered: 'bg-green-400',
  learning: 'bg-yellow-400',
  due: 'bg-red-400',
  'not-started': 'bg-gray-600',
};

const STATUS_LABELS: Record<SRStatus, string> = {
  mastered: 'Mastered',
  learning: 'Learning',
  due: 'Due for review',
  'not-started': 'Not started',
};

export function TechniqueCard({ technique, href, srStatus }: TechniqueCardProps) {
  return (
    <Link href={href || `/app/library/${technique.id}`} className="block p-5 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333333] transition-all hover:border-[#D4A017] hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase bg-[#D4A017]/20 text-[#D4A017] px-2 py-1 rounded-full">{technique.category}</span>
          {srStatus && (
            <span
              className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[srStatus]} shrink-0`}
              title={STATUS_LABELS[srStatus]}
            />
          )}
        </div>
         <div className="flex">
            {[...Array(3)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < technique.difficulty ? 'text-[#D4A017] fill-current' : 'text-gray-600'}`} />
            ))}
        </div>
      </div>
      <h3 className="text-lg font-bold mt-3">{technique.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{technique.description}</p>
    </Link>
  );
}
