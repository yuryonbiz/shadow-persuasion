'use client';

import { useState, useEffect, useMemo } from 'react';
import { Flame, Clock, Trophy, Target, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, Star } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

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
  type: 'observer' | 'beginner' | 'intermediate' | 'advanced';
}

interface MissionCompletion {
  missionId: number;
  date: string;
  whatHappened: string;
  didItWork: 'Yes' | 'Somewhat' | 'No';
  notes: string;
  grade: string;
  feedback: string;
  xpEarned: number;
  insight: string;
}

interface MissionsData {
  completions: MissionCompletion[];
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  lastCompletedDate: string | null;
}

// ── Mission Pool (30+) ────────────────────────────────────────────────────────

const MISSION_POOL: Mission[] = [
  // Observer missions
  { id: 1, title: 'Spot the Anchor', description: 'During any conversation today about money, prices, or numbers, notice who sets the first number. Observe how it influences the rest of the discussion.', technique: 'Anchoring', category: 'Negotiation', difficulty: 'Beginner', xpReward: 30, type: 'observer' },
  { id: 2, title: 'Social Proof Radar', description: 'Count how many times someone uses social proof on you today. Ads, colleagues, friends saying "everyone does it." Just notice and log each instance.', technique: 'Social Proof', category: 'Influence', difficulty: 'Beginner', xpReward: 30, type: 'observer' },
  { id: 3, title: 'Frame Detective', description: 'In your next meeting or conversation, identify who controls the frame. Notice how the topic, tone, and direction are set by one person. Who is it and how do they do it?', technique: 'Frame Control', category: 'Framing', difficulty: 'Beginner', xpReward: 30, type: 'observer' },
  { id: 4, title: 'Mirror Watch', description: 'Observe a conversation between two people. Notice any mirroring happening naturally: body language, speech patterns, word choices. How does it affect rapport?', technique: 'Mirroring', category: 'Rapport', difficulty: 'Beginner', xpReward: 30, type: 'observer' },
  { id: 5, title: 'Scarcity Scanner', description: 'Track every scarcity message you encounter today: limited-time offers, exclusive access, "only 3 left." Rate each one: genuine or manufactured?', technique: 'Scarcity Frame', category: 'Influence', difficulty: 'Beginner', xpReward: 30, type: 'observer' },

  // Beginner missions
  { id: 6, title: 'The Reciprocity Drop', description: 'Do something unexpectedly helpful for someone today with no strings attached. Buy a coffee, share a useful resource, or give a genuine compliment. Notice how it shifts the dynamic.', technique: 'Reciprocity', category: 'Influence', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },
  { id: 7, title: 'Deploy a Mirror', description: 'In your next conversation, repeat the last 2-3 words someone says back to them as a question. Do this at least twice. Notice how it makes them elaborate.', technique: 'Mirroring', category: 'Rapport', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },
  { id: 8, title: 'Label an Emotion', description: 'In a conversation today, use the phrase "It seems like..." or "It sounds like..." to name what the other person is feeling. Observe their reaction.', technique: 'Labeling', category: 'Rapport', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },
  { id: 9, title: 'Authority Frame', description: 'Before making a recommendation today, briefly establish your credibility on the topic. Reference a specific experience, data point, or insight. Then make your suggestion.', technique: 'Authority Positioning', category: 'Framing', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },
  { id: 10, title: 'The Contrast Play', description: 'When presenting an option today, first mention a more expensive/difficult alternative, then present your actual recommendation. Notice how the contrast shifts perception.', technique: 'The Contrast Principle', category: 'Negotiation', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },
  { id: 11, title: 'Small Commitment', description: 'Get someone to agree to a small, easy request first ("Can you help me with something quick?"), then follow up with your actual request. Track how the small yes affects the bigger ask.', technique: 'Commitment & Consistency', category: 'Influence', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },
  { id: 12, title: 'Strategic Compliment', description: 'Share a specific, genuine vulnerability or past mistake in a professional conversation. Not a big one -- something small and relatable. Notice how it changes the dynamic.', technique: 'Strategic Vulnerability', category: 'Rapport', difficulty: 'Beginner', xpReward: 50, type: 'beginner' },

  // Intermediate missions
  { id: 13, title: 'Deploy a Presupposition', description: 'Use one embedded presupposition in a real conversation today. Example: "When we finalize this deal..." instead of "If we finalize..." Notice how it subtly shifts the assumption.', technique: 'Frame Control', category: 'Framing', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 14, title: 'Tactical Empathy Disarm', description: 'In a tense or difficult conversation, summarize the other person\'s position so accurately they say "exactly" or "that\'s right." Use this as a bridge to your point.', technique: 'Tactical Empathy', category: 'Rapport', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 15, title: 'The Reframe', description: 'When someone raises an objection or problem today, reframe it. Turn a cost into an investment, a risk into an opportunity, or a weakness into a strength. Track their reaction.', technique: 'Reframing', category: 'Framing', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 16, title: 'Door-in-the-Face', description: 'Make a deliberately large request that you expect to be declined. Then immediately follow up with your real, smaller request. Compare the acceptance rate to asking directly.', technique: 'Door-in-the-Face', category: 'Negotiation', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 17, title: 'Pattern Break', description: 'In a conversation that feels stuck or scripted, do something unexpected: change the topic abruptly, ask a surprising question, or shift the energy. Notice how it creates an opening.', technique: 'Pattern Interruption', category: 'Framing', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 18, title: 'The Void', description: 'After asking an important question today, stay completely silent. Do not fill the silence. Wait for them to speak first, no matter how awkward it feels. Time how long it takes.', technique: 'The Void Pull', category: 'Rapport', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 19, title: 'Emotional Redirect', description: 'When someone is in a negative emotional state, use a story, question, or humor to shift their emotional state before making your point. Document the transition.', technique: 'Emotional Hijacking', category: 'Influence', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
  { id: 20, title: 'Scarcity + Reciprocity Stack', description: 'Combine two techniques: give something valuable first (reciprocity), then make it clear this opportunity is limited (scarcity). Track the combined effect.', technique: 'Scarcity Frame', category: 'Influence', difficulty: 'Intermediate', xpReward: 100, type: 'intermediate' },
  { id: 21, title: 'Label + Mirror Combo', description: 'In one conversation, use both labeling ("It seems like...") and mirroring (repeating their last few words). Use labeling for emotions and mirroring for facts. Compare the effects.', technique: 'Labeling', category: 'Rapport', difficulty: 'Intermediate', xpReward: 100, type: 'intermediate' },

  // Advanced missions
  { id: 22, title: 'Accusation Audit', description: 'Before a difficult conversation, list every negative thing the other person might think about you or your proposal. Then preemptively address them at the start. Track how it disarms them.', technique: 'The Accusation Audit', category: 'Defense', difficulty: 'Advanced', xpReward: 120, type: 'advanced' },
  { id: 23, title: 'The Takeaway Close', description: 'When someone is hesitant but interested, pull back. Say "Maybe this isn\'t the right fit" or remove a benefit from your offer. Notice if they chase.', technique: 'The Takeaway', category: 'Negotiation', difficulty: 'Advanced', xpReward: 120, type: 'advanced' },
  { id: 24, title: 'Full Frame War', description: 'Enter a conversation where someone else sets the frame. Your mission: politely but firmly reject their frame and establish your own. Maintain it for the entire conversation.', technique: 'Frame Control', category: 'Framing', difficulty: 'Advanced', xpReward: 120, type: 'advanced' },
  { id: 25, title: 'Cognitive Overload Play', description: 'Present someone with 3-4 complex options, then offer your preferred option as the simple, clear choice. Notice how decision fatigue pushes them toward the easy path.', technique: 'Cognitive Overload', category: 'Influence', difficulty: 'Advanced', xpReward: 120, type: 'advanced' },
  { id: 26, title: 'Triple Stack', description: 'In one interaction, combine three techniques: establish authority, use tactical empathy, then close with a takeaway. Document each phase.', technique: 'Authority Positioning', category: 'Framing', difficulty: 'Advanced', xpReward: 150, type: 'advanced' },
  { id: 27, title: 'Defense Mode', description: 'Someone will try to influence you today (sales, negotiation, request). Identify the technique they use in real-time and deploy a counter-technique. Document the exchange.', technique: 'The Accusation Audit', category: 'Defense', difficulty: 'Advanced', xpReward: 120, type: 'advanced' },
  { id: 28, title: 'Anchoring Ambush', description: 'In your next negotiation (price, timeline, scope), set an aggressive anchor before they can. Make it high enough to seem bold but not absurd. Track how it shifts the final number.', technique: 'Anchoring', category: 'Negotiation', difficulty: 'Advanced', xpReward: 120, type: 'advanced' },
  { id: 29, title: 'Empathy to Ask Pipeline', description: 'Build deep rapport using tactical empathy and labeling. Once they say "that\'s right," pivot to your ask. Track the conversion from rapport to action.', technique: 'Tactical Empathy', category: 'Rapport', difficulty: 'Advanced', xpReward: 150, type: 'advanced' },
  { id: 30, title: 'The Full Playbook', description: 'Choose any three techniques and use all three in a single high-stakes conversation. Plan your sequence in advance. Document what worked and what clashed.', technique: 'Frame Control', category: 'Framing', difficulty: 'Advanced', xpReward: 200, type: 'advanced' },
  { id: 31, title: 'Recover a Lost Frame', description: 'Deliberately let someone take the frame, then reclaim it mid-conversation. Practice the transition from following to leading. How long did recovery take?', technique: 'Frame Control', category: 'Defense', difficulty: 'Advanced', xpReward: 150, type: 'advanced' },
  { id: 32, title: 'Social Proof Engineering', description: 'Before making a proposal, plant social proof by casually mentioning others who have already done what you are suggesting. Make it feel natural, not forced.', technique: 'Social Proof', category: 'Influence', difficulty: 'Intermediate', xpReward: 80, type: 'intermediate' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'shadow-missions-data';

function getDefaultData(): MissionsData {
  return {
    completions: [],
    currentStreak: 0,
    longestStreak: 0,
    totalXP: 0,
    lastCompletedDate: null,
  };
}

function getDailyMission(dateStr?: string): Mission {
  const today = dateStr || new Date().toISOString().split('T')[0];
  // Deterministic seed from date string
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) >>> 0;
  }
  const index = seed % MISSION_POOL.length;
  return MISSION_POOL[index];
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getHoursUntilReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
}

function getMinutesUntilReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60));
}

