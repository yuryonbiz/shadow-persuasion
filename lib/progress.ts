'use client';

import { techniques } from '@/lib/techniques';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

export type TechniqueStat = {
  techniqueId: string;
  techniqueName: string;
  category: string;
  timesUsed: number;
  avgSuccess: number; // 0-100
  lastUsed: string | null;
};

export type ActivityItem = {
  type: 'mission' | 'journal' | 'sparring' | 'profiler' | 'stack' | 'feedback';
  label: string;
  date: string;
  techniqueId?: string;
};

export type ProgressData = {
  techniquesUsed: Map<string, TechniqueStat>;
  techniquesMastered: string[];
  scenariosCompleted: { count: number; list: string[] };
  totalPracticeTime: number; // estimated minutes
  streakData: { current: number; longest: number };
  weakAreas: string[];
  strongAreas: string[];
  recentActivity: ActivityItem[];
};

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getTechniqueName(id: string): string {
  const t = techniques.find((t) => t.id === id);
  return t ? t.name : id;
}

function getTechniqueCategory(id: string): string {
  const t = techniques.find((t) => t.id === id);
  return t ? t.category : 'Unknown';
}

/* ────────────────────────────────────────────
   Core Functions
   ──────────────────────────────────────────── */

export function getProgress(): ProgressData {
  const missions = safeParse<any>('shadow-missions-data', { completed: [], streak: 0 });
  const journal = safeParse<any[]>('shadow-journal-data', []);
  const sparring = safeParse<any[]>('shadow-sparring-data', []);
  const profiler = safeParse<any[]>('shadow-profiler-data', []);
  const stacks = safeParse<any[]>('shadow-stacks-data', []);
  const feedback = safeParse<any[]>('shadow-feedback-data', []);

  const completedMissions = missions.completed ?? [];
  const streak = missions.streak ?? 0;

  // Build technique usage map
  const techMap = new Map<string, { uses: number; successSum: number; lastUsed: string | null }>();

  const addTechUse = (id: string, success: number, date: string) => {
    const existing = techMap.get(id) || { uses: 0, successSum: 0, lastUsed: null };
    existing.uses += 1;
    existing.successSum += success;
    if (!existing.lastUsed || date > existing.lastUsed) existing.lastUsed = date;
    techMap.set(id, existing);
  };

  // Missions
  for (const m of completedMissions) {
    if (m.techniqueId) {
      addTechUse(m.techniqueId, 70, m.completedAt || new Date().toISOString());
    }
  }

  // Journal
  for (const entry of journal) {
    if (entry.techniques) {
      for (const t of entry.techniques) {
        addTechUse(t, 60, entry.createdAt || new Date().toISOString());
      }
    }
  }

  // Sparring
  for (const s of sparring) {
    if (s.techniqueId) {
      addTechUse(s.techniqueId, s.score ?? 50, s.completedAt || new Date().toISOString());
    }
  }

  // Feedback - track success/failure
  for (const f of feedback) {
    if (f.techniqueId) {
      const success = f.outcome === 'worked' ? 100 : f.outcome === 'partially' ? 50 : 10;
      addTechUse(f.techniqueId, success, f.createdAt || new Date().toISOString());
    }
  }

  // Build TechniqueStat map
  const techniquesUsed = new Map<string, TechniqueStat>();
  for (const [id, data] of techMap) {
    techniquesUsed.set(id, {
      techniqueId: id,
      techniqueName: getTechniqueName(id),
      category: getTechniqueCategory(id),
      timesUsed: data.uses,
      avgSuccess: Math.round(data.successSum / data.uses),
      lastUsed: data.lastUsed,
    });
  }

  // Mastered: 3+ successful uses
  const techniquesMastered = Array.from(techMap.entries())
    .filter(([, data]) => data.uses >= 3 && data.successSum / data.uses >= 60)
    .map(([id]) => id);

  // Scenarios completed
  const scenarioList = sparring.map((s: any) => s.scenarioId || s.id || 'unknown');
  const scenariosCompleted = { count: sparring.length, list: scenarioList };

  // Estimated practice time: ~5 min per mission, ~15 per journal, ~10 per sparring, ~5 per profile
  const totalPracticeTime =
    completedMissions.length * 5 +
    journal.length * 15 +
    sparring.length * 10 +
    profiler.length * 5 +
    stacks.length * 8;

  // Streak data
  const streakData = { current: streak, longest: Math.max(streak, safeParse<number>('shadow-longest-streak', 0)) };

  // Category success rates
  const categoryStats = new Map<string, { total: number; successSum: number }>();
  for (const [, stat] of techniquesUsed) {
    const existing = categoryStats.get(stat.category) || { total: 0, successSum: 0 };
    existing.total += stat.timesUsed;
    existing.successSum += stat.avgSuccess * stat.timesUsed;
    categoryStats.set(stat.category, existing);
  }

  const categoryRates = Array.from(categoryStats.entries())
    .map(([cat, data]) => ({ category: cat, rate: data.total > 0 ? data.successSum / data.total : 0 }))
    .sort((a, b) => a.rate - b.rate);

  const weakAreas = categoryRates.slice(0, 2).map((c) => c.category);
  const strongAreas = categoryRates
    .slice(-2)
    .reverse()
    .map((c) => c.category);

  // Recent activity
  const recentActivity: ActivityItem[] = [];

  for (const m of completedMissions) {
    recentActivity.push({
      type: 'mission',
      label: `Completed mission${m.techniqueId ? ': ' + getTechniqueName(m.techniqueId) : ''}`,
      date: m.completedAt || new Date().toISOString(),
      techniqueId: m.techniqueId,
    });
  }

  for (const entry of journal) {
    recentActivity.push({
      type: 'journal',
      label: 'Field report logged',
      date: entry.createdAt || new Date().toISOString(),
    });
  }

  for (const s of sparring) {
    recentActivity.push({
      type: 'sparring',
      label: `Sparring session (${s.score ?? 0}/100)`,
      date: s.completedAt || new Date().toISOString(),
      techniqueId: s.techniqueId,
    });
  }

  for (const p of profiler) {
    recentActivity.push({
      type: 'profiler',
      label: 'Profile created',
      date: p.createdAt || new Date().toISOString(),
    });
  }

  for (const st of stacks) {
    recentActivity.push({
      type: 'stack',
      label: 'Technique stack created',
      date: st.createdAt || new Date().toISOString(),
    });
  }

  for (const f of feedback) {
    recentActivity.push({
      type: 'feedback',
      label: `Feedback: ${f.outcome} - ${f.type}`,
      date: f.createdAt || new Date().toISOString(),
    });
  }

  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    techniquesUsed,
    techniquesMastered,
    scenariosCompleted,
    totalPracticeTime,
    streakData,
    weakAreas,
    strongAreas,
    recentActivity: recentActivity.slice(0, 20),
  };
}

export function getTechniqueStats(): TechniqueStat[] {
  const progress = getProgress();
  return Array.from(progress.techniquesUsed.values());
}

export function getWeakAreas(): string[] {
  return getProgress().weakAreas;
}

export function getStrongAreas(): string[] {
  return getProgress().strongAreas;
}

export function getRecentActivity(): ActivityItem[] {
  return getProgress().recentActivity;
}
