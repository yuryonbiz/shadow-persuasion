'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, MessageSquare, Swords, BookOpen, Flame, Zap, Target,
  Clock, ArrowRight, CheckCircle, FileText, MessageCircle,
  Briefcase, Heart, DollarSign, Shield, Star, Sparkles,
  Search, ChevronRight, Pencil,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTaxonomy, TaxonomyCategory } from '@/lib/hooks/useTaxonomy';
import { getCategoryIcon } from '@/lib/category-icons';
import { formatDate } from '@/lib/format-date';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface ProgressData {
  totalXP: number;
  streak: { current: number; longest: number };
  techniquesUsed: number;
  subScores: Record<string, number>;
  recentActivity: {
    type: string;
    label: string;
    date: string;
    techniqueId?: string;
  }[];
}

interface MissionCompletion {
  missionId?: number;
  date?: string;
  completed_at?: string;
  created_at?: string;
  xp_earned?: number;
  grade?: string;
  technique_id?: string;
}

interface ChatSession {
  id: string;
  title: string;
  session_type: string;
  updated_at: string;
  lastMessage?: string | null;
}

/* ────────────────────────────────────────────
   Mission Types (fetched from API)
   ──────────────────────────────────────────── */

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type MissionCategory = 'Influence' | 'Negotiation' | 'Rapport' | 'Framing' | 'Defense';

