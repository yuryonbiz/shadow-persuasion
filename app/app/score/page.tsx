'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, TrendingUp, Flame, BookOpen, FileText, Swords, Target, ChevronDown, ChevronUp, Zap } from 'lucide-react';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type ActivityEntry = {
  label: string;
  xp: number;
  ts: number; // epoch ms
};

type MissionsData = {
  completed?: { id: string; completedAt: string; techniqueId?: string }[];
  streak?: number;
};

type JournalEntry = {
  id: string;
  createdAt: string;
  techniques?: string[];
  interactions?: { id: string }[];
};

type SparringSession = {
  id: string;
  completedAt: string;
  score: number; // 0-100
  techniqueId?: string;
};

type ProfilerEntry = {
  id: string;
  createdAt: string;
};

type SubScoreKey = 'rapport' | 'negotiation' | 'persuasion' | 'conflict' | 'defense' | 'reading';

/* ────────────────────────────────────────────
   Technique → Category mapping
   ──────────────────────────────────────────── */

const TECHNIQUE_CATEGORY_MAP: Record<string, SubScoreKey> = {
  // Rapport
  mirroring: 'rapport',
  labeling: 'rapport',
  'tactical-empathy': 'rapport',
  'void-pull': 'rapport',
  'strategic-vulnerability': 'rapport',
  // Negotiation
  anchoring: 'negotiation',
  'door-in-the-face': 'negotiation',
  'contrast-principle': 'negotiation',
  'the-takeaway': 'negotiation',
  // Persuasion (Influence)
  reciprocity: 'persuasion',
  'scarcity-frame': 'persuasion',
  'social-proof': 'persuasion',
  'commitment-consistency': 'persuasion',
  'emotional-hijacking': 'persuasion',
  'cognitive-overload': 'persuasion',
  // Conflict (Framing)
  'frame-control': 'conflict',
  'pattern-interruption': 'conflict',
  reframing: 'conflict',
  'authority-positioning': 'conflict',
  // Defense
  'accusation-audit': 'defense',
};

const SUB_SCORE_META: { key: SubScoreKey; label: string; icon: typeof Trophy }[] = [
  { key: 'rapport', label: 'Rapport', icon: Trophy },
  { key: 'negotiation', label: 'Negotiation', icon: TrendingUp },
  { key: 'persuasion', label: 'Persuasion', icon: Zap },
  { key: 'conflict', label: 'Conflict', icon: Flame },
  { key: 'defense', label: 'Defense', icon: Target },
  { key: 'reading', label: 'Reading People', icon: BookOpen },
];

const RANKS: { max: number; title: string }[] = [
  { max: 10, title: 'Civilian' },
  { max: 25, title: 'Observer' },
  { max: 40, title: 'Initiate' },
  { max: 55, title: 'Operative' },
  { max: 70, title: 'Specialist' },
  { max: 85, title: 'Handler' },
  { max: 100, title: 'Shadow Master' },
];

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function getRank(score: number): string {
  for (const r of RANKS) {
    if (score <= r.max) return r.title;
  }
  return 'Shadow Master';
}

