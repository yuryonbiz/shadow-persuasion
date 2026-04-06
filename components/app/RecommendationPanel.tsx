'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Loader2, Target } from 'lucide-react';
import { getWeakAreas } from '@/lib/progress';

type Recommendation = {
  techniqueId: string;
  techniqueName: string;
  reason: string;
  priority: 'High' | 'Medium';
  relatedGoal: string;
};

const GOAL_CATEGORIES = [
  'Negotiation',
  'Authority',
  'Relationships',
  'Business',
  'Difficult Situations',
];

const STORAGE_KEY = 'shadow-user-goal';

export function RecommendationPanel() {
  const [goal, setGoal] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setGoal(stored);
    }
  }, []);

  useEffect(() => {
    if (goal && mounted) {
      fetchRecommendations(goal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, mounted]);

  async function fetchRecommendations(userGoal: string) {
    setLoading(true);
    setError(null);
    try {
      const weakAreas = getWeakAreas();
      const recentRaw = localStorage.getItem('shadow-missions-data');
      const missions = recentRaw ? JSON.parse(recentRaw) : { completed: [] };
      const recentTechniques = (missions.completed || [])
        .slice(-5)
        .map((m: any) => m.techniqueId)
        .filter(Boolean);

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userGoal, recentTechniques, weakAreas }),
      });

      if (!res.ok) throw new Error('Failed to fetch recommendations');

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error('Recommendation fetch error:', e);
      setError('Could not load recommendations. Try again later.');
    } finally {
      setLoading(false);
    }
  }

  function selectGoal(selectedGoal: string) {
    localStorage.setItem(STORAGE_KEY, selectedGoal);
    setGoal(selectedGoal);
  }

  if (!mounted) return null;

  // Goal picker
  if (!goal) {
    return (
      <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#333333]">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-[#D4A017]" />
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-400">
            Set Your Goal
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Choose your primary focus to get personalized technique recommendations.
        </p>
        <div className="flex flex-wrap gap-2">
          {GOAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectGoal(cat)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[#333333] text-gray-300 hover:border-[#D4A017] hover:text-[#D4A017] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#333333]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D4A017]" />
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-400">
            Recommended for You
          </h3>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setGoal(null);
            setRecommendations([]);
          }}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Change goal
        </button>
      </div>
      <p className="text-xs text-gray-600 mb-4">
        Based on your goal: <span className="text-[#D4A017]">{goal}</span>
      </p>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#D4A017]" />
          <span className="ml-2 text-sm text-gray-500">Analyzing your profile...</span>
        </div>
      )}

      {error && (
        <div className="py-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => fetchRecommendations(goal)}
            className="mt-2 text-xs text-[#D4A017] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.slice(0, 5).map((rec, i) => (
            <Link
              key={rec.techniqueId || i}
              href={`/app/library/${rec.techniqueId}`}
              className="block p-4 rounded-lg bg-[#0A0A0A] border border-[#252525] hover:border-[#D4A017]/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-[#D4A017] transition-colors">
                      {rec.techniqueName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        rec.priority === 'High'
                          ? 'bg-[#D4A017]/20 text-[#D4A017]'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{rec.reason}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-[#D4A017] transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500">No recommendations yet. Complete some activities first.</p>
        </div>
      )}
    </div>
  );
}