interface Mission {
  id: number;
  title: string;
  description: string;
  technique: string;
  category: MissionCategory;
  difficulty: Difficulty;
  xpReward: number;
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

const RANKS: { max: number; title: string }[] = [
  { max: 10, title: 'Civilian' },
  { max: 25, title: 'Observer' },
  { max: 40, title: 'Initiate' },
  { max: 55, title: 'Operative' },
  { max: 70, title: 'Specialist' },
  { max: 85, title: 'Handler' },
  { max: 100, title: 'Shadow Master' },
];

function getRank(score: number): string {
  for (const r of RANKS) if (score <= r.max) return r.title;
  return 'Shadow Master';
}

function getScoreColor(score: number): string {
  if (score <= 30) return '#EF4444';
  if (score <= 60) return '#EAB308';
  return '#D4A017';
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function getDailyMission(pool: Mission[], dateStr: string, completedIds?: Set<number>): Mission | null {
  if (pool.length === 0) return null;
  let availablePool = pool;
  if (completedIds && completedIds.size > 0) {
    const filtered = pool.filter(m => !completedIds.has(m.id));
    if (filtered.length > 0) availablePool = filtered;
    // If all completed, fall back to full pool
  }
  if (availablePool.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return availablePool[Math.abs(hash) % availablePool.length];
}


function getActivityIcon(type: string) {
  switch (type) {
    case 'mission': return Target;
    case 'journal': return FileText;
    case 'field_report': return FileText;
    case 'practice': return Swords;
    case 'scenario': return Swords;
    case 'feedback': return MessageCircle;
    case 'analysis': return Eye;
    default: return Zap;
  }
}

function getActivityLink(type: string): string {
  switch (type) {
    case 'analysis': return '/app/analyze';
    case 'mission': return '/app/field-ops';
    case 'practice':
    case 'scenario': return '/app/training';
    case 'journal':
    case 'field_report': return '/app/field-ops';
    case 'feedback': return '/app/score';
    default: return '/app';
  }
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  Intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/* ────────────────────────────────────────────
   Compact Score Ring
   ──────────────────────────────────────────── */

function CompactScoreRing({ score, size = 100, stroke = 8 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp(score, 0, 100) / 100;
  const offset = circumference * (1 - progress);
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={stroke}
          className="text-gray-200 dark:text-[#2A2A2A]"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black font-mono tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Loading Skeleton
   ──────────────────────────────────────────── */

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#2A2A2A] ${className}`} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome skeleton */}
      <div className="flex items-center gap-6 p-6 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333]">
        <Skeleton className="w-[100px] h-[100px] rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      {/* Mission skeleton */}
      <Skeleton className="h-44 w-full" />
      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
      {/* Activity skeleton */}
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

/* ────────────────────────────────────────────
   Onboarding Goals (fetched from taxonomy)
   ──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   Dashboard Page
   ──────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { categories: taxonomyCategories, loading: taxonomyLoading } = useTaxonomy();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [completions, setCompletions] = useState<MissionCompletion[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [missionPool, setMissionPool] = useState<Mission[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [lowPoolWarning, setLowPoolWarning] = useState(false);
  const [editingFocus, setEditingFocus] = useState(false);
  const [editGoals, setEditGoals] = useState<string[]>([]);
  const [savingFocusEdit, setSavingFocusEdit] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true); // assume true until we know
  const [selectedGoals, setSelectedGoals] = useState<TaxonomyCategory[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'goals' | 'useCases' | 'voice' | 'getStarted'>('goals');
  const [savingGoal, setSavingGoal] = useState(false);

  // Voice profile state
  const [voicePersonality, setVoicePersonality] = useState('');
  const [voiceStyle, setVoiceStyle] = useState('');
  const [voiceTones, setVoiceTones] = useState<string[]>([]);
  const [voiceSampleTexts, setVoiceSampleTexts] = useState('');
  const [savingVoice, setSavingVoice] = useState(false);

  // Completed mission IDs
  const completedIds = new Set(completions.map(c => c.missionId).filter((id): id is number => id !== undefined));

  // Difficulty progression
  const completionCount = completions.length;
  const difficultyFilter: Difficulty[] =
    completionCount < 6 ? ['Beginner'] :
    completionCount < 16 ? ['Beginner', 'Intermediate'] :
    ['Beginner', 'Intermediate', 'Advanced'];

  // Filtered pool: difficulty filter
  const filteredPool = missionPool.filter(m => difficultyFilter.includes(m.difficulty));

  // Today's mission
  const today = new Date().toISOString().split('T')[0];
  const dailyMission = getDailyMission(filteredPool, today, completedIds);

  // Check low pool
  const availableAfterCompleted = filteredPool.filter(m => !completedIds.has(m.id));
  const showLowPool = lowPoolWarning || availableAfterCompleted.length < 3;

  // Check if today's mission is completed
  const todayCompletion = dailyMission ? completions.find(c => {
    const completedDate = c.completed_at || c.created_at || c.date || '';
    return completedDate.startsWith(today) && (c.missionId === dailyMission.id);
  }) : null;

  // Compute persuasion score from totalXP (1000 XP = 100 score)
  const persuasionScore = progress ? clamp(Math.round((progress.totalXP / 1000) * 100), 0, 100) : 0;
  const rank = getRank(persuasionScore);

  // XP this week
  const weekAgo = Date.now() - 7 * 86400000;
  const weekXP = progress?.recentActivity
    ?.filter(a => new Date(a.date).getTime() > weekAgo)
    .length ?? 0;
  // Rough estimate: each activity ~ 10-50 XP average
  // Actually let's compute from completions for more accuracy
  const weekCompletionXP = completions
    .filter(c => {
      const d = new Date(c.completed_at || c.created_at || c.date || '').getTime();
      return d > weekAgo;
    })
    .reduce((sum, c) => sum + (c.xp_earned ?? 10), 0);

  useEffect(() => {
    if (authLoading) return;

    async function fetchData() {
      try {
        const token = await user?.getIdToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch user profile for goals
        let goals: string[] = [];
        if (user) {
          try {
            const profileRes = await fetch('/api/user', { headers });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              goals = profileData.profile?.goals || [];
              setUserGoals(goals);
              if (profileData.profile?.pressingUseCase) {
                setSelectedUseCase(profileData.profile.pressingUseCase);
              }
            }
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
          }
        }

        const poolUrl = goals.length > 0
          ? `/api/missions/pool?categories=${goals.join(',')}`
          : '/api/missions/pool';

        const [progressRes, completionsRes, conversationsRes, poolRes] = await Promise.all([
          fetch('/api/user/progress', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/missions/completions', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/conversations', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(poolUrl).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (progressRes) setProgress(progressRes);
        if (completionsRes?.completions) setCompletions(completionsRes.completions);
        if (conversationsRes?.sessions) setSessions(conversationsRes.sessions);
        if (poolRes?.missions) setMissionPool(poolRes.missions);

        // Check if onboarding was requested via settings or user is brand new
        const forceOnboarding = localStorage.getItem('shadow-force-onboarding') === 'true';
        if (forceOnboarding) {
          localStorage.removeItem('shadow-force-onboarding');
          setOnboardingComplete(false);
        } else {
          const hasActivity = (progressRes?.recentActivity?.length ?? 0) > 0;
          const hasSessions = (conversationsRes?.sessions?.length ?? 0) > 0;
          const hasXP = (progressRes?.totalXP ?? 0) > 0;
          if (!hasActivity && !hasSessions && !hasXP) {
            setOnboardingComplete(false);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  const displayName = user?.displayName?.split(' ')[0] || 'Operative';
  const streak = progress?.streak?.current ?? 0;
  const recentActivity = progress?.recentActivity?.slice(0, 5) ?? [];
  const recentSessions = sessions.slice(0, 2);

  /* ────────────────────────────────────────────
     Onboarding: save goal handler
     ──────────────────────────────────────────── */
  const handleToggleGoal = (category: TaxonomyCategory) => {
    setSelectedGoals(prev =>
      prev.find(g => g.id === category.id)
        ? prev.filter(g => g.id !== category.id)
        : [...prev, category]
    );
  };

  const handleGoalsConfirm = () => {
    // Collect top use cases from selected categories (up to 8)
    const useCasesFromSelected = selectedGoals.flatMap(c => c.useCases).slice(0, 8);
    if (useCasesFromSelected.length > 0) {
      setOnboardingStep('useCases');
    } else {
      // Skip use-case step if none available
      handleSaveGoals(null);
    }
  };

  const handleSaveGoals = async (useCase: string | null) => {
    setSelectedUseCase(useCase);
    setSavingGoal(true);
    try {
      const token = await user?.getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/user', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          goals: selectedGoals.map(g => g.id),
          pressingUseCase: useCase,
        }),
      });
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setSavingGoal(false);
      setOnboardingStep('voice');
    }
  };

  const handleVoiceSave = async () => {
    setSavingVoice(true);
    try {
      const token = await user?.getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const sampleTexts = voiceSampleTexts
        .split(/\n{2,}/)
        .map(s => s.trim())
        .filter(Boolean);

      await fetch('/api/user/voice-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          personality: voicePersonality,
          writingStyle: voiceStyle,
          tone: voiceTones.join(', '),
          sampleTexts,
        }),
      });
    } catch (err) {
      console.error('Failed to save voice profile:', err);
    } finally {
      setSavingVoice(false);
      setOnboardingStep('getStarted');
    }
  };

  const TONE_OPTIONS = ['Professional', 'Casual', 'Friendly', 'Direct', 'Diplomatic', 'Assertive', 'Warm'];

  const toggleTone = (tone: string) => {
    setVoiceTones(prev =>
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  /* ────────────────────────────────────────────
     Onboarding Screen
     ──────────────────────────────────────────── */
  if (!onboardingComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {onboardingStep === 'goals' ? (
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-mono uppercase tracking-widest mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  New Operative
                </div>
                <img src="/logo.png" alt="Shadow Persuasion" className="w-48 mx-auto mb-2" />
                <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide">
                  Welcome
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Your training begins now. Choose your objectives and we&apos;ll build your personalized programme.
                </p>
              </div>

              {/* Goal Cards - multi-select from taxonomy */}
              <div>
                <p className="text-center text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  What brings you here? <span className="normal-case tracking-normal">(select all that apply)</span>
                </p>
                {taxonomyLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {taxonomyCategories.map(category => {
                      const isSelected = selectedGoals.some(g => g.id === category.id);
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleToggleGoal(category)}
                          disabled={savingGoal}
                          className={`group relative flex flex-col items-center justify-center p-5 rounded-xl bg-white dark:bg-[#1A1A1A] border transition-all hover:border-[#D4A017] hover:shadow-lg hover:shadow-[#D4A017]/10 text-center disabled:opacity-50 ${
                            isSelected
                              ? 'border-[#D4A017] bg-[#D4A017]/5 dark:bg-[#D4A017]/10 ring-1 ring-[#D4A017]/50'
                              : 'border-gray-200 dark:border-[#333]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="h-4 w-4 text-[#D4A017]" />
                            </div>
                          )}
                          {(() => { const Icon = getCategoryIcon(category.id); return <div className="mb-3"><Icon className="h-8 w-8 text-[#D4A017]" /></div>; })()}
                          <h3 className="text-sm font-bold font-mono">{category.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.description}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              {selectedGoals.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleGoalsConfirm}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#D4A017] text-black text-sm font-bold font-mono uppercase tracking-wider hover:bg-[#C4901A] transition-all hover:scale-105"
                  >
                    Continue ({selectedGoals.length} selected)
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : onboardingStep === 'useCases' ? (
            /* Use Case Selection Step */
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-mono uppercase tracking-widest mb-2">
                  <Target className="h-3.5 w-3.5" />
                  Focus Area
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide">
                  What&apos;s <span className="text-[#D4A017]">Most Pressing</span>?
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Pick the situation that matters most right now. This helps us prioritize your training.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {selectedGoals.flatMap(c => c.useCases).slice(0, 8).map(uc => (
                  <button
                    key={uc.id}
                    onClick={() => handleSaveGoals(uc.title)}
                    disabled={savingGoal}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] text-sm font-medium hover:border-[#D4A017] hover:bg-[#D4A017]/5 transition-all disabled:opacity-50"
                  >
                    {uc.title}
                  </button>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => handleSaveGoals(null)}
                  disabled={savingGoal}
                  className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors underline underline-offset-2"
                >
                  Skip &mdash; nothing specific right now
                </button>
              </div>
            </div>
          ) : onboardingStep === 'voice' ? (
            /* Voice Profile Step */
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-mono uppercase tracking-widest mb-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Voice Setup
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide">
                  Teach Us <span className="text-[#D4A017]">Your Voice</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  So every script, response, and recommendation sounds like YOU &mdash; not a robot.
                </p>
              </div>

              <div className="space-y-4">
                {/* Personality */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Personality
                  </label>
                  <textarea
                    value={voicePersonality}
                    onChange={e => setVoicePersonality(e.target.value)}
                    placeholder="e.g., Direct and confident, but empathetic. I don't like being pushy. I use humor to defuse tension."
                    rows={2}
                    className="w-full rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] px-4 py-3 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] outline-none transition-all resize-none"
                  />
                </div>

                {/* Communication Style */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Communication Style
                  </label>
                  <textarea
                    value={voiceStyle}
                    onChange={e => setVoiceStyle(e.target.value)}
                    placeholder="e.g., Short sentences, casual tone, I say 'honestly' and 'look' a lot. I avoid corporate jargon."
                    rows={2}
                    className="w-full rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] px-4 py-3 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] outline-none transition-all resize-none"
                  />
                </div>

                {/* Tone Pills */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Tone <span className="normal-case tracking-normal">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => toggleTone(tone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                          voiceTones.includes(tone)
                            ? 'bg-[#D4A017]/20 border-[#D4A017] text-[#D4A017]'
                            : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:border-[#D4A017]/50'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sample Texts */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Sample Texts
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    Paste 2-3 real messages or emails you&apos;ve written. This helps us match your natural voice. Separate each with a blank line.
                  </p>
                  <textarea
                    value={voiceSampleTexts}
                    onChange={e => setVoiceSampleTexts(e.target.value)}
                    placeholder="Paste an email or message you've sent recently..."
                    rows={5}
                    className="w-full rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] px-4 py-3 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  onClick={handleVoiceSave}
                  disabled={savingVoice}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#D4A017] text-black text-sm font-bold font-mono uppercase tracking-wider hover:bg-[#C4901A] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {savingVoice ? 'Saving...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOnboardingStep('getStarted')}
                  className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors underline underline-offset-2"
                >
                  Skip for now
                </button>
              </div>
            </div>
          ) : (
            /* Get Started Screen */
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-mono uppercase tracking-widest mb-2">
                  <Target className="h-3.5 w-3.5" />
                  {selectedGoals.length > 0 ? 'Objective Set' : 'Ready to Start'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide">
                  Your <span className="text-[#D4A017]">Mission Briefing</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  {selectedGoals.length > 0
                    ? `Here are your first three assignments, ${displayName}. Complete them to begin building your Persuasion Score.`
                    : `Here are some quick actions to get started, ${displayName}. You can always set specific goals later.`}
                </p>
              </div>

              <div className="space-y-3">
                {/* Action 1: Strategic Coach */}
                <button
                  onClick={() => {
                    sessionStorage.setItem('onboarding-context', JSON.stringify({
                      goal: selectedUseCase || selectedGoals.map(g => g.name).join(', '),
                      categories: selectedGoals.map(g => g.id),
                    }));
                    router.push('/app/chat');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono">Talk to Your Strategic Coach</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedGoals.length > 0
                        ? <>Get personalized advice on &quot;{selectedGoals.map(g => g.name).join(', ')}&quot;</>
                        : 'Get personalized strategic advice'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors" />
                </button>

                {/* Action 2: Training Scenario */}
                <button
                  onClick={() => {
                    const primaryCategory = selectedGoals[0]?.id || '';
                    if (primaryCategory) {
                      sessionStorage.setItem('onboarding-training-filter', primaryCategory);
                    }
                    router.push('/app/training');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                    <Swords className="h-5 w-5 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono">Run Your First Scenario</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Practice techniques in a realistic simulation
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors" />
                </button>

                {/* Action 3: Browse Techniques */}
                <button
                  onClick={() => {
                    const primaryCategory = selectedGoals[0]?.id || '';
                    if (primaryCategory) {
                      sessionStorage.setItem('onboarding-technique-filter', primaryCategory);
                    }
                    router.push('/app/techniques');
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono">Study Techniques</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedGoals.length > 0
                        ? `Browse the playbook for ${selectedGoals.map(g => g.description.toLowerCase()).join(', ')}`
                        : 'Browse the full technique playbook'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors" />
                </button>
              </div>

              {/* Let's Go Button */}
              <div className="text-center">
                <button
                  onClick={() => setOnboardingComplete(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#D4A017] text-black text-sm font-bold font-mono uppercase tracking-wider hover:bg-[#C4901A] transition-all hover:scale-105"
                >
                  Let&apos;s Go
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ═══════════════════════════════════════════
          Section 1: Welcome + Score Summary
          ═══════════════════════════════════════════ */}
      <section className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333]">
        <CompactScoreRing score={persuasionScore} />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-wide">
            Welcome back, <span className="text-[#D4A017]">{displayName}</span>
          </h1>
          <p className="text-sm font-mono uppercase tracking-widest mt-1" style={{ color: getScoreColor(persuasionScore) }}>
            {rank}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-5 mt-3 text-sm text-gray-500 dark:text-gray-400">
            {streak > 0 ? (
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-gray-700 dark:text-gray-200">{streak} day{streak !== 1 ? 's' : ''}</span> streak
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-gray-400" />
                No active streak
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#D4A017]" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{weekCompletionXP}</span> XP this week
            </span>
          </div>
        </div>
        <Link
          href="/app/score"
          className="text-xs font-mono uppercase tracking-wider text-[#D4A017] hover:underline shrink-0"
        >
          Full Score →
        </Link>
      </section>

      {/* ═══════════════════════════════════════════
          Section 1.5: Your Focus Areas (if goals set)
          ═══════════════════════════════════════════ */}
      {userGoals.length > 0 && (
        <section className="rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Your Focus Areas
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Based on your goals</p>
            </div>
            {!editingFocus && (
              <button
                onClick={() => { setEditGoals([...userGoals]); setEditingFocus(true); }}
                className="flex items-center gap-1 text-xs text-[#D4A017] hover:underline font-mono"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {userGoals.map(goalId => {
              const cat = taxonomyCategories.find(c => c.id === goalId);
              const Icon = getCategoryIcon(goalId);
              return (
                <span
                  key={goalId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-mono"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat?.name || goalId}
                </span>
              );
            })}
          </div>
          {editingFocus && (
            <div className="border-t border-gray-200 dark:border-[#333] pt-4 mt-2 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Toggle categories
              </p>
              <div className="flex flex-wrap gap-2">
                {taxonomyCategories.map(category => {
                  const isSelected = editGoals.includes(category.id);
                  const Icon = getCategoryIcon(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() =>
                        setEditGoals(prev =>
                          prev.includes(category.id)
                            ? prev.filter(g => g !== category.id)
                            : [...prev, category.id]
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                        isSelected
                          ? 'bg-[#D4A017]/10 border-[#D4A017]/30 text-[#D4A017]'
                          : 'bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#444] text-gray-500 dark:text-gray-400 hover:border-[#D4A017]/50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.name}
                      {isSelected && <CheckCircle className="h-3 w-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  disabled={savingFocusEdit || editGoals.length === 0}
                  onClick={async () => {
                    setSavingFocusEdit(true);
                    try {
                      const token = await user?.getIdToken();
                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      await fetch('/api/user', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ goals: editGoals }),
                      });
                      setUserGoals(editGoals);
                      setEditingFocus(false);
                    } catch (err) {
                      console.error('Failed to save focus areas:', err);
                    } finally {
                      setSavingFocusEdit(false);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#D4A017] text-black text-xs font-bold font-mono uppercase tracking-wider hover:bg-[#C4901A] transition-colors disabled:opacity-50"
                >
                  {savingFocusEdit ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingFocus(false)}
                  className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedUseCase && (
              <button
                onClick={() => {
                  sessionStorage.setItem('onboarding-context', JSON.stringify({
                    goal: selectedUseCase,
                    categories: userGoals,
                  }));
                  router.push('/app/chat');
                }}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group text-left"
              >
                <MessageSquare className="h-5 w-5 text-[#D4A017] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono uppercase text-gray-500 dark:text-gray-400">Get help with</p>
                  <p className="text-sm font-medium truncate">{selectedUseCase}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors shrink-0" />
              </button>
            )}
            <button
              onClick={() => {
                if (userGoals[0]) {
                  sessionStorage.setItem('onboarding-training-filter', userGoals[0]);
                }
                router.push('/app/training');
              }}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group text-left"
            >
              <Swords className="h-5 w-5 text-[#D4A017] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono uppercase text-gray-500 dark:text-gray-400">Practice</p>
                <p className="text-sm font-medium truncate">
                  {taxonomyCategories.find(c => c.id === userGoals[0])?.name || userGoals[0]} scenarios
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors shrink-0" />
            </button>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          Section 2: Today's Mission
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-[#D4A017]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Today&apos;s Mission
            </h2>
            {todayCompletion && (
              <span className="ml-auto flex items-center gap-1 text-green-500 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                {todayCompletion.grade ? `Grade: ${todayCompletion.grade}` : 'Completed'}
              </span>
            )}
          </div>

          {dailyMission ? (
            <>
              <h3 className="text-lg font-bold mb-1">{dailyMission.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed max-w-2xl">
                {dailyMission.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[dailyMission.difficulty]}`}>
                  {dailyMission.difficulty}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full border border-gray-300 dark:border-[#444] text-gray-500 dark:text-gray-400">
                  {dailyMission.technique}
                </span>
                <span className="text-xs font-mono text-[#D4A017]">
                  +{dailyMission.xpReward} XP
                </span>

                {!todayCompletion && (
                  <Link
                    href="/app/field-ops"
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4A017] text-black text-sm font-bold font-mono uppercase tracking-wider hover:bg-[#C4901A] transition-colors"
                  >
                    Start Mission
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {showLowPool && (
                <p className="mt-3 text-xs text-yellow-400/80 italic">
                  Running low on missions for your focus areas. New missions will be generated from your knowledge base.
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D4A017]" />
              <span className="text-sm">Loading missions...</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          Section 3: Quick Actions
          ═══════════════════════════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/app/analyze', icon: Eye, title: 'Analyze', desc: 'Decode a conversation' },
          { href: '/app/chat', icon: MessageSquare, title: 'Strategize', desc: 'Get strategic advice' },
          { href: '/app/training', icon: Swords, title: 'Practice', desc: 'Run a scenario' },
          { href: '/app/techniques', icon: BookOpen, title: 'Learn', desc: 'Study a technique' },
        ].map(card => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col items-center justify-center p-5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] transition-all hover:border-[#D4A017] hover:shadow-lg text-center"
          >
            <card.icon className="h-7 w-7 mb-2.5 text-[#D4A017] transition-transform group-hover:scale-110" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider">{card.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.desc}</p>
          </Link>
        ))}
      </section>

      {/* ═══════════════════════════════════════════
          Section 3.5: This Week Stats
          ═══════════════════════════════════════════ */}
      {(() => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const allActivity = progress?.recentActivity ?? [];
        const weekActivity = allActivity.filter(a => {
          const d = new Date(a.date);
          return d.getTime() >= monday.getTime() && d.getTime() < monday.getTime() + 7 * 86400000;
        });

        const analysisCount = weekActivity.filter(a => a.type === 'analysis').length;
        const coachCount = weekActivity.filter(a => a.type === 'feedback' || a.type === 'journal').length;
        const missionCount = weekActivity.filter(a => a.type === 'mission').length;
        const practiceCount = weekActivity.filter(a => a.type === 'practice' || a.type === 'scenario').length;

        const weekXPTotal = completions
          .filter(c => {
            const d = new Date(c.completed_at || c.created_at || c.date || '').getTime();
            return d >= monday.getTime() && d < monday.getTime() + 7 * 86400000;
          })
          .reduce((sum, c) => sum + (c.xp_earned ?? 10), 0);

        const statCards = [
          { label: 'Analyses', value: analysisCount, icon: Search },
          { label: 'Coach', value: coachCount, icon: MessageSquare },
          { label: 'Missions', value: missionCount, icon: Target },
          { label: 'Practice', value: practiceCount, icon: BookOpen },
          { label: 'XP', value: weekXPTotal, icon: Zap },
        ];

        // Daily breakdown: activity types per day
        const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const dayTypes: Set<string>[] = Array.from({ length: 7 }, () => new Set());
        weekActivity.forEach(a => {
          const d = new Date(a.date);
          const dayIndex = Math.floor((d.getTime() - monday.getTime()) / 86400000);
          if (dayIndex >= 0 && dayIndex < 7) {
            dayTypes[dayIndex].add(a.type);
          }
        });

        return (
          <section className="rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
                This Week
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                {fmtShort(monday)} &ndash; {fmtShort(sunday)}
              </span>
            </div>

            {/* Stat boxes */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-5">
              {statCards.map(s => (
                <div
                  key={s.label}
                  className="flex flex-col items-center p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-[#333]"
                >
                  <s.icon className="h-4 w-4 text-[#D4A017] mb-1.5" />
                  <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-gray-800 dark:text-gray-100">
                    {s.value}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-0.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Daily breakdown dots */}
            <div className="flex items-end justify-between gap-2">
              {dayLabels.map((label, i) => {
                const types = dayTypes[i];
                const isToday = i === mondayOffset;
                const hasActivity = types.size > 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="flex flex-col items-center gap-1 min-h-[24px] justify-end">
                      {hasActivity ? (
                        Array.from(types).slice(0, 3).map((t, j) => (
                          <div
                            key={j}
                            className="w-2.5 h-2.5 rounded-full bg-[#D4A017]"
                            title={t}
                          />
                        ))
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-[#333]" />
                      )}
                    </div>
                    <span className={`text-xs font-mono ${isToday ? 'text-[#D4A017] font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ═══════════════════════════════════════════
          Section 4: Recent Activity
          ═══════════════════════════════════════════ */}
      <section className="rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] p-6">
        <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Recent Activity
        </h2>

        {recentActivity.length === 0 ? (
          <div className="py-10 text-center">
            <Target className="h-8 w-8 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete your first mission to see activity here
            </p>
            <Link
              href="/app/field-ops"
              className="inline-block mt-3 text-xs font-mono text-[#D4A017] hover:underline"
            >
              Go to Field Ops →
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentActivity.map((item, i) => {
              const Icon = getActivityIcon(item.type);
              const href = getActivityLink(item.type);
              return (
                <Link
                  key={i}
                  href={href}
                  className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-[#222] cursor-pointer rounded-lg transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center shrink-0 group-hover:bg-[#D4A017]/10 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#D4A017] transition-colors" />
                  </div>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {formatDate(item.date)}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[#D4A017] transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════
          Section 5: Continue Where You Left Off
          ═══════════════════════════════════════════ */}
      {recentSessions.length > 0 && (
        <section className="rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] p-6">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Continue Where You Left Off
          </h2>
          <div className="space-y-3">
            {recentSessions.map(session => (
              <Link
                key={session.id}
                href={`/app/chat?session=${session.id}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-[#2A2A2A] hover:border-[#D4A017] transition-colors group"
              >
                <MessageSquare className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0 group-hover:text-[#D4A017] transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title || 'Untitled Session'}
                  </p>
                  {session.lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {session.lastMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(session.updated_at)}
                  </span>
                  <span className="text-xs font-mono text-[#D4A017] opacity-0 group-hover:opacity-100 transition-opacity">
                    Resume →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