function calculateStreak(data: MissionsData): { current: number; longest: number } {
  if (!data.lastCompletedDate) return { current: 0, longest: data.longestStreak };

  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  const lastCompleted = data.lastCompletedDate;

  let current = data.currentStreak;
  // If last completion was before yesterday, streak is broken
  if (lastCompleted !== today && lastCompleted !== yesterday) {
    current = 0;
  }

  return { current, longest: Math.max(data.longestStreak, current) };
}

const difficultyColors: Record<Difficulty, string> = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/30',
  Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const categoryColors: Record<MissionCategory, string> = {
  Influence: 'text-purple-400',
  Negotiation: 'text-blue-400',
  Rapport: 'text-green-400',
  Framing: 'text-yellow-400',
  Defense: 'text-red-400',
};

// ── Completion Form ────────────────────────────────────────────────────────────

function CompletionForm({
  mission,
  onSubmit,
  onCancel,
}: {
  mission: Mission;
  onSubmit: (data: { whatHappened: string; didItWork: 'Yes' | 'Somewhat' | 'No'; notes: string }) => void;
  onCancel: () => void;
}) {
  const [whatHappened, setWhatHappened] = useState('');
  const [didItWork, setDidItWork] = useState<'Yes' | 'Somewhat' | 'No'>('Somewhat');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened.trim()) return;
    onSubmit({ whatHappened, didItWork, notes });
  };

  const inputCls =
    'w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 pt-4 border-t border-[#333333]">
      <div>
        <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-1">
          What happened? <span className="text-red-400">*</span>
        </label>
        <textarea
          className={`${inputCls} min-h-[100px]`}
          placeholder="Describe how you executed the mission..."
          value={whatHappened}
          onChange={(e) => setWhatHappened(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
          Did it work?
        </label>
        <div className="flex gap-3">
          {(['Yes', 'Somewhat', 'No'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDidItWork(option)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                didItWork === option
                  ? option === 'Yes'
                    ? 'bg-green-400/20 text-green-400 border-green-400/50'
                    : option === 'Somewhat'
                      ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50'
                      : 'bg-red-400/20 text-red-400 border-red-400/50'
                  : 'bg-[#222222] text-gray-400 border-[#333333] hover:border-[#555555]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-1">
          Quick Notes
        </label>
        <textarea
          className={`${inputCls} min-h-[60px]`}
          placeholder="Any additional observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
        >
          Submit for Grading
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-[#333333] rounded-lg text-gray-300 hover:bg-[#222222] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MissionsPage() {
  const [data, setData] = useState<MissionsData>(getDefaultData());
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<{
    grade: string;
    feedback: string;
    xpEarned: number;
    insight: string;
  } | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);

  // Today's mission
  const todayStr = getDateString();
  const todayMission = useMemo(() => getDailyMission(todayStr), [todayStr]);
  const todayCompleted = data.completions.some((c) => c.date === todayStr);

  // Streak calculation
  const streakInfo = useMemo(() => calculateStreak(data), [data]);

  // Previous 7 days of missions
  const previousMissions = useMemo(() => {
    const missions: { date: string; mission: Mission; completion: MissionCompletion | undefined }[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = getDateString(date);
      const mission = getDailyMission(dateStr);
      const completion = data.completions.find((c) => c.date === dateStr);
      missions.push({ date: dateStr, mission, completion });
    }
    return missions;
  }, [data.completions]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load missions data:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoading]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const mins = getMinutesUntilReset();
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;
      setTimeLeft(`${hrs}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle mission completion
  const handleComplete = async (completionData: {
    whatHappened: string;
    didItWork: 'Yes' | 'Somewhat' | 'No';
    notes: string;
  }) => {
    setGrading(true);
    setShowCompletionForm(false);

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade',
          mission: todayMission,
          completion: completionData,
        }),
      });
      const result = await res.json();

      if (!result.error) {
        setGradeResult(result);

        const newCompletion: MissionCompletion = {
          missionId: todayMission.id,
          date: todayStr,
          whatHappened: completionData.whatHappened,
          didItWork: completionData.didItWork,
          notes: completionData.notes,
          grade: result.grade,
          feedback: result.feedback,
          xpEarned: result.xpEarned || 0,
          insight: result.insight,
        };

        setData((prev) => {
          const wasYesterday = prev.lastCompletedDate === getDateString(new Date(Date.now() - 86400000));
          const wasToday = prev.lastCompletedDate === todayStr;
          const newStreak = wasYesterday || wasToday ? prev.currentStreak + (wasToday ? 0 : 1) : 1;

          return {
            completions: [...prev.completions, newCompletion],
            currentStreak: newStreak,
            longestStreak: Math.max(prev.longestStreak, newStreak),
            totalXP: prev.totalXP + (result.xpEarned || 0),
            lastCompletedDate: todayStr,
          };
        });
      }
    } catch (e) {
      console.error('Failed to grade mission:', e);
    } finally {
      setGrading(false);
    }
  };

  const totalCompleted = data.completions.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">Daily Missions</h1>
          <p className="text-gray-400 mt-2">
            Personalized daily challenges to sharpen your influence skills in the real world.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#D4A017]/30 rounded-xl px-5 py-3">
          <Flame className="h-7 w-7 text-orange-500" />
          <div>
            <p className="text-2xl font-bold text-white leading-none">{streakInfo.current}</p>
            <p className="text-xs font-mono text-gray-500 uppercase">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-400">{streakInfo.current}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Current Streak</p>
            </div>
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-400">{streakInfo.longest}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Longest Streak</p>
            </div>
            <Star className="h-6 w-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[#D4A017]">{data.totalXP}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Total XP</p>
            </div>
            <Trophy className="h-6 w-6 text-[#D4A017]" />
          </div>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-400">{totalCompleted}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Completed</p>
            </div>
            <Target className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Today's Mission */}
      <div className="bg-[#1A1A1A] border border-[#D4A017]/40 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#D4A017]/10 to-transparent p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-gray-500 uppercase">Today&apos;s Mission</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium border rounded ${difficultyColors[todayMission.difficulty]}`}
                >
                  {todayMission.difficulty}
                </span>
                <span className={`text-xs font-medium ${categoryColors[todayMission.category]}`}>
                  {todayMission.category}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{todayMission.title}</h2>
              <p className="text-gray-300 leading-relaxed">{todayMission.description}</p>

              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="text-gray-500">
                  Technique: <span className="text-[#D4A017]">{todayMission.technique}</span>
                </span>
                <span className="text-gray-500">
                  Reward: <span className="text-[#D4A017]">{todayMission.xpReward} XP</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 shrink-0">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-mono">Resets in {timeLeft}</span>
            </div>
          </div>

          {/* Action area */}
          {todayCompleted && !gradeResult ? (
            <div className="mt-6 flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Mission Completed</span>
            </div>
          ) : grading ? (
            <div className="mt-6 flex items-center gap-2 text-[#D4A017]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">AI is grading your mission...</span>
            </div>
          ) : gradeResult ? (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-bold text-white text-lg">Grade: {gradeResult.grade}</span>
                <span className="text-[#D4A017] font-bold">+{gradeResult.xpEarned} XP</span>
              </div>
              <p className="text-gray-300 text-sm">{gradeResult.feedback}</p>
              <div className="bg-[#222222] rounded-lg p-3 border border-[#333333]">
                <span className="text-xs font-mono text-gray-500 uppercase">Insight</span>
                <p className="text-sm text-gray-300 mt-1">{gradeResult.insight}</p>
              </div>
            </div>
          ) : showCompletionForm ? (
            <CompletionForm
              mission={todayMission}
              onSubmit={handleComplete}
              onCancel={() => setShowCompletionForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowCompletionForm(true)}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              Complete Mission
            </button>
          )}
        </div>
      </div>

      {/* Previous Missions */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className="w-full text-left p-4 hover:bg-[#222222] transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-mono uppercase tracking-wider text-white">
              Previous Missions (Last 7 Days)
            </h3>
            {showPrevious ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </button>

        {showPrevious && (
          <div className="border-t border-[#333333]">
            {previousMissions.map(({ date, mission, completion }) => {
              const dateObj = new Date(date + 'T12:00:00');
              const dayStr = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={date}
                  className="flex items-center justify-between px-4 py-3 border-b border-[#333333] last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {completion ? (
                      <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{mission.title}</p>
                      <p className="text-xs text-gray-500">{dayStr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {completion ? (
                      <>
                        <span className="text-sm font-bold text-white">{completion.grade}</span>
                        <span className="text-xs text-[#D4A017]">+{completion.xpEarned} XP</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-600">Missed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
