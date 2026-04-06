'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, RotateCcw, CheckCircle2 } from 'lucide-react';
import { techniques } from '@/lib/techniques';
import { TechniqueCard } from '@/components/app/TechniqueCard';
import { getDueCards, getAllCards, getNextReviewDate, type SRCard } from '@/lib/spaced-repetition';

const categories = ['All', 'Influence', 'Negotiation', 'Rapport', 'Framing', 'Defense'];

export default function LibraryPage() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dueCards, setDueCards] = useState<SRCard[]>([]);
  const [cardStatusMap, setCardStatusMap] = useState<Record<string, SRCard['status']>>({});
  const [nextReview, setNextReview] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const due = getDueCards();
    setDueCards(due);
    setNextReview(getNextReviewDate());

    const allCards = getAllCards();
    const statusMap: Record<string, SRCard['status']> = {};
    for (const card of allCards) {
      statusMap[card.techniqueId] = card.status;
    }
    setCardStatusMap(statusMap);
  }, []);

  const filteredTechniques = techniques
    .filter(t => filter === 'All' || t.category === filter)
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Technique Library
        </h1>
        <p className="text-gray-400 mt-1">{"The operator's manual for influence."}</p>
      </header>

      {/* Due for Review Section */}
      {mounted && (
        <section className="p-5 bg-[#1A1A1A] rounded-xl border border-[#333333]">
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="h-4 w-4 text-[#D4A017]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-400">
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
                  <>Next review: <span className="text-gray-400">{new Date(nextReview).toLocaleDateString()}</span></>
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
                  href={`/app/library/${card.techniqueId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#252525] hover:border-[#D4A017]/50 transition-all group"
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

      <div className="flex flex-col md:flex-row gap-4">
        <input
            type="text"
            placeholder="Search techniques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 bg-[#222222] rounded-lg border border-[#333333] focus:ring-2 focus:ring-[#D4A017]"
        />
        <div className="flex-1 flex items-center space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors whitespace-nowrap
                  ${filter === category
                    ? 'bg-[#D4A017] text-[#0A0A0A]'
                    : 'bg-transparent hover:bg-[#222222]'}
                `}
              >
                {category}
              </button>
            ))}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechniques.map(technique => (
          <TechniqueCard
            key={technique.id}
            technique={technique}
            srStatus={mounted ? cardStatusMap[technique.id] : undefined}
          />
        ))}
      </div>
    </div>
  );
}
