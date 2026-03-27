'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Technique } from '@/lib/techniques';

interface TechniqueCardProps {
  technique: Technique;
}

export function TechniqueCard({ technique }: TechniqueCardProps) {
  return (
    <Link href={`/app/library/${technique.id}`} className="block p-5 bg-[#1A1A1A] rounded-xl border border-[#333333] transition-all hover:border-[#D4A017] hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono uppercase bg-[#D4A017]/20 text-[#D4A017] px-2 py-1 rounded-full">{technique.category}</span>
         <div className="flex">
            {[...Array(3)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < technique.difficulty ? 'text-[#D4A017] fill-current' : 'text-gray-600'}`} />
            ))}
        </div>
      </div>
      <h3 className="text-lg font-bold mt-3">{technique.name}</h3>
      <p className="text-sm text-gray-400 mt-1">{technique.description}</p>
    </Link>
  );
}
