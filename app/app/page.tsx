'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Eye, MessageSquare, Swords, BookOpen, Flame, Zap, Target,
  Clock, ArrowRight, CheckCircle, FileText, MessageCircle,
  Briefcase, Heart, DollarSign, Shield, Star, Lock, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
   Mission Pool (subset for daily pick)
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

const MISSION_POOL: Mission[] = [
  { id: 1, title: 'Spot the Anchor', description: 'During any conversation today about money, prices, or numbers, notice who sets the first number. Observe how it influences the rest of the discussion.', technique: 'Anchoring', category: 'Negotiation', difficulty: 'Beginner', xpReward: 30 },
  { id: 2, title: 'Social Proof Radar', description: 'Count how many times someone uses social proof on you today. Ads, colleagues, friends saying "everyone does it." Just notice and log each instance.', technique: 'Social Proof', category: 'Influence', difficulty: 'Beginner', xpReward: 30 },
  { id: 3, title: 'Frame Detective', description: 'In your next meeting or conversation, identify who controls the frame. Notice how the topic, tone, and direction are set by one person.', technique: 'Frame Control', category: 'Framing', difficulty: 'Beginner', xpReward: 30 },
  { id: 4, title: 'Mirror Watch', description: 'Observe a conversation between two people. Notice any mirroring happening naturally: body language, speech patterns, word choices.', technique: 'Mirroring', category: 'Rapport', difficulty: 'Beginner', xpReward: 30 },
  { id: 5, title: 'Scarcity Scanner', description: 'Track every scarcity message you encounter today: limited-time offers, exclusive access, "only 3 left." Rate each one: genuine or manufactured?', technique: 'Scarcity Frame', category: 'Influence', difficulty: 'Beginner', xpReward: 30 },
  { id: 6, title: 'The Reciprocity Drop', description: 'Do something unexpectedly helpful for someone today with no strings attached. Buy a coffee, share a useful resource, or give a genuine compliment.', technique: 'Reciprocity', category: 'Influence', difficulty: 'Beginner', xpReward: 50 },
  { id: 7, title: 'Deploy a Mirror', description: 'In your next conversation, repeat the last 2-3 words someone says back to them as a question. Do this at least twice.', technique: 'Mirroring', category: 'Rapport', difficulty: 'Beginner', xpReward: 50 },
  { id: 8, title: 'Label an Emotion', description: 'In a conversation today, use the phrase "It seems like..." or "It sounds like..." to name what the other person is feeling.', technique: 'Labeling', category: 'Rapport', difficulty: 'Beginner', xpReward: 50 },
  { id: 9, title: 'Authority Frame', description: 'Before making a recommendation today, briefly establish your credibility on the topic. Reference a specific experience, data point, or insight.', technique: 'Authority Positioning', category: 'Framing', difficulty: 'Beginner', xpReward: 50 },
  { id: 10, title: 'The Contrast Play', description: 'When presenting an option today, first mention a more expensive/difficult alternative, then present your actual recommendation.', technique: 'The Contrast Principle', category: 'Negotiation', difficulty: 'Beginner', xpReward: 50 },
  { id: 11, title: 'Small Commitment', description: 'Get someone to agree to a small, easy request first, then follow up with your actual request. Track how the small yes affects the bigger ask.', technique: 'Commitment & Consistency', category: 'Influence', difficulty: 'Beginner', xpReward: 50 },
  { id: 12, title: 'Strategic Compliment', description: 'Share a specific, genuine vulnerability or past mistake in a professional conversation. Notice how it changes the dynamic.', technique: 'Strategic Vulnerability', category: 'Rapport', difficulty: 'Beginner', xpReward: 50 },
  { id: 13, title: 'Deploy a Presupposition', description: 'Use one embedded presupposition in a real conversation today. Example: "When we finalize this deal..." instead of "If we finalize..."', technique: 'Frame Control', category: 'Framing', difficulty: 'Intermediate', xpReward: 80 },
  { id: 14, title: 'Tactical Empathy Disarm', description: "Summarize the other person's position so accurately they say \"exactly\" or \"that's right.\" Use this as a bridge to your point.", technique: 'Tactical Empathy', category: 'Rapport', difficulty: 'Intermediate', xpReward: 80 },
  { id: 15, title: 'The Reframe', description: 'When someone raises an objection or problem today, reframe it. Turn a cost into an investment, a risk into an opportunity.', technique: 'Reframing', category: 'Framing', difficulty: 'Intermediate', xpReward: 80 },
  { id: 16, title: 'Door-in-the-Face', description: 'Make a deliberately large request that you expect to be declined. Then immediately follow up with your real, smaller request.', technique: 'Door-in-the-Face', category: 'Negotiation', difficulty: 'Intermediate', xpReward: 80 },
  { id: 17, title: 'Pattern Break', description: 'In a conversation that feels stuck or scripted, do something unexpected: change the topic abruptly, ask a surprising question.', technique: 'Pattern Interruption', category: 'Framing', difficulty: 'Intermediate', xpReward: 80 },
  { id: 18, title: 'The Void', description: 'After asking an important question today, stay completely silent. Do not fill the silence. Wait for them to speak first.', technique: 'The Void Pull', category: 'Rapport', difficulty: 'Intermediate', xpReward: 80 },
  { id: 19, title: 'Emotional Redirect', description: 'When someone is in a negative emotional state, use a story, question, or humor to shift their emotional state before making your point.', technique: 'Emotional Hijacking', category: 'Influence', difficulty: 'Intermediate', xpReward: 80 },
  { id: 20, title: 'Scarcity + Reciprocity Stack', description: 'Combine two techniques: give something valuable first (reciprocity), then make it clear this opportunity is limited (scarcity).', technique: 'Scarcity Frame', category: 'Influence', difficulty: 'Intermediate', xpReward: 100 },
  { id: 21, title: 'Accusation Audit', description: "List every negative thing the other person might think about you or your proposal. Then preemptively address them at the start.", technique: 'The Accusation Audit', category: 'Defense', difficulty: 'Advanced', xpReward: 120 },
  { id: 22, title: 'The Takeaway Close', description: "When someone is hesitant but interested, pull back. Say \"Maybe this isn't the right fit\" or remove a benefit. Notice if they chase.", technique: 'The Takeaway', category: 'Negotiation', difficulty: 'Advanced', xpReward: 120 },
  { id: 23, title: 'Full Frame War', description: "Enter a conversation where someone else sets the frame. Politely but firmly reject their frame and establish your own.", technique: 'Frame Control', category: 'Framing', difficulty: 'Advanced', xpReward: 120 },
  { id: 24, title: 'Cognitive Overload Play', description: 'Present someone with 3-4 complex options, then offer your preferred option as the simple, clear choice.', technique: 'Cognitive Overload', category: 'Influence', difficulty: 'Advanced', xpReward: 120 },
  { id: 25, title: 'Triple Stack', description: 'In one interaction, combine three techniques: establish authority, use tactical empathy, then close with a takeaway.', technique: 'Authority Positioning', category: 'Framing', difficulty: 'Advanced', xpReward: 150 },
  { id: 26, title: 'Defense Mode', description: 'Someone will try to influence you today. Identify the technique they use in real-time and deploy a counter-technique.', technique: 'The Accusation Audit', category: 'Defense', difficulty: 'Advanced', xpReward: 120 },
  { id: 27, title: 'Social Proof Engineering', description: 'Before making a proposal, plant social proof by casually mentioning others who have already done what you are suggesting.', technique: 'Social Proof', category: 'Influence', difficulty: 'Intermediate', xpReward: 80 },
];

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

