'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { formatWithCitations } from '@/lib/format-citations';
import {
  Flame, Clock, Trophy, Target, CheckCircle, XCircle, Loader2,
  ChevronDown, ChevronUp, Star, Plus, Search, Calendar, TrendingUp, X,
} from 'lucide-react';
import { useTechniques } from '@/lib/hooks/useTechniques';
import { useAuth } from '@/lib/auth-context';

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

interface AIAnalysis {
  verdict: string;
  whatWorked: string[];
  whatToImprove: string[];
  techniqueGrade: Record<string, { grade: string; reason: string }>;
  patternInsight: string;
}

interface JournalReport {
  id: string;
  date: string;
  who: string;
  situation: string;
  goal: string;
  techniques: string[];
  whatIDid: string;
  theirResponse: string;
  outcome: number;
  notes: string;
  aiAnalysis: AIAnalysis | null;
}

interface WeeklyReview {
  summary: string;
  techniqueBreakdown: Record<string, { attempts: number; avgOutcome: number; assessment: string }>;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  trend?: string;
}

type TimeFilter = 'all' | 'week' | 'month';

// ── Mission Pool (fetched from API) ──────────────────────────────────────────

// Fallback missions used while the API is loading
const FALLBACK_MISSIONS: Mission[] = [
  { id: 1, title: 'Loading Missions...', description: 'Fetching your daily missions from the database...', technique: 'Patience', category: 'Influence', difficulty: 'Beginner', xpReward: 0, type: 'observer' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

// API endpoints replace localStorage keys

function getDefaultMissionsData(): MissionsData {
  return {
    completions: [],
    currentStreak: 0,
    longestStreak: 0,
    totalXP: 0,
    lastCompletedDate: null,
  };
}

function getDailyMission(pool: Mission[], dateStr?: string, completedIds?: Set<number>): Mission {
  if (pool.length === 0) return FALLBACK_MISSIONS[0];
  let availablePool = pool;
  if (completedIds && completedIds.size > 0) {
    const filtered = pool.filter(m => !completedIds.has(m.id));
    if (filtered.length > 0) availablePool = filtered;
    // If all completed, fall back to full pool
  }
  if (availablePool.length === 0) return FALLBACK_MISSIONS[0];
  const today = dateStr || new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) >>> 0;
  }
  const index = seed % availablePool.length;
  return availablePool[index];
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
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
  if (lastCompleted !== today && lastCompleted !== yesterday) {
    current = 0;
  }
  return { current, longest: Math.max(data.longestStreak, current) };
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
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

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= value ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-400 dark:text-[#555555]'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Mission Completion Form ───────────────────────────────────────────────────

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
    'w-full px-3 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-[#333333]">
      <div>
        <label className="block text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
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
        <label className="block text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
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
                  : 'bg-gray-50 dark:bg-[#222222] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#333333] hover:border-gray-400 dark:hover:border-[#555555]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
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
          className="px-6 py-2.5 border border-gray-200 dark:border-[#333333] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── New Report Form Modal ─────────────────────────────────────────────────────

function NewReportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (report: Omit<JournalReport, 'id' | 'date' | 'aiAnalysis'>) => void;
  onCancel: () => void;
}) {
  const [who, setWho] = useState('');
  const [situation, setSituation] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [whatIDid, setWhatIDid] = useState('');
  const [theirResponse, setTheirResponse] = useState('');
  const [outcome, setOutcome] = useState(3);
  const [notes, setNotes] = useState('');
  const [techSearch, setTechSearch] = useState('');
  const { techniques: apiTechniques } = useTechniques();

  const filteredTechniques = apiTechniques.filter(
    (t) =>
      t.name.toLowerCase().includes(techSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(techSearch.toLowerCase())
  );

  const toggleTechnique = (name: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || !whatIDid.trim()) return;
    onSubmit({ who, situation, goal, techniques: selectedTechniques, whatIDid, theirResponse, outcome, notes });
  };

  const inputCls =
    'w-full px-3 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]';
  const labelCls = 'block text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/40 dark:bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl p-6 space-y-5 mx-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-[#D4A017]">
            New Field Report
          </h2>
          <button type="button" onClick={onCancel} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className={labelCls}>Who (optional)</label>
          <input
            className={inputCls}
            placeholder="Person or group involved"
            value={who}
            onChange={(e) => setWho(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>
            Situation <span className="text-red-400">*</span>
          </label>
          <textarea
            className={`${inputCls} min-h-[80px]`}
            placeholder="What happened? Set the scene..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Goal</label>
          <input
            className={inputCls}
            placeholder="What were you trying to achieve?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Techniques Used</label>
          <input
            className={`${inputCls} mb-2`}
            placeholder="Search techniques..."
            value={techSearch}
            onChange={(e) => setTechSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
            {filteredTechniques.map((t) => {
              const selected = selectedTechniques.includes(t.name);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTechnique(t.name)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017]'
                      : 'bg-gray-50 dark:bg-[#222222] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-[#444444] hover:border-[#D4A017]'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            What You Said / Did <span className="text-red-400">*</span>
          </label>
          <textarea
            className={`${inputCls} min-h-[80px]`}
            placeholder="Describe your approach in detail..."
            value={whatIDid}
            onChange={(e) => setWhatIDid(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Their Response</label>
          <textarea
            className={`${inputCls} min-h-[80px]`}
            placeholder="How did they react?"
            value={theirResponse}
            onChange={(e) => setTheirResponse(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Outcome</label>
          <StarRating value={outcome} onChange={setOutcome} />
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={`${inputCls} min-h-[60px]`}
            placeholder="Anything else worth noting..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
          >
            Submit & Get Debrief
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-200 dark:border-[#333333] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: JournalReport }) {
  const [expanded, setExpanded] = useState(false);

  const dateStr = new Date(report.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-gray-500">{dateStr}</span>
              <StarRating value={report.outcome} readonly />
            </div>
            <p className="text-gray-900 dark:text-white font-medium truncate">{report.situation}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {report.techniques.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-xs rounded bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30"
                >
                  {t}
                </span>
              ))}
            </div>
            {report.aiAnalysis?.verdict && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                &quot;{report.aiAnalysis.verdict}&quot;
              </p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500 shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 shrink-0 mt-1" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-[#333333] p-4 space-y-4">
          {report.who && (
            <div>
              <span className="text-xs font-mono text-gray-500 uppercase">Who</span>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{report.who}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase">Goal</span>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{report.goal || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase">What You Did</span>
            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{report.whatIDid}</p>
          </div>
          {report.theirResponse && (
            <div>
              <span className="text-xs font-mono text-gray-500 uppercase">Their Response</span>
              <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{report.theirResponse}</p>
            </div>
          )}
          {report.notes && (
            <div>
              <span className="text-xs font-mono text-gray-500 uppercase">Notes</span>
              <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}

          {report.aiAnalysis && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#333333] space-y-3">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-[#D4A017]">
                AI Debrief
              </h4>

              <div>
                <span className="text-xs font-mono text-gray-500 uppercase">What Worked</span>
                <ul className="mt-1 space-y-1">
                  {report.aiAnalysis.whatWorked?.map((item, i) => (
                    <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                      <span className="mt-1 shrink-0">+</span>
                      <span>{formatWithCitations(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs font-mono text-gray-500 uppercase">What to Improve</span>
                <ul className="mt-1 space-y-1">
                  {report.aiAnalysis.whatToImprove?.map((item, i) => (
                    <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                      <span className="mt-1 shrink-0">-</span>
                      <span>{formatWithCitations(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {report.aiAnalysis.techniqueGrade && Object.keys(report.aiAnalysis.techniqueGrade).length > 0 && (
                <div>
                  <span className="text-xs font-mono text-gray-500 uppercase">Technique Grades</span>
                  <div className="mt-1 space-y-1">
                    {Object.entries(report.aiAnalysis.techniqueGrade).map(([name, info]) => (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-gray-900 dark:text-white w-8">{info.grade}</span>
                        <span className="text-[#D4A017]">{name}</span>
                        <span className="text-gray-500">- {info.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-[#222222] rounded-lg p-3 border border-gray-200 dark:border-[#333333]">
                <span className="text-xs font-mono text-gray-500 uppercase">Pattern Insight</span>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{report.aiAnalysis.patternInsight}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Weekly Review Section ────────────────────────────────────────────────────

function WeeklyReviewSection({ reports, getHeaders }: { reports: JournalReport[]; getHeaders: () => Promise<Record<string, string>> }) {
  const [expanded, setExpanded] = useState(false);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(false);

  const weekReports = reports.filter((r) => isThisWeek(r.date));
  const weekTechniques = weekReports.flatMap((r) => r.techniques);
  const uniqueTechniques = [...new Set(weekTechniques)];
  const avgOutcome =
    weekReports.length > 0
      ? (weekReports.reduce((s, r) => s + r.outcome, 0) / weekReports.length).toFixed(1)
      : '0';

  const fetchReview = async () => {
    if (weekReports.length === 0) return;
    setLoading(true);
    try {
      const authHeaders = await getHeaders();
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ action: 'weekly-review', reports: weekReports }),
      });
      const data = await res.json();
      if (!data.error) setReview(data);
    } catch (e) {
      console.error('Failed to fetch weekly review:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-[#D4A017]/30 rounded-xl overflow-hidden">
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && !review && weekReports.length > 0) fetchReview();
        }}
        className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#D4A017]" />
            <h3 className="font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
              Weekly Review
            </h3>
            <span className="text-xs text-gray-500">
              {weekReports.length} report{weekReports.length !== 1 ? 's' : ''} this week
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-[#333333] p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{weekReports.length}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueTechniques.length}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Techniques</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgOutcome}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Avg Outcome</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 text-[#D4A017] animate-spin" />
              <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">Generating weekly review...</span>
            </div>
          )}

          {review && !loading && (
            <div className="space-y-3 pt-2">
              <div className="bg-gray-50 dark:bg-[#222222] rounded-lg p-3 border border-gray-200 dark:border-[#333333]">
                <p className="text-sm text-gray-600 dark:text-gray-300">{review.summary}</p>
              </div>

              {review.strengths?.length > 0 && (
                <div>
                  <span className="text-xs font-mono text-gray-500 uppercase">Strengths</span>
                  <ul className="mt-1 space-y-1">
                    {review.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-400">+ {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.weaknesses?.length > 0 && (
                <div>
                  <span className="text-xs font-mono text-gray-500 uppercase">Areas to Improve</span>
                  <ul className="mt-1 space-y-1">
                    {review.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-red-400">- {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.recommendation && (
                <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-lg p-3">
                  <span className="text-xs font-mono text-[#D4A017] uppercase">Recommendation</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{review.recommendation}</p>
                </div>
              )}
            </div>
          )}

          {weekReports.length === 0 && !loading && (
            <p className="text-sm text-gray-500 text-center py-4">
              No reports this week yet. Complete a mission or submit a field report to get your weekly review.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function FieldOpsPage() {
  const { user } = useAuth();

  const getHeaders = useCallback(async () => {
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  // ── Mission state ──
  const [missionsData, setMissionsData] = useState<MissionsData>(getDefaultMissionsData());
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<{
    grade: string;
    feedback: string;
    xpEarned: number;
    insight: string;
  } | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);

  // ── Journal state ──
  const [reports, setReports] = useState<JournalReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ── Shared state ──
  const [isLoading, setIsLoading] = useState(true);
  const [missionPool, setMissionPool] = useState<Mission[]>([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [lowPoolWarning, setLowPoolWarning] = useState(false);
  const [generating, setGenerating] = useState(false);

  const ADMIN_EMAILS = ['ybyalik@gmail.com'];
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  // Fetch user profile for goals, then mission pool with category filter
  useEffect(() => {
    async function fetchMissionPool() {
      try {
        // Fetch user goals first
        const token = await user?.getIdToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let goals: string[] = [];
        if (user) {
          try {
            const profileRes = await fetch('/api/user', { headers });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              goals = profileData.profile?.goals || [];
              setUserGoals(goals);
            }
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
          }
        }

        const url = goals.length > 0
          ? `/api/missions/pool?categories=${goals.join(',')}`
          : '/api/missions/pool';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMissionPool(data.missions || []);
        }
      } catch (err) {
        console.error('Failed to fetch mission pool:', err);
      } finally {
        setPoolLoading(false);
      }
    }
    fetchMissionPool();
  }, [user]);

  // Completed mission IDs
  const completedIds = useMemo(() => {
    return new Set(missionsData.completions.map(c => c.missionId));
  }, [missionsData.completions]);

  // Difficulty progression
  const completionCount = missionsData.completions.length;
  const difficultyFilter: Difficulty[] = useMemo(() => {
    if (completionCount < 6) return ['Beginner'];
    if (completionCount < 16) return ['Beginner', 'Intermediate'];
    return ['Beginner', 'Intermediate', 'Advanced'];
  }, [completionCount]);

  // Filtered pool: difficulty -> check low pool -> daily pick excludes completed
  const filteredPool = useMemo(() => {
    const diffFiltered = missionPool.filter(m => difficultyFilter.includes(m.difficulty));
    return diffFiltered;
  }, [missionPool, difficultyFilter]);

  // Check low pool warning
  useEffect(() => {
    if (filteredPool.length === 0) return;
    const availableAfterCompleted = filteredPool.filter(m => !completedIds.has(m.id));
    setLowPoolWarning(availableAfterCompleted.length < 3);
  }, [filteredPool, completedIds]);

  // Today's mission
  const todayStr = getDateString();
  const todayMission = useMemo(() => getDailyMission(filteredPool, todayStr, completedIds), [filteredPool, todayStr, completedIds]);
  const todayCompleted = missionsData.completions.some((c) => c.date === todayStr);

  // Streak
  const streakInfo = useMemo(() => calculateStreak(missionsData), [missionsData]);

  // Previous 7 days
  const previousMissions = useMemo(() => {
    const missions: { date: string; mission: Mission; completion: MissionCompletion | undefined }[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = getDateString(date);
      const mission = getDailyMission(filteredPool, dateStr, completedIds);
      const completion = missionsData.completions.find((c) => c.date === dateStr);
      missions.push({ date: dateStr, mission, completion });
    }
    return missions;
  }, [filteredPool, missionsData.completions, completedIds]);

  // Timer
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

  // ── Load from API ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const headers = await getHeaders();
        const [missionsRes, reportsRes] = await Promise.all([
          fetch('/api/missions/completions', { headers }),
          fetch('/api/journal/reports?period=all', { headers }),
        ]);
        if (missionsRes.ok) {
          const data = await missionsRes.json();
          setMissionsData({
            completions: data.completions || [],
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            totalXP: data.totalXP || 0,
            lastCompletedDate: data.lastCompletedDate || null,
          });
        }
        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setReports(data.reports || []);
        }
      } catch (e) {
        console.error('Failed to load field ops data:', e);
      }
      setIsLoading(false);
    };
    loadData();
  }, [getHeaders]);

  // ── Handle mission completion (+ auto-create field report) ──
  const handleComplete = async (completionData: {
    whatHappened: string;
    didItWork: 'Yes' | 'Somewhat' | 'No';
    notes: string;
  }) => {
    setGrading(true);
    setShowCompletionForm(false);

    try {
      const authHeaders = await getHeaders();
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
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

        setMissionsData((prev) => {
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

        // Persist mission completion to API
        fetch('/api/missions/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(newCompletion),
        }).catch((e) => console.error('Failed to save mission completion:', e));

        // Save to practice_results for Persuasion Score integration
        const missionScore = result.grade === 'A+' ? 100 : result.grade === 'A' ? 90 : result.grade === 'B+' ? 85 : result.grade === 'B' ? 80 : result.grade === 'C+' ? 75 : result.grade === 'C' ? 70 : result.grade === 'D' ? 50 : 40;
        fetch('/api/practice-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            type: 'mission',
            reference_id: `mission-${todayMission.id}`,
            score: missionScore,
            xp_earned: result.xpEarned || 0,
            techniques_used: [todayMission.technique],
            feedback: { grade: result.grade, feedback: result.feedback, insight: result.insight },
          }),
        }).catch((e) => console.error('Failed to save practice result:', e));

        // ── Auto-create a field report from the mission completion ──
        const outcomeScore = completionData.didItWork === 'Yes' ? 5 : completionData.didItWork === 'Somewhat' ? 3 : 1;
        const autoReport: JournalReport = {
          id: `mission-${todayMission.id}-${Date.now()}`,
          date: new Date().toISOString(),
          who: '',
          situation: `[Daily Mission] ${todayMission.title}: ${todayMission.description}`,
          goal: `Practice ${todayMission.technique} technique (${todayMission.category})`,
          techniques: [todayMission.technique],
          whatIDid: completionData.whatHappened,
          theirResponse: '',
          outcome: outcomeScore,
          notes: [
            completionData.notes,
            `Grade: ${result.grade} | XP: +${result.xpEarned || 0}`,
            result.feedback,
          ]
            .filter(Boolean)
            .join('\n'),
          aiAnalysis: {
            verdict: result.feedback || '',
            whatWorked: result.insight ? [result.insight] : [],
            whatToImprove: [],
            techniqueGrade: {
              [todayMission.technique]: {
                grade: result.grade || 'N/A',
                reason: result.feedback || '',
              },
            },
            patternInsight: result.insight || '',
          },
        };
        setReports((prev) => [autoReport, ...prev]);

        // Persist auto-report to API
        fetch('/api/journal/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(autoReport),
        }).catch((e) => console.error('Failed to save auto-report:', e));

        // Also request a full AI debrief for the auto-created report
        try {
          const debriefRes = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({
              action: 'debrief',
              report: {
                who: autoReport.who,
                situation: autoReport.situation,
                goal: autoReport.goal,
                techniques: autoReport.techniques,
                whatIDid: autoReport.whatIDid,
                theirResponse: autoReport.theirResponse,
                outcome: autoReport.outcome,
                notes: autoReport.notes,
              },
            }),
          });
          const analysis = await debriefRes.json();
          if (!analysis.error) {
            setReports((prev) =>
              prev.map((r) => (r.id === autoReport.id ? { ...r, aiAnalysis: analysis } : r))
            );
          }
        } catch {
          // Debrief is best-effort; the report was already saved with mission grading data
        }
      }
    } catch (e) {
      console.error('Failed to grade mission:', e);
    } finally {
      setGrading(false);
    }
  };

  // ── Handle manual report submission ──
  const handleSubmitReport = async (
    reportData: Omit<JournalReport, 'id' | 'date' | 'aiAnalysis'>
  ) => {
    setSubmitting(true);
    const authHeaders = await getHeaders();
    const newReport: JournalReport = {
      ...reportData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      aiAnalysis: null,
    };

    setReports((prev) => [newReport, ...prev]);
    setShowForm(false);

    // Persist report to API
    fetch('/api/journal/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(newReport),
    }).catch((e) => console.error('Failed to save report:', e));

    // Save to practice_results for Persuasion Score integration
    const fieldReportScore = reportData.outcome * 20; // 1-5 outcome mapped to 20-100
    fetch('/api/practice-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        type: 'field_report',
        reference_id: newReport.id,
        score: fieldReportScore,
        techniques_used: reportData.techniques || [],
        feedback: { situation: reportData.situation, outcome: reportData.outcome },
      }),
    }).catch((e) => console.error('Failed to save field report practice result:', e));

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ action: 'debrief', report: reportData }),
      });
      const analysis = await res.json();
      if (!analysis.error) {
        setReports((prev) =>
          prev.map((r) => (r.id === newReport.id ? { ...r, aiAnalysis: analysis } : r))
        );
      }
    } catch (e) {
      console.error('Failed to get AI debrief:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Combined stats ──
  const weekReports = reports.filter((r) => isThisWeek(r.date));
  const winRate =
    reports.length > 0
      ? Math.round((reports.filter((r) => r.outcome >= 4).length / reports.length) * 100)
      : 0;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (timeFilter === 'week' && !isThisWeek(r.date)) return false;
      if (timeFilter === 'month' && !isThisMonth(r.date)) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          r.situation.toLowerCase().includes(q) ||
          r.who.toLowerCase().includes(q) ||
          r.goal.toLowerCase().includes(q) ||
          r.techniques.some((t) => t.toLowerCase().includes(q)) ||
          (r.aiAnalysis?.verdict || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, timeFilter, searchTerm]);

  if (isLoading || poolLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">Field Ops</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Daily missions, field reports, and tactical analysis -- all in one place.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Report
          </button>
          <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] border border-[#D4A017]/30 rounded-xl px-5 py-3">
            <Flame className="h-7 w-7 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{streakInfo.current}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-400">{streakInfo.current}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Current Streak</p>
            </div>
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[#D4A017]">{missionsData.totalXP}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Total XP</p>
            </div>
            <Trophy className="h-6 w-6 text-[#D4A017]" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-400">{weekReports.length}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Reports This Week</p>
            </div>
            <Calendar className="h-6 w-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-400">{winRate}%</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Win Rate</p>
            </div>
            <Target className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* ── Section 1: Today's Mission ── */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#D4A017]/40 rounded-xl overflow-hidden">
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

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{todayMission.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{todayMission.description}</p>

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
                <span className="font-bold text-gray-900 dark:text-white text-lg">Grade: {gradeResult.grade}</span>
                <span className="text-[#D4A017] font-bold">+{gradeResult.xpEarned} XP</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{formatWithCitations(gradeResult.feedback)}</p>
              <div className="bg-gray-50 dark:bg-[#222222] rounded-lg p-3 border border-gray-200 dark:border-[#333333]">
                <span className="text-xs font-mono text-gray-500 uppercase">Insight</span>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{formatWithCitations(gradeResult.insight)}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                A field report has been automatically created from this mission.
              </p>
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

      {/* ── Low Pool Warning ── */}
      {lowPoolWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
          <Target className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300 flex-1">
            Running low on missions for your focus areas. New missions will be generated from your knowledge base.
          </p>
        </div>
      )}

      {/* ── Admin: Generate Missions ── */}
      {isAdmin && (
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-gray-500 uppercase tracking-wider">Admin</p>
            <p className="text-xs text-gray-400 mt-1">
              Pool: {filteredPool.length} missions after filters ({missionPool.length} total)
            </p>
          </div>
          <button
            onClick={async () => {
              setGenerating(true);
              try {
                const authHeaders = await getHeaders();
                const res = await fetch('/api/missions/pool', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...authHeaders },
                  body: JSON.stringify({ count: 5 }),
                });
                if (res.ok) {
                  const data = await res.json();
                  setMissionPool(prev => [...prev, ...(data.generated || [])]);
                }
              } catch (err) {
                console.error('Failed to generate missions:', err);
              } finally {
                setGenerating(false);
              }
            }}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40 rounded-lg text-sm font-medium hover:bg-[#D4A017]/30 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Generate More Missions
          </button>
        </div>
      )}

      {/* ── Section 2: Field Reports ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
            Field Reports
          </h2>
          <span className="text-xs font-mono text-gray-500">{reports.length} total</span>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search reports, techniques, people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'week', 'month'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === f
                    ? 'bg-[#D4A017] text-[#0A0A0A]'
                    : 'bg-gray-50 dark:bg-[#222222] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#333333] hover:border-[#D4A017]'
                }`}
              >
                {f === 'all' ? 'All' : f === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Submitting indicator */}
        {submitting && (
          <div className="flex items-center gap-2 text-[#D4A017] bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-lg px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI is analyzing your report...</span>
          </div>
        )}

        {/* Report List */}
        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {searchTerm || timeFilter !== 'all' ? (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">No reports match your filters</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or time filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Calendar className="h-16 w-16 text-[#333333] mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-[#D4A017] mb-2">No Field Reports Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Complete today&apos;s mission or submit a manual field report to start building your ops log.
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#D4A017] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
                >
                  Submit Your First Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 3: Previous Missions (collapsible) ── */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white">
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
          <div className="border-t border-gray-200 dark:border-[#333333]">
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
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#333333] last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {completion ? (
                      <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{mission.title}</p>
                      <p className="text-xs text-gray-500">{dayStr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {completion ? (
                      <>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{completion.grade}</span>
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

      {/* ── Section 4: Weekly Review (collapsible) ── */}
      <WeeklyReviewSection reports={reports} getHeaders={getHeaders} />

      {/* ── New Report Form Modal ── */}
      {showForm && (
        <NewReportForm onSubmit={handleSubmitReport} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
}