function getScoreColor(score: number): string {
  if (score <= 30) return '#EF4444'; // red
  if (score <= 60) return '#EAB308'; // yellow
  return '#D4A017'; // gold
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ────────────────────────────────────────────
   Circular Progress Ring
   ──────────────────────────────────────────── */

function ScoreRing({ score, size = 220, stroke = 12 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp(score, 0, 100) / 100;
  const offset = circumference * (1 - progress);
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-[#1A1A1A]"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-black font-mono tabular-nums transition-colors duration-700"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs uppercase tracking-widest text-gray-500 mt-1">/ 100</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Sub-Score Bar
   ──────────────────────────────────────────── */

function SubScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Trophy }) {
  const pct = clamp(value, 0, 100);
  const color = getScoreColor(pct);

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-gray-500" />
      <span className="w-28 text-sm font-medium text-gray-300 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[#1A1A1A] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right text-xs font-mono tabular-nums text-gray-400">{pct}</span>
    </div>
  );
}

/* ────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────── */

export default function ScorePage() {
  const [mounted, setMounted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [score, setScore] = useState(0);
  const [subScores, setSubScores] = useState<Record<SubScoreKey, number>>({
    rapport: 0,
    negotiation: 0,
    persuasion: 0,
    conflict: 0,
    defense: 0,
    reading: 0,
  });
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([]);
  const [stats, setStats] = useState({
    totalXP: 0,
    streak: 0,
    techniquesMastered: 0,
    fieldReports: 0,
    sparringSessions: 0,
    missionsCompleted: 0,
  });
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState({
    thisMonthXP: 0,
    lastMonthXP: 0,
    strongestTechnique: 'None yet',
    weakestArea: 'None yet',
    recommendation: 'Complete your first activity to get personalized recommendations.',
  });

  const computeScores = useCallback(() => {
    const missions: MissionsData = safeParse('shadow-missions-data', { completed: [], streak: 0 });
    const journal: JournalEntry[] = safeParse('shadow-journal-data', []);
    const sparring: SparringSession[] = safeParse('shadow-sparring-data', []);
    const profiles: ProfilerEntry[] = safeParse('shadow-profiler-data', []);

    const completedMissions = missions.completed ?? [];
    const streak = missions.streak ?? 0;

    // ── Calculate total XP ──
    let xp = 0;
    const feed: ActivityEntry[] = [];
    const subXP: Record<SubScoreKey, number> = {
      rapport: 0,
      negotiation: 0,
      persuasion: 0,
      conflict: 0,
      defense: 0,
      reading: 0,
    };

    // Missions: +5 XP each
    for (const m of completedMissions) {
      const pts = 5;
      xp += pts;
      feed.push({ label: 'Completed Daily Mission', xp: pts, ts: new Date(m.completedAt).getTime() });
      if (m.techniqueId && TECHNIQUE_CATEGORY_MAP[m.techniqueId]) {
        subXP[TECHNIQUE_CATEGORY_MAP[m.techniqueId]] += pts;
      }
    }

    // Journal / Field reports: +10 XP each
    for (const entry of journal) {
      const pts = 10;
      xp += pts;
      feed.push({ label: 'Field Report logged', xp: pts, ts: new Date(entry.createdAt).getTime() });
      // Map technique tags to sub-scores
      if (entry.techniques) {
        for (const t of entry.techniques) {
          const cat = TECHNIQUE_CATEGORY_MAP[t];
          if (cat) subXP[cat] += 3;
        }
      }
      // Interactions logged: +3 XP each
      if (entry.interactions) {
        for (const _int of entry.interactions) {
          xp += 3;
          feed.push({ label: 'Interaction logged', xp: 3, ts: new Date(entry.createdAt).getTime() });
        }
      }
    }

    // Sparring: score/10 XP each
    for (const s of sparring) {
      const pts = Math.round(s.score / 10);
      xp += pts;
      feed.push({ label: `Sparring session (${s.score}/100)`, xp: pts, ts: new Date(s.completedAt).getTime() });
      if (s.techniqueId && TECHNIQUE_CATEGORY_MAP[s.techniqueId]) {
        subXP[TECHNIQUE_CATEGORY_MAP[s.techniqueId]] += pts;
      }
    }

    // Profiles: +5 XP each
    for (const p of profiles) {
      const pts = 5;
      xp += pts;
      feed.push({ label: 'Profile created', xp: pts, ts: new Date(p.createdAt).getTime() });
      subXP.reading += pts;
    }

    // Streak bonus
    if (streak > 0) {
      const bonus = streak * 2;
      xp += bonus;
      feed.push({ label: `Streak bonus (${streak} days)`, xp: bonus, ts: Date.now() });
    }

    // Sort feed by time descending, take last 10
    feed.sort((a, b) => b.ts - a.ts);
    const recentFeed = feed.slice(0, 10);

    // Score: XP maps to 0-100 (1000 XP = 100)
    const finalScore = clamp(Math.round((xp / 1000) * 100), 0, 100);

    // Sub-scores: normalize each to 0-100 (200 sub-XP = 100 in that category)
    const normalizedSub: Record<SubScoreKey, number> = { rapport: 0, negotiation: 0, persuasion: 0, conflict: 0, defense: 0, reading: 0 };
    for (const key of Object.keys(subXP) as SubScoreKey[]) {
      normalizedSub[key] = clamp(Math.round((subXP[key] / 200) * 100), 0, 100);
    }

    // Unique techniques used
    const allTechniques = new Set<string>();
    for (const m of completedMissions) {
      if (m.techniqueId) allTechniques.add(m.techniqueId);
    }
    for (const j of journal) {
      if (j.techniques) j.techniques.forEach((t) => allTechniques.add(t));
    }
    for (const s of sparring) {
      if (s.techniqueId) allTechniques.add(s.techniqueId);
    }

    // Monthly report
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    let thisMonthXP = 0;
    let lastMonthXP = 0;
    for (const f of feed) {
      if (f.ts >= thisMonthStart) thisMonthXP += f.xp;
      else if (f.ts >= lastMonthStart) lastMonthXP += f.xp;
    }

    // Strongest / weakest
    const subEntries = Object.entries(normalizedSub) as [SubScoreKey, number][];
    const sorted = [...subEntries].sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0][1] > 0 ? SUB_SCORE_META.find((m) => m.key === sorted[0][0])!.label : 'None yet';
    const weakest = sorted[sorted.length - 1][1] < 100
      ? SUB_SCORE_META.find((m) => m.key === sorted[sorted.length - 1][0])!.label
      : 'None yet';

    const recommendations: Record<SubScoreKey, string> = {
      rapport: 'Focus on Rapport techniques this month -- try mirroring and labeling exercises.',
      negotiation: 'Focus on Negotiation techniques this month -- practice anchoring and contrast.',
      persuasion: 'Focus on Persuasion techniques this month -- study reciprocity and social proof.',
      conflict: 'Focus on Conflict techniques this month -- work on frame control and reframing.',
      defense: 'Focus on Defense techniques this month -- practice the accusation audit.',
      reading: 'Focus on Reading People this month -- create more person profiles.',
    };

    const weakestKey = sorted[sorted.length - 1][0];
    const rec = xp > 0 ? recommendations[weakestKey] : 'Complete your first activity to get personalized recommendations.';

    setTotalXP(xp);
    setScore(finalScore);
    setSubScores(normalizedSub);
    setActivityFeed(recentFeed);
    setStats({
      totalXP: xp,
      streak,
      techniquesMastered: allTechniques.size,
      fieldReports: journal.length,
      sparringSessions: sparring.length,
      missionsCompleted: completedMissions.length,
    });
    setMonthlyReport({
      thisMonthXP,
      lastMonthXP,
      strongestTechnique: strongest,
      weakestArea: weakest,
      recommendation: rec,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    computeScores();
  }, [computeScores]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-gray-500 font-mono text-sm">LOADING SCORE DATA...</div>
      </div>
    );
  }

  const rank = getRank(score);
  const scoreColor = getScoreColor(score);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* ── Header ── */}
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
          <Trophy className="h-6 w-6 text-[#D4A017]" />
          Persuasion Score
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your aggregated influence rating across all operations.</p>
      </header>

      {/* ── Central Score Display ── */}
      <section className="flex flex-col items-center py-8">
        <ScoreRing score={score} />
        <div className="mt-4 text-center">
          <p
            className="text-lg font-bold font-mono uppercase tracking-widest transition-colors duration-700"
            style={{ color: scoreColor }}
          >
            {rank}
          </p>
          <p className="text-xs text-gray-500 mt-1">{totalXP.toLocaleString()} XP earned</p>
        </div>
      </section>

      {/* ── Sub-Scores ── */}
      <section className="p-6 bg-[#F5F2EB] dark:bg-[#1A1A1A] rounded-xl border border-[#E5E2DB] dark:border-[#333333]">
        <h2 className="text-sm font-bold font-mono uppercase tracking-wider mb-5 text-gray-400">Skill Breakdown</h2>
        <div className="space-y-4">
          {SUB_SCORE_META.map((s) => (
            <SubScoreBar key={s.key} label={s.label} value={subScores[s.key]} icon={s.icon} />
          ))}
        </div>
      </section>

      {/* ── Activity Feed ── */}
      <section className="p-6 bg-[#F5F2EB] dark:bg-[#1A1A1A] rounded-xl border border-[#E5E2DB] dark:border-[#333333]">
        <h2 className="text-sm font-bold font-mono uppercase tracking-wider mb-4 text-gray-400">Recent Activity</h2>
        {activityFeed.length === 0 ? (
          <div className="py-8 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500 text-sm">No activity yet. Complete missions, log field reports, or spar to earn XP.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activityFeed.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#E5E2DB]/50 dark:hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-[#D4A017]">+{entry.xp} XP</span>
                  <span className="text-sm text-gray-300">{entry.label}</span>
                </div>
                <span className="text-xs text-gray-600">{timeAgo(entry.ts)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total XP', value: stats.totalXP.toLocaleString(), icon: Zap },
          { label: 'Current Streak', value: `${stats.streak} days`, icon: Flame },
          { label: 'Techniques Mastered', value: stats.techniquesMastered, icon: BookOpen },
          { label: 'Field Reports', value: stats.fieldReports, icon: FileText },
          { label: 'Sparring Sessions', value: stats.sparringSessions, icon: Swords },
          { label: 'Missions Completed', value: stats.missionsCompleted, icon: Target },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 bg-[#F5F2EB] dark:bg-[#1A1A1A] rounded-xl border border-[#E5E2DB] dark:border-[#333333] text-center"
          >
            <s.icon className="h-5 w-5 mx-auto mb-2 text-gray-500" />
            <p className="text-xl font-bold font-mono">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Monthly Report Card ── */}
      <section className="bg-[#F5F2EB] dark:bg-[#1A1A1A] rounded-xl border border-[#E5E2DB] dark:border-[#333333] overflow-hidden">
        <button
          onClick={() => setMonthlyOpen((o) => !o)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-[#E5E2DB]/50 dark:hover:bg-[#252525] transition-colors"
        >
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-400">Monthly Report Card</h2>
          {monthlyOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            monthlyOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 space-y-4">
            {/* This vs Last Month */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#FAFAF8] dark:bg-[#0A0A0A]">
                <p className="text-xs text-gray-500 uppercase tracking-wider">This Month</p>
                <p className="text-2xl font-bold font-mono mt-1">{monthlyReport.thisMonthXP} <span className="text-sm text-gray-500">XP</span></p>
              </div>
              <div className="p-4 rounded-lg bg-[#FAFAF8] dark:bg-[#0A0A0A]">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Last Month</p>
                <p className="text-2xl font-bold font-mono mt-1">{monthlyReport.lastMonthXP} <span className="text-sm text-gray-500">XP</span></p>
              </div>
            </div>

            {/* Strongest / Weakest */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Strongest</p>
                <p className="text-sm font-medium text-[#D4A017]">{monthlyReport.strongestTechnique}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Weakest</p>
                <p className="text-sm font-medium text-[#EF4444]">{monthlyReport.weakestArea}</p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-4 rounded-lg bg-[#FAFAF8] dark:bg-[#0A0A0A] border border-dashed border-[#E5E2DB] dark:border-[#333333]">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Recommendation</p>
              <p className="text-sm text-gray-300">{monthlyReport.recommendation}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
