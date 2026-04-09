'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, Trash2, Zap } from 'lucide-react';
import { GoalSelector } from '@/components/app/GoalSelector';
import { StrategicChat } from '@/components/app/StrategicChat';

interface Goal {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    examples: string[];
}

interface ChatSession {
  id: string;
  title: string;
  goal_title: string | null;
  session_type: string;
  created_at: string;
  updated_at: string;
  lastMessage: string | null;
  lastMessageRole: string | null;
  lastMessageAt: string | null;
}

interface QuickfireResponseOption {
  approach: string;
  sayThis: string;
  why: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface QuickfireScenario {
  ifTheySay: string;
  thenSay: string;
  why: string;
}

interface QuickfireResponse {
  responses: QuickfireResponseOption[];
  avoid: string;
  scenarios: QuickfireScenario[];
  classification: string;
  technique: string;
}

export default function ChatListPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'list' | 'strategic' | 'quickfire'>('list');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Quick-Fire state
  const [qfSituation, setQfSituation] = useState('');
  const [qfContext, setQfContext] = useState('');
  const [qfShowContext, setQfShowContext] = useState(false);
  const [qfResponse, setQfResponse] = useState<QuickfireResponse | null>(null);
  const [qfIsLoading, setQfIsLoading] = useState(false);
  const [qfError, setQfError] = useState<string | null>(null);
  const [qfCopied, setQfCopied] = useState<string | null>(null);
  const [qfHistory, setQfHistory] = useState<{ id: string; situation: string; classification?: string; technique?: string; created_at: string }[]>([]);
  const [qfHistoryExpanded, setQfHistoryExpanded] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.sessions || []);
      }
    } catch (e) {
      console.error('Failed to fetch conversations:', e);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewGeneralChat = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat', session_type: 'general' }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/app/chat/${data.session.id}`);
      }
    } catch (e) {
      console.error('Failed to create chat session:', e);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/conversations?id=${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalSelector(false);
    setMode('strategic');
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
    setShowGoalSelector(false);
    setMode('list');
  };

  const handleBackToGoals = () => {
    setSelectedGoal(null);
    setShowGoalSelector(true);
    setMode('list');
  };

  // Quick-Fire handlers
  const fetchQfHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/quickfire/history?limit=10');
      if (res.ok) {
        const data = await res.json();
        setQfHistory(data.history || []);
      }
    } catch {}
  }, []);

  const handleQfSubmit = async () => {
    if (!qfSituation.trim()) return;

    setQfIsLoading(true);
    setQfError(null);
    setQfResponse(null);

    try {
      const res = await fetch('/api/quickfire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: qfSituation.trim(),
          context: qfShowContext && qfContext.trim() ? qfContext.trim() : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get tactical response.');
      }

      const data = await res.json();
      setQfResponse(data);

      // Auto-save to history
      fetch('/api/quickfire/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: qfSituation.trim(),
          context: qfShowContext && qfContext.trim() ? qfContext.trim() : undefined,
          classification: data.classification,
          technique: data.technique,
          responses: data.responses,
          avoid: data.avoid,
          scenarios: data.scenarios,
          fullResult: data,
        }),
      }).then(() => fetchQfHistory()).catch(console.error);
    } catch (err) {
      setQfError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setQfIsLoading(false);
    }
  };

  const handleQfKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleQfSubmit();
    }
  };

  const handleQfCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setQfCopied(key);
    setTimeout(() => setQfCopied(null), 2000);
  };

  const handleQfReset = () => {
    setQfResponse(null);
    setQfSituation('');
    setQfContext('');
    setQfError(null);
  };

  const handleEnterQuickfire = () => {
    setMode('quickfire');
    handleQfReset();
    fetchQfHistory();
  };

  const handleExitQuickfire = () => {
    setMode('list');
    handleQfReset();
  };

  // Strategic Chat Session
  if (mode === 'strategic' && selectedGoal) {
    return <StrategicChat goal={selectedGoal} onBack={handleBackToGoals} />;
  }

  // Goal Selection
  if (showGoalSelector) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </button>
        <GoalSelector onSelectGoal={handleSelectGoal} />
      </div>
    );
  }

  // Quick-Fire Mode
  if (mode === 'quickfire') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <button
            onClick={handleExitQuickfire}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </button>
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
            <span className="text-[#D4A017]">&#9889;</span> Quick-Fire Mode
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Real-time tactical responses. Type your situation, get exact words in seconds.
          </p>
        </header>

        {!qfResponse && !qfIsLoading && (
          <div className="space-y-4">
            <textarea
              value={qfSituation}
              onChange={(e) => setQfSituation(e.target.value)}
              onKeyDown={handleQfKeyDown}
              placeholder="I'm in a meeting and my boss just..."
              className="w-full h-32 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 text-gray-900 dark:text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors resize-none"
              autoFocus
            />

            <div>
              <button
                onClick={() => setQfShowContext(!qfShowContext)}
                className="text-sm text-gray-500 hover:text-[#D4A017] transition-colors flex items-center gap-1"
              >
                <span className={`inline-block transition-transform ${qfShowContext ? 'rotate-90' : ''}`}>
                  &#9654;
                </span>
                Who is this about?
              </button>

              {qfShowContext && (
                <input
                  type="text"
                  value={qfContext}
                  onChange={(e) => setQfContext(e.target.value)}
                  placeholder="e.g. My manager Sarah, tends to be passive-aggressive"
                  className="w-full mt-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-3 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
                />
              )}
            </div>

            <button
              onClick={handleQfSubmit}
              disabled={!qfSituation.trim()}
              className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <span>&#9889;</span> Get Tactical Response
            </button>

            <p className="text-center text-xs text-gray-600">
              Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded text-gray-500 dark:text-gray-400 text-xs">Cmd+Enter</kbd> to submit
            </p>
          </div>
        )}

        {qfIsLoading && (
          <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg">
            <div className="animate-pulse space-y-2">
              <p className="font-mono text-lg text-[#D4A017]">&#9889; ANALYZING SITUATION...</p>
              <p className="text-sm text-gray-500">Generating tactical response</p>
            </div>
          </div>
        )}

        {qfError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
            {qfError}
          </div>
        )}

        {qfResponse && (
          <div className="space-y-6">
            {/* Classification & Technique Header */}
            <div className="flex items-center gap-3 flex-wrap">
              {qfResponse.classification && (
                <span className="font-mono text-xs uppercase tracking-wider px-2 py-1 bg-[#D4A017]/20 text-[#D4A017] rounded">
                  {qfResponse.classification.replace(/_/g, ' ')}
                </span>
              )}
              {qfResponse.technique && (
                <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Technique: {qfResponse.technique}
                </span>
              )}
            </div>

            {/* 3 Response Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {qfResponse.responses?.map((resp, idx) => {
                const riskColor = resp.riskLevel === 'LOW'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
                  : resp.riskLevel === 'HIGH'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
                const isRecommended = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`bg-white dark:bg-[#1A1A1A] rounded-lg p-5 flex flex-col gap-3 border-2 ${
                      isRecommended
                        ? 'border-[#D4A017]'
                        : 'border-gray-200 dark:border-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        {resp.approach}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${riskColor}`}>
                        {resp.riskLevel}
                      </span>
                    </div>
                    {isRecommended && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017]">
                        &#9733; Recommended
                      </span>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold">
                          Say This:
                        </span>
                        <button
                          onClick={() => handleQfCopy(resp.sayThis, `resp-${idx}`)}
                          className="text-xs text-gray-500 hover:text-[#D4A017] transition-colors font-mono"
                        >
                          {qfCopied === `resp-${idx}` ? '[ COPIED ]' : '[ COPY ]'}
                        </button>
                      </div>
                      <p className="text-gray-900 dark:text-white text-base leading-relaxed">
                        &ldquo;{resp.sayThis}&rdquo;
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                        Why:
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 mt-1 text-xs">{resp.why}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AVOID Section */}
            <div className="bg-red-950/20 dark:bg-red-950/30 border border-red-900/50 rounded-lg p-4">
              <span className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold">
                &#9888; Avoid:
              </span>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{qfResponse.avoid}</p>
            </div>

            {/* Scenario Tree */}
            {qfResponse.scenarios && qfResponse.scenarios.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-mono text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  If They Say&hellip;
                </h3>
                <div className="space-y-0">
                  {qfResponse.scenarios.map((scenario, idx) => (
                    <div key={idx} className="flex gap-3">
                      {/* Connecting line */}
                      <div className="flex flex-col items-center w-6 flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D4A017] mt-5 flex-shrink-0" />
                        {idx < qfResponse.scenarios.length - 1 && (
                          <div className="w-0.5 flex-1 bg-[#D4A017]/30" />
                        )}
                      </div>
                      {/* Card */}
                      <div className="flex-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 mb-3">
                        <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                          &ldquo;{scenario.ifTheySay}&rdquo;
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold">
                              Then Say:
                            </span>
                            <button
                              onClick={() => handleQfCopy(scenario.thenSay, `scenario-${idx}`)}
                              className="text-xs text-gray-500 hover:text-[#D4A017] transition-colors font-mono"
                            >
                              {qfCopied === `scenario-${idx}` ? '[ COPIED ]' : '[ COPY ]'}
                            </button>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium text-sm">
                            &ldquo;{scenario.thenSay}&rdquo;
                          </p>
                        </div>
                        <div className="mt-2">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Why:
                          </span>
                          <p className="text-gray-600 dark:text-gray-300 text-xs">{scenario.why}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleQfReset}
              className="w-full py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
            >
              New Situation
            </button>
          </div>
        )}

        {/* Quick-Fire History */}
        {qfHistory.length > 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                Recent Quick-Fire
              </span>
              {qfHistory.length > 3 && (
                <button
                  onClick={() => setQfHistoryExpanded(!qfHistoryExpanded)}
                  className="text-xs text-[#D4A017] hover:text-[#E8B830] font-mono uppercase"
                >
                  {qfHistoryExpanded ? 'Show Less' : `View All (${qfHistory.length})`}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {(qfHistoryExpanded ? qfHistory : qfHistory.slice(0, 3)).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg group"
                >
                  <span className="text-lg">⚡</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{item.situation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(item.created_at)}</span>
                      {item.classification && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#D4A017]/10 text-[#D4A017] rounded">
                          {item.classification.replace(/_/g, ' ')}
                        </span>
                      )}
                      {item.technique && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.technique}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/quickfire/history?id=${item.id}`, { method: 'DELETE' });
                        setQfHistory(prev => prev.filter(h => h.id !== item.id));
                      } catch {}
                    }}
                    className="flex-shrink-0 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Chat List
  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
              Strategic Communication Sessions
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGoalSelector(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#E8B030] transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New Strategic Session</span>
            </button>
            <button
              onClick={handleEnterQuickfire}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 transition-colors"
            >
              <Zap className="h-5 w-5" />
              <span>Quick-Fire Mode</span>
            </button>
            <button
              onClick={handleNewGeneralChat}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-[#444444] transition-colors"
            >
              <span>New Chat</span>
            </button>
          </div>
      </header>

      {isLoadingConversations ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
        </div>
      ) : conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map(convo => (
            <Link href={`/app/chat/${convo.id}`} key={convo.id} className="block p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] hover:border-[#D4A017] relative group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold truncate">{convo.title}</h2>
                      {convo.session_type === 'strategic' && (
                        <span className="text-xs px-2 py-0.5 bg-[#D4A017]/20 text-[#D4A017] rounded-full flex-shrink-0">Strategic</span>
                      )}
                    </div>
                    {convo.goal_title && (
                      <p className="text-xs text-[#D4A017] mt-0.5">{convo.goal_title}</p>
                    )}
                    {convo.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{convo.lastMessage}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{formatTimestamp(convo.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(convo.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                    title="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Strategic Session CTA */}
          <div
            onClick={() => setShowGoalSelector(true)}
            className="p-8 text-center rounded-lg border-2 border-dashed border-[#D4A017] hover:border-[#F4D03F] hover:bg-amber-50 dark:hover:bg-[#2A2520] transition-all cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="text-6xl">&#127919;</div>
              <div>
                <h3 className="text-xl font-bold text-[#D4A017] group-hover:text-[#F4D03F] transition-colors">
                  Start Your First Strategic Session
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  Get goal-focused coaching with specific tactics, exact scripts, and real-time guidance
                  for negotiations, influence, relationships, and more.
                </p>
              </div>
              <button className="bg-[#D4A017] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors">
                Choose Your Objective
              </button>
            </div>
          </div>

          {/* Quick-Fire CTA */}
          <div
            onClick={handleEnterQuickfire}
            className="p-6 text-center rounded-lg border-2 border-dashed border-amber-600 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-[#2A2218] transition-all cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="text-4xl">&#9889;</div>
              <div>
                <h3 className="text-lg font-bold text-amber-600 group-hover:text-amber-400 transition-colors">
                  Quick-Fire Mode
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm max-w-md mx-auto">
                  Need exact words right now? Get instant tactical responses for any situation in seconds.
                </p>
              </div>
            </div>
          </div>

          {/* General Chat Option */}
          <div className="p-6 text-center rounded-lg border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1A1A1A]">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Or continue with the general-purpose chat for open-ended conversations
            </p>
            <button
              onClick={handleNewGeneralChat}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-[#444444] transition-colors"
            >
              <span>Open General Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
