'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Star, ChevronDown, ChevronUp, Calendar, TrendingUp, Award, Loader2, X } from 'lucide-react';
import { techniques, type Technique } from '@/lib/techniques';

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'shadow-journal-data';

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
              star <= value ? 'text-[#D4A017] fill-[#D4A017]' : 'text-[#555555]'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── New Report Form ────────────────────────────────────────────────────────────

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

  const filteredTechniques = techniques.filter(
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
    'w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]';
  const labelCls = 'block text-sm font-mono uppercase tracking-wider text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 space-y-5 mx-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-[#D4A017]">
            New Field Report
          </h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white">
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

        {/* Technique multi-select */}
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
                      : 'bg-[#222222] text-gray-300 border-[#444444] hover:border-[#D4A017]'
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
            Submit & Get AI Debrief
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
    </div>
  );
}

// ── Report Card ────────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: JournalReport }) {
  const [expanded, setExpanded] = useState(false);

  const dateStr = new Date(report.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl overflow-hidden">
      {/* Collapsed view */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-[#222222] transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-gray-500">{dateStr}</span>
              <StarRating value={report.outcome} readonly />
            </div>
            <p className="text-white font-medium truncate">{report.situation}</p>
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
              <p className="text-sm text-gray-400 mt-2 italic">
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

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-[#333333] p-4 space-y-4">
          {report.who && (
            <div>
              <span className="text-xs font-mono text-gray-500 uppercase">Who</span>
              <p className="text-gray-300 text-sm">{report.who}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase">Goal</span>
            <p className="text-gray-300 text-sm">{report.goal || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase">What You Did</span>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.whatIDid}</p>
          </div>
          {report.theirResponse && (
            <div>
              <span className="text-xs font-mono text-gray-500 uppercase">Their Response</span>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.theirResponse}</p>
            </div>
          )}
          {report.notes && (
            <div>
              <span className="text-xs font-mono text-gray-500 uppercase">Notes</span>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.notes}</p>
            </div>
          )}

          {/* AI Analysis */}
          {report.aiAnalysis && (
            <div className="mt-4 pt-4 border-t border-[#333333] space-y-3">
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-[#D4A017]">
                AI Debrief
              </h4>

              <div>
                <span className="text-xs font-mono text-gray-500 uppercase">What Worked</span>
                <ul className="mt-1 space-y-1">
                  {report.aiAnalysis.whatWorked?.map((item, i) => (
                    <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                      <span className="mt-1 shrink-0">+</span>
                      <span>{item}</span>
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
                      <span>{item}</span>
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
                        <span className="font-bold text-white w-8">{info.grade}</span>
                        <span className="text-[#D4A017]">{name}</span>
                        <span className="text-gray-500">- {info.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#222222] rounded-lg p-3 border border-[#333333]">
                <span className="text-xs font-mono text-gray-500 uppercase">Pattern Insight</span>
                <p className="text-sm text-gray-300 mt-1">{report.aiAnalysis.patternInsight}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Weekly Review Section ──────────────────────────────────────────────────────

function WeeklyReviewSection({ reports }: { reports: JournalReport[] }) {
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
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="bg-[#1A1A1A] border border-[#D4A017]/30 rounded-xl overflow-hidden">
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && !review && weekReports.length > 0) fetchReview();
        }}
        className="w-full text-left p-4 hover:bg-[#222222] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#D4A017]" />
            <h3 className="font-bold font-mono uppercase tracking-wider text-white">
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
        <div className="border-t border-[#333333] p-4 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{weekReports.length}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{uniqueTechniques.length}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Techniques</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{avgOutcome}</p>
              <p className="text-xs font-mono text-gray-500 uppercase">Avg Outcome</p>
            </div>
          </div>

          {/* AI Review */}
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 text-[#D4A017] animate-spin" />
              <span className="ml-2 text-gray-400 text-sm">Generating weekly review...</span>
            </div>
          )}

          {review && !loading && (
            <div className="space-y-3 pt-2">
              <div className="bg-[#222222] rounded-lg p-3 border border-[#333333]">
                <p className="text-sm text-gray-300">{review.summary}</p>
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
                  <p className="text-sm text-gray-300 mt-1">{review.recommendation}</p>
                </div>
              )}
            </div>
          )}

          {weekReports.length === 0 && !loading && (
            <p className="text-sm text-gray-500 text-center py-4">
              No reports this week yet. Submit a field report to get your weekly review.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [reports, setReports] = useState<JournalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReports(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load journal data:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  }, [reports, isLoading]);

  // Submit new report + get AI debrief
  const handleSubmitReport = async (
    reportData: Omit<JournalReport, 'id' | 'date' | 'aiAnalysis'>
  ) => {
    setSubmitting(true);
    const newReport: JournalReport = {
      ...reportData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      aiAnalysis: null,
    };

    // Optimistic add
    setReports((prev) => [newReport, ...prev]);
    setShowForm(false);

    // Fetch AI debrief
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Stats
  const weekReports = reports.filter((r) => isThisWeek(r.date));
  const winRate =
    reports.length > 0
      ? Math.round((reports.filter((r) => r.outcome >= 4).length / reports.length) * 100)
      : 0;

  const techniqueCounts = reports.flatMap((r) => r.techniques).reduce(
    (acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const mostUsed = Object.entries(techniqueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Filtering
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
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">Field Reports</h1>
          <p className="text-gray-400 mt-2">
            Log real-world interactions, track techniques, and get AI tactical feedback.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Report
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <p className="text-2xl font-bold text-white">{reports.length}</p>
          <p className="text-xs font-mono text-gray-500 uppercase">Total Reports</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <p className="text-2xl font-bold text-blue-400">{weekReports.length}</p>
          <p className="text-xs font-mono text-gray-500 uppercase">This Week</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <p className="text-2xl font-bold text-green-400">{winRate}%</p>
          <p className="text-xs font-mono text-gray-500 uppercase">Win Rate (4-5 stars)</p>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
          <p className="text-2xl font-bold text-[#D4A017] truncate">{mostUsed}</p>
          <p className="text-xs font-mono text-gray-500 uppercase">Most Used</p>
        </div>
      </div>

      {/* Weekly Review */}
      <WeeklyReviewSection reports={reports} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports, techniques, people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#D4A017]"
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
                  : 'bg-[#222222] text-gray-300 border border-[#333333] hover:border-[#D4A017]'
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
              <p className="text-gray-400 text-lg">No reports match your filters</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or time filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Calendar className="h-16 w-16 text-[#333333] mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-[#D4A017] mb-2">Start Logging Field Reports</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  After every real-world interaction where you used influence techniques, log it here.
                  The AI will debrief you and track your progress over time.
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

      {/* New Report Form Modal */}
      {showForm && (
        <NewReportForm onSubmit={handleSubmitReport} onCancel={() => setShowForm(false)} />
      )}
    </div>
  );
}