function getDailyMission(dateStr: string): Mission {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return MISSION_POOL[Math.abs(hash) % MISSION_POOL.length];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'mission': return Target;
    case 'journal': return FileText;
    case 'practice': return Swords;
    case 'feedback': return MessageCircle;
    default: return Zap;
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
   Onboarding Goals
   ──────────────────────────────────────────── */

const ONBOARDING_GOALS = [
  {
    id: 'negotiations',
    label: 'Win Negotiations',
    desc: 'Career, salary, promotions',
    icon: Briefcase,
    coachPrompt: 'Help me prepare for an upcoming negotiation',
    trainingId: 'salary-negotiation',
    techniqueCategory: 'Negotiation',
  },
  {
    id: 'relationships',
    label: 'Master Relationships',
    desc: 'Dating, attraction, connection',
    icon: Heart,
    coachPrompt: 'I want to build deeper connections with people',
    trainingId: 'first-date',
    techniqueCategory: 'Rapport',
  },
  {
    id: 'deals',
    label: 'Close More Deals',
    desc: 'Sales, clients, business',
    icon: DollarSign,
    coachPrompt: 'Help me close more sales and win clients',
    trainingId: 'sales-pitch',
    techniqueCategory: 'Influence',
  },
  {
    id: 'difficult-people',
    label: 'Handle Difficult People',
    desc: 'Narcissists, manipulators, toxic dynamics',
    icon: Shield,
    coachPrompt: 'I need strategies for dealing with a difficult person',
    trainingId: 'difficult-boss',
    techniqueCategory: 'Defense',
  },
  {
    id: 'influence',
    label: 'Build Influence',
    desc: 'Leadership, authority, social power',
    icon: Star,
    coachPrompt: 'I want to become more influential and authoritative',
    trainingId: 'team-leadership',
    techniqueCategory: 'Framing',
  },
  {
    id: 'defense',
    label: 'Defend Yourself',
    desc: 'Detect manipulation, protect boundaries',
    icon: Lock,
    coachPrompt: 'Help me spot and counter manipulation tactics',
    trainingId: 'manipulation-defense',
    techniqueCategory: 'Defense',
  },
] as const;

/* ────────────────────────────────────────────
   Dashboard Page
   ──────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [completions, setCompletions] = useState<MissionCompletion[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState(true); // assume true until we know
  const [selectedGoal, setSelectedGoal] = useState<typeof ONBOARDING_GOALS[number] | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'goals' | 'voice' | 'getStarted'>('goals');
  const [savingGoal, setSavingGoal] = useState(false);

  // Voice profile state
  const [voicePersonality, setVoicePersonality] = useState('');
  const [voiceStyle, setVoiceStyle] = useState('');
  const [voiceTones, setVoiceTones] = useState<string[]>([]);
  const [voiceSampleTexts, setVoiceSampleTexts] = useState('');
  const [savingVoice, setSavingVoice] = useState(false);

  // Today's mission
  const today = new Date().toISOString().split('T')[0];
  const dailyMission = getDailyMission(today);

  // Check if today's mission is completed
  const todayCompletion = completions.find(c => {
    const completedDate = c.completed_at || c.created_at || c.date || '';
    return completedDate.startsWith(today) && (c.missionId === dailyMission.id);
  });

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

        const [progressRes, completionsRes, conversationsRes] = await Promise.all([
          fetch('/api/user/progress', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/missions/completions', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/conversations', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (progressRes) setProgress(progressRes);
        if (completionsRes?.completions) setCompletions(completionsRes.completions);
        if (conversationsRes?.sessions) setSessions(conversationsRes.sessions);

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
  const handleGoalSelect = async (goal: typeof ONBOARDING_GOALS[number]) => {
    setSelectedGoal(goal);
    setSavingGoal(true);
    try {
      const token = await user?.getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/user', {
        method: 'POST',
        headers,
        body: JSON.stringify({ goals: [goal.id] }),
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
                <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-wide">
                  Welcome to <span className="text-[#D4A017]">Shadow.Ops</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Your training begins now. Choose your primary objective and we&apos;ll build your personalized programme.
                </p>
              </div>

              {/* Goal Cards */}
              <div>
                <p className="text-center text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  What brings you here?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ONBOARDING_GOALS.map(goal => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalSelect(goal)}
                        disabled={savingGoal}
                        className="group relative flex flex-col items-center justify-center p-5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] transition-all hover:border-[#D4A017] hover:shadow-lg hover:shadow-[#D4A017]/10 text-center disabled:opacity-50"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#D4A017]/10 flex items-center justify-center mb-3 group-hover:bg-[#D4A017]/20 transition-colors">
                          <Icon className="h-6 w-6 text-[#D4A017]" />
                        </div>
                        <h3 className="text-sm font-bold font-mono">{goal.label}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{goal.desc}</p>
                      </button>
                    );
                  })}
                </div>
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
          ) : selectedGoal ? (
            /* Get Started Screen */
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-mono uppercase tracking-widest mb-2">
                  <Target className="h-3.5 w-3.5" />
                  Objective Set
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-wide">
                  Your <span className="text-[#D4A017]">Mission Briefing</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Here are your first three assignments, {displayName}. Complete them to begin building your Persuasion Score.
                </p>
              </div>

              <div className="space-y-3">
                {/* Action 1: Strategic Coach */}
                <Link
                  href={`/app/chat?prompt=${encodeURIComponent(selectedGoal.coachPrompt)}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono">Talk to Your Strategic Coach</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Get personalized advice on &quot;{selectedGoal.label}&quot;
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors" />
                </Link>

                {/* Action 2: Training Scenario */}
                <Link
                  href="/app/training"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                    <Swords className="h-5 w-5 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono">Run Your First Scenario</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Practice {selectedGoal.techniqueCategory.toLowerCase()} techniques in a realistic simulation
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors" />
                </Link>

                {/* Action 3: Browse Techniques */}
                <Link
                  href={`/app/techniques?category=${encodeURIComponent(selectedGoal.techniqueCategory)}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#D4A017] transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold font-mono">Study {selectedGoal.techniqueCategory} Techniques</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Browse the playbook for {selectedGoal.desc.toLowerCase()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#D4A017] transition-colors" />
                </Link>
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
          ) : null}
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
          Section 3.5: This Week Activity Heatmap
          ═══════════════════════════════════════════ */}
      <section className="rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] p-6">
        <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          This Week
        </h2>
        <div className="flex items-end justify-between gap-2">
          {(() => {
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=Sun
            // Monday-based week: offset from Monday
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const monday = new Date(now);
            monday.setDate(now.getDate() - mondayOffset);
            monday.setHours(0, 0, 0, 0);

            const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
            const allActivity = progress?.recentActivity ?? [];

            // Count activities per day of the week
            const dayCounts = Array(7).fill(0);
            allActivity.forEach(a => {
              const d = new Date(a.date);
              const diffMs = d.getTime() - monday.getTime();
              const dayIndex = Math.floor(diffMs / 86400000);
              if (dayIndex >= 0 && dayIndex < 7) {
                dayCounts[dayIndex]++;
              }
            });

            return dayLabels.map((label, i) => {
              const count = dayCounts[i];
              const isToday = i === mondayOffset;
              let bgClass = 'bg-gray-100 dark:bg-[#2A2A2A]';
              if (count >= 3) bgClass = 'bg-[#D4A017]';
              else if (count >= 1) bgClass = 'bg-[#D4A017]/40';

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-full aspect-square max-w-[48px] rounded-lg ${bgClass} transition-colors ${isToday ? 'ring-2 ring-[#D4A017]/50' : ''}`}
                    title={`${label}: ${count} activit${count === 1 ? 'y' : 'ies'}`}
                  />
                  <span className={`text-xs font-mono ${isToday ? 'text-[#D4A017] font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </section>

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
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {timeAgo(item.date)}
                  </span>
                </div>
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
                    {timeAgo(session.updated_at)}
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
