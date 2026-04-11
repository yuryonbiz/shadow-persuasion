'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRef } from 'react';
import { ArrowLeft, BookOpen, Target, CheckCircle, XCircle, Lightbulb, MessageSquare, Swords, Link2, Sparkles, Book, Loader2, RefreshCw, ChevronDown, ChevronUp, Send, Briefcase, Heart, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { getCategoryIcon } from '@/lib/category-icons';

const ADMIN_EMAILS = ['ybyalik@gmail.com'];
const formatLabel = (s: string) => s.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
import NextLink from 'next/link';
// Scenarios are fetched dynamically from the API

// ── Types ──

interface ChunkItem {
  id: string;
  content: string;
  bookTitle: string;
  author: string;
}

interface TechniqueDetail {
  id: string;
  name: string;
  category: string;
  difficulty: number;
  chunks: {
    overview: ChunkItem[];
    application: ChunkItem[];
    example: ChunkItem[];
    framework: ChunkItem[];
    exercise: ChunkItem[];
  };
  books: { title: string; author: string }[];
  relatedTechniques: string[];
  useCases: string[];
  riskLevel: string;
}

interface ConversationScriptLine {
  speaker: string;
  line: string;
  annotation?: string;
}

interface ConversationExample {
  context: string;
  title: string;
  script: ConversationScriptLine[];
  result: string;
  whyItWorked: string;
}

interface SynthesizedProfile {
  description: string;
  howTo: string[];
  whenToUse: string;
  whenNotToUse: string;
  examples: { scenario: string; description: string }[];
  conversationExamples?: ConversationExample[];
}

interface RoleplayMessage {
  role: 'user' | 'assistant';
  content: string;
  coaching?: {
    score: number;
    feedback: string;
    idealResponse: string;
    techniqueApplication: string;
    turnNumber: number;
    maxTurns: number;
    summary?: {
      overallScore: number;
      strengths: string[];
      improvements: string[];
      keyTakeaway: string;
    };
  };
}

type PracticeContext = string; // taxonomy category ID or custom context

export default function TechniqueDetailClient({ techniqueId }: { techniqueId: string }) {
  const [technique, setTechnique] = useState<TechniqueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<string>('learn');
  const [synthesized, setSynthesized] = useState<SynthesizedProfile | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);

  // Roleplay practice state
  const [practiceContext, setPracticeContext] = useState<PracticeContext | null>(null);
  const [roleplayMessages, setRoleplayMessages] = useState<RoleplayMessage[]>([]);
  const [roleplayInput, setRoleplayInput] = useState('');
  const [roleplayLoading, setRoleplayLoading] = useState(false);
  const [roleplayError, setRoleplayError] = useState<string | null>(null);
  const [roleplayEnded, setRoleplayEnded] = useState(false);
  const [expandedCoaching, setExpandedCoaching] = useState<Record<number, boolean>>({});
  const roleplayEndRef = useRef<HTMLDivElement>(null);

  // Examples tab state
  const [showBreakdown, setShowBreakdown] = useState<Record<number, boolean>>({});

  const router = useRouter();
  const { user } = useAuth();
  const { categories: taxonomyCategories } = useTaxonomy();
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  // Fetch technique data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/techniques?id=${techniqueId}`)
      .then(res => {
        if (!res.ok) throw new Error('Technique not found');
        return res.json();
      })
      .then(data => {
        setTechnique(data.technique);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [techniqueId]);

  // Find related training scenarios (fetched dynamically)
  const [relevantScenarios, setRelevantScenarios] = useState<{ id: string; title: string; category: string; difficulty: number; description: string; techniques: string[] }[]>([]);

  useEffect(() => {
    if (!technique) return;
    fetch('/api/scenarios/list')
      .then(res => res.json())
      .then(data => {
        const all = data.scenarios || [];
        setRelevantScenarios(all.filter((s: any) => s.techniques?.includes(technique.name)));
      })
      .catch(err => console.error('Failed to fetch scenarios:', err));
  }, [technique]);

  // Fetch synthesized profile (auto on mount, uses cache)
  const fetchSynthesized = useCallback(async (force = false) => {
    if (!technique) return;
    setSynthesizing(true);
    try {
      const res = await fetch('/api/techniques/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techniqueId: technique.id, force }),
      });
      if (res.ok) {
        const data = await res.json();
        setSynthesized(data.profile);
      }
    } catch (err) {
      console.error('Synthesize failed:', err);
    } finally {
      setSynthesizing(false);
    }
  }, [technique]);

  // Auto-generate summary on first visit
  useEffect(() => {
    if (technique && !synthesized && !synthesizing) {
      fetchSynthesized();
    }
  }, [technique]); // eslint-disable-line react-hooks/exhaustive-deps

  const [chunksExpanded, setChunksExpanded] = useState(false);

  // Parse coaching data from AI response
  const parseCoaching = (text: string): { cleanText: string; coaching?: RoleplayMessage['coaching'] } => {
    const coachingMatch = text.match(/<!--COACHING:([\s\S]*?)-->/);
    if (!coachingMatch) return { cleanText: text };
    try {
      const coaching = JSON.parse(coachingMatch[1]);
      const cleanText = text.replace(/<!--COACHING:[\s\S]*?-->/, '').trim();
      return { cleanText, coaching };
    } catch {
      return { cleanText: text.replace(/<!--COACHING:[\s\S]*?-->/, '').trim() };
    }
  };

  // Send roleplay message (handles both initial scenario generation and subsequent messages)
  const sendRoleplayMessage = async (userMessage?: string) => {
    if (!technique || !practiceContext) return;
    setRoleplayLoading(true);
    setRoleplayError(null);

    // Build messages array for the API
    const apiMessages = userMessage
      ? [...roleplayMessages.map(m => ({ role: m.role, content: m.content })), { role: 'user' as const, content: userMessage }]
      : [];

    // Add user message to local state immediately
    if (userMessage) {
      setRoleplayMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      const res = await fetch('/api/technique-practice/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: technique.id,
          techniqueName: technique.name,
          context: practiceContext,
          messages: apiMessages,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        setRoleplayError('Failed to get AI response. Please try again.');
        setRoleplayLoading(false);
        return;
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) { setRoleplayLoading(false); return; }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) fullContent += content;
          } catch {}
        }
      }

      const { cleanText, coaching } = parseCoaching(fullContent);
      const assistantMsg: RoleplayMessage = { role: 'assistant', content: cleanText, coaching };
      setRoleplayMessages(prev => [...prev, assistantMsg]);

      // Check if practice should end
      if (coaching?.summary || (coaching?.turnNumber && coaching.turnNumber >= coaching.maxTurns)) {
        setRoleplayEnded(true);
      }

      setTimeout(() => roleplayEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setRoleplayError('Request timed out. Please try again.');
      } else {
        setRoleplayError('Failed to connect. Please try again.');
      }
    }
    setRoleplayLoading(false);
  };

  const startPractice = () => {
    setMode('practice');
    setPracticeContext(null);
    setRoleplayMessages([]);
    setRoleplayInput('');
    setRoleplayEnded(false);
    setRoleplayError(null);
    setExpandedCoaching({});
  };

  const selectPracticeContext = async (ctx: PracticeContext) => {
    setPracticeContext(ctx);
    // Trigger initial scenario generation
    setRoleplayLoading(true);
    setRoleplayError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);
      const res = await fetch('/api/technique-practice/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: technique!.id,
          techniqueName: technique!.name,
          context: ctx,
          messages: [],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        setRoleplayError('Failed to generate scenario. Please try again.');
        setRoleplayLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setRoleplayLoading(false); return; }
      const decoder = new TextDecoder();
      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) fullContent += content;
          } catch {}
        }
      }

      const { cleanText, coaching } = parseCoaching(fullContent);
      setRoleplayMessages([{ role: 'assistant', content: cleanText, coaching }]);
    } catch (err: any) {
      setRoleplayError(err.name === 'AbortError' ? 'Request timed out.' : 'Failed to connect.');
    }
    setRoleplayLoading(false);
  };

  const handleRoleplaySend = () => {
    if (!roleplayInput.trim() || roleplayLoading || roleplayEnded) return;
    const msg = roleplayInput.trim();
    setRoleplayInput('');
    sendRoleplayMessage(msg);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-[#333] rounded" />
          <div className="h-8 w-64 bg-gray-200 dark:bg-[#333] rounded" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-[#333] rounded" />
          <div className="h-40 bg-gray-200 dark:bg-[#333] rounded-lg" />
          <div className="h-40 bg-gray-200 dark:bg-[#333] rounded-lg" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !technique) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{error || 'Technique not found'}</p>
        <button
          onClick={() => router.push('/app/techniques')}
          className="mt-4 px-6 py-2 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider"
        >
          Back to Techniques
        </button>
      </div>
    );
  }

  // ── Practice mode (Role-play) ──
  if (mode === 'practice') {
    // Context selection screen
    if (!practiceContext) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => setMode('learn')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to {technique.name}
          </button>

          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Practice {technique.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">Choose a context for your role-play simulation</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {taxonomyCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => selectPracticeContext(cat.id)}
                  className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] hover:border-[#D4A017] transition-all group text-left"
                >
                  <Icon className="h-6 w-6 text-[#D4A017] mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Loading initial scenario
    if (roleplayLoading && roleplayMessages.length === 0) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017] mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Setting up your role-play scenario...</p>
          <p className="mt-1 text-xs text-gray-400">This can take up to 30 seconds</p>
        </div>
      );
    }

    if (roleplayError && roleplayMessages.length === 0) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-400 text-sm mb-4">{roleplayError}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => selectPracticeContext(practiceContext)} className="px-6 py-2 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B830] transition-colors">
              Try Again
            </button>
            <button onClick={() => setPracticeContext(null)} className="px-6 py-2 bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded-lg">
              Pick Different Context
            </button>
          </div>
        </div>
      );
    }

    // Get the final summary if practice ended
    const finalSummary = roleplayMessages.find(m => m.coaching?.summary)?.coaching?.summary;

    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('learn')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to {technique.name}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#D4A017] uppercase bg-[#D4A017]/10 px-2 py-1 rounded">
              {taxonomyCategories.find(c => c.id === practiceContext)?.name || practiceContext}
            </span>
            {!roleplayEnded && (
              <button
                onClick={() => setRoleplayEnded(true)}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                End Practice
              </button>
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] p-4 space-y-4 min-h-[300px] max-h-[60vh] overflow-y-auto">
          {roleplayMessages.map((msg, i) => (
            <div key={i}>
              {/* Message bubble */}
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-[#D4A017]/20 text-gray-900 dark:text-white border border-[#D4A017]/30 rounded-br-none'
                    : 'bg-gray-100 dark:bg-[#222222] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#333333] rounded-bl-none'
                }`}>
                  <span dangerouslySetInnerHTML={{ __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br/>')
                  }} />
                </div>
              </div>

              {/* Coaching feedback (shown after assistant messages that follow a user message) */}
              {msg.role === 'assistant' && msg.coaching && msg.coaching.score > 0 && (
                <div className="mt-2 ml-0">
                  <button
                    onClick={() => setExpandedCoaching(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="inline-flex items-center gap-2 text-xs text-[#D4A017] hover:text-[#E8B830] transition-colors"
                  >
                    <Lightbulb className="h-3 w-3" />
                    Coaching Feedback (Score: {msg.coaching.score}/10)
                    {expandedCoaching[i] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {expandedCoaching[i] && (
                    <div className="mt-2 p-3 bg-[#D4A017]/5 border border-[#D4A017]/20 rounded-lg text-sm space-y-2">
                      <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: msg.coaching.feedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                      {msg.coaching.idealResponse && (
                        <div>
                          <p className="text-xs font-mono text-[#D4A017] uppercase mb-1">Ideal Response</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs italic">{msg.coaching.idealResponse.replace(/^["']+|["']+$/g, '')}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-mono text-[#D4A017]">TECHNIQUE:</span> {msg.coaching.techniqueApplication}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {roleplayLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-[#222222] p-3 rounded-lg border border-gray-200 dark:border-[#333333] rounded-bl-none">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {roleplayError && roleplayMessages.length > 0 && (
            <p className="text-red-400 text-xs text-center">{roleplayError}</p>
          )}

          <div ref={roleplayEndRef} />
        </div>

        {/* Summary card */}
        {roleplayEnded && finalSummary && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#D4A017]/30 p-6 space-y-4">
            <h3 className="font-mono text-lg text-[#D4A017] uppercase flex items-center gap-2">
              <Target className="h-5 w-5" />
              Practice Summary
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#D4A017] flex items-center justify-center">
                <span className="text-2xl font-bold text-[#D4A017]">{finalSummary.overallScore}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score</p>
                <p className="text-gray-900 dark:text-white font-medium">{finalSummary.keyTakeaway}</p>
              </div>
            </div>
            {finalSummary.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-mono text-green-400 uppercase mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {finalSummary.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {finalSummary.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-mono text-yellow-400 uppercase mb-2">Areas for Improvement</h4>
                <ul className="space-y-1">
                  {finalSummary.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Input area or end buttons */}
        {roleplayEnded ? (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startPractice()}
              className="px-6 py-2.5 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B830] transition-colors"
            >
              Try Another Context
            </button>
            <button
              onClick={() => setMode('learn')}
              className="px-6 py-2.5 bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded-lg"
            >
              Back to Learning
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={roleplayInput}
              onChange={e => setRoleplayInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRoleplaySend(); } }}
              placeholder="Type your response..."
              disabled={roleplayLoading}
              className="flex-1 px-4 py-3 bg-white dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#D4A017] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleRoleplaySend}
              disabled={roleplayLoading || !roleplayInput.trim()}
              className="p-3 bg-[#D4A017] text-[#0A0A0A] rounded-lg hover:bg-[#E8B830] transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Learn / Examples modes ──
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <button onClick={() => router.push('/app/techniques')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Techniques
        </button>

        <div className="flex items-center gap-3 mb-2">
          <p className="font-mono text-sm text-[#D4A017] uppercase">{formatLabel(technique.category)}</p>
          <span className="text-gray-500">-</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Difficulty: {formatLabel(String(technique.difficulty))}
          </p>
          {technique.riskLevel && technique.riskLevel !== 'unknown' && (
            <>
              <span className="text-gray-500">-</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Risk: {formatLabel(technique.riskLevel)}</p>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-wider">{technique.name}</h1>

        {/* Book source badges */}
        {technique.books.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {technique.books.map((book, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-xs font-mono">
                <Book className="h-3 w-3" />
                {book.title} {book.author ? `by ${book.author}` : ''}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Mode Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setMode('learn')}
          className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-medium transition-colors ${
            mode === 'learn'
              ? 'bg-[#D4A017] text-[#0A0A0A] font-bold'
              : 'bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] text-gray-700 dark:text-gray-300 hover:border-[#D4A017]'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Learn
        </button>
        <button
          onClick={() => startPractice()}
          className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-medium transition-colors ${
            mode === 'practice'
              ? 'bg-[#D4A017] text-[#0A0A0A] font-bold'
              : 'bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] text-gray-700 dark:text-gray-300 hover:border-[#D4A017]'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Practice
        </button>
        <button
          onClick={() => setMode('examples')}
          className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-medium transition-colors ${
            mode === 'examples'
              ? 'bg-[#D4A017] text-[#0A0A0A] font-bold'
              : 'bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#444] text-gray-700 dark:text-gray-300 hover:border-[#D4A017]'
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Examples
        </button>
      </div>

      {mode === 'learn' && (
        <>
          {/* AI Summary Section */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
            {synthesizing && !synthesized ? (
              /* Loading skeleton */
              <div className="animate-pulse space-y-5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-[#D4A017]/30 rounded" />
                  <div className="h-5 w-48 bg-gray-200 dark:bg-[#333] rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-[#333] rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-[#333] rounded" />
                  <div className="h-4 w-4/6 bg-gray-200 dark:bg-[#333] rounded" />
                </div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-[#333] rounded" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-[#D4A017]/20 rounded-full flex-shrink-0" />
                      <div className="h-4 w-full bg-gray-200 dark:bg-[#333] rounded" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-28 bg-gray-100 dark:bg-[#0A0A0A] rounded-lg" />
                  <div className="h-28 bg-gray-100 dark:bg-[#0A0A0A] rounded-lg" />
                </div>
              </div>
            ) : synthesized ? (
              <div className="space-y-6">
                <h2 className="font-mono text-lg text-[#D4A017] uppercase flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Description
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300">{synthesized.description}</p>

                {/* How To */}
                <div>
                  <h3 className="font-mono text-md text-[#D4A017] uppercase mb-3">How to Use It</h3>
                  <ul className="space-y-3">
                    {synthesized.howTo.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="bg-[#D4A017] text-[#0A0A0A] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When to Use / When NOT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-[#0A0A0A] rounded-lg border border-gray-200 dark:border-[#252525]">
                    <h3 className="font-mono text-md text-green-400 uppercase mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      When to Use It
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{synthesized.whenToUse}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-[#0A0A0A] rounded-lg border border-gray-200 dark:border-[#252525]">
                    <h3 className="font-mono text-md text-red-400 uppercase mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      When NOT to Use It
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{synthesized.whenNotToUse}</p>
                  </div>
                </div>

                {/* Regenerate link — admin only */}
                {isAdmin && (
                  <div className="text-right">
                    <button
                      onClick={() => fetchSynthesized(true)}
                      disabled={synthesizing}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D4A017] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${synthesizing ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">Failed to load summary. <button onClick={() => fetchSynthesized()} className="text-[#D4A017] hover:underline">Try again</button></p>
            )}
          </div>

          {/* Use cases */}
          {technique.useCases.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">Use Cases</h2>
              <div className="flex flex-wrap gap-2">
                {technique.useCases.map((uc, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-[#222222] rounded-lg border border-gray-200 dark:border-[#333333] text-sm text-gray-600 dark:text-gray-300">
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Knowledge Base Chunks */}
          {(technique.chunks.overview.length > 0 || technique.chunks.application.length > 0 || technique.chunks.framework.length > 0) && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <button
                onClick={() => setChunksExpanded(!chunksExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="font-mono text-lg text-[#D4A017] uppercase flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  From the Knowledge Base
                </h2>
                {chunksExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Raw excerpts from source books</p>

              {chunksExpanded && (
                <div className="mt-4 space-y-6">
                  {technique.chunks.overview.length > 0 && (
                    <div>
                      <h3 className="font-mono text-sm text-gray-500 dark:text-gray-400 uppercase mb-3">Overview</h3>
                      <div className="space-y-4">
                        {technique.chunks.overview.map((chunk) => (
                          <div key={chunk.id}>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm">{chunk.content}</p>
                            <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {technique.chunks.application.length > 0 && (
                    <div>
                      <h3 className="font-mono text-sm text-gray-500 dark:text-gray-400 uppercase mb-3">Application</h3>
                      <div className="space-y-4">
                        {technique.chunks.application.map((chunk) => (
                          <div key={chunk.id}>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm">{chunk.content}</p>
                            <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {technique.chunks.framework.length > 0 && (
                    <div>
                      <h3 className="font-mono text-sm text-gray-500 dark:text-gray-400 uppercase mb-3">Framework</h3>
                      <div className="space-y-4">
                        {technique.chunks.framework.map((chunk) => (
                          <div key={chunk.id}>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm">{chunk.content}</p>
                            <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Practice This Technique in Training Arena */}
          {relevantScenarios.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4 flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Practice This Technique
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                These training scenarios use {technique.name} as a key technique:
              </p>
              <div className="space-y-2">
                {relevantScenarios.map((s) => (
                  <NextLink
                    key={s.id}
                    href={`/app/training/${s.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#222222] rounded-lg border border-gray-200 dark:border-[#333333] hover:border-[#D4A017] transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#D4A017] transition-colors">
                        {s.title}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{formatLabel(s.category)}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {'*'.repeat(s.difficulty)}
                    </span>
                  </NextLink>
                ))}
              </div>
            </div>
          )}

          {/* Related Techniques */}
          {technique.relatedTechniques.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4 flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Related Techniques
              </h2>
              <div className="flex flex-wrap gap-2">
                {technique.relatedTechniques.map((name) => {
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return (
                    <NextLink key={name} href={`/app/techniques/${slug}`} className="px-3 py-2 bg-gray-50 dark:bg-[#222222] rounded-lg border border-gray-200 dark:border-[#333333] hover:border-[#D4A017] transition-colors text-sm text-gray-900 dark:text-white hover:text-[#D4A017]">
                      {name}
                    </NextLink>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'examples' && (
        <div className="space-y-6">
          <h2 className="font-mono text-lg text-[#D4A017] uppercase flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Scripts
          </h2>

          {/* AI-generated conversation scripts */}
          {synthesized?.conversationExamples && synthesized.conversationExamples.length > 0 ? (
            <>
              {synthesized.conversationExamples.map((example, exIdx) => {
                const contextIcon = example.context?.toLowerCase().includes('work') ? '\uD83D\uDCBC'
                  : example.context?.toLowerCase().includes('personal') || example.context?.toLowerCase().includes('dating') || example.context?.toLowerCase().includes('relationship') ? '\u2764\uFE0F'
                  : '\uD83D\uDCB0';
                const isBreakdownVisible = showBreakdown[exIdx] ?? false;

                return (
                  <div key={exIdx} className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] overflow-hidden">
                    {/* Card header */}
                    <div className="p-4 border-b border-gray-200 dark:border-[#333333] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{contextIcon}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-xs font-mono uppercase">{example.context}</span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{example.title}</h3>
                      </div>
                      <button
                        onClick={() => setShowBreakdown(prev => ({ ...prev, [exIdx]: !prev[exIdx] }))}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D4A017] transition-colors"
                      >
                        {isBreakdownVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {isBreakdownVisible ? 'Hide' : 'Show'} Breakdown
                      </button>
                    </div>

                    {/* Script as chat bubbles */}
                    <div className="p-4 space-y-3">
                      {example.script.map((line, lineIdx) => {
                        const isYou = line.speaker === 'You';
                        return (
                          <div key={lineIdx}>
                            <div className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] space-y-1`}>
                                <p className={`text-[10px] font-mono uppercase ${isYou ? 'text-right text-[#D4A017]' : 'text-left text-gray-400'}`}>
                                  {line.speaker}
                                </p>
                                <div className={`p-3 rounded-lg text-sm ${
                                  isYou
                                    ? 'bg-[#D4A017]/15 text-gray-900 dark:text-white border border-[#D4A017]/25 rounded-br-none'
                                    : 'bg-gray-100 dark:bg-[#222222] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#333333] rounded-bl-none'
                                }`}>
                                  {line.line}
                                </div>
                                {/* Annotation badge */}
                                {isBreakdownVisible && line.annotation && (
                                  <div className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                                    <span className="inline-block px-2 py-1 bg-[#D4A017]/10 border border-[#D4A017]/20 rounded text-[11px] text-[#D4A017] font-mono">
                                      {line.annotation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Result + Why It Worked */}
                    <div className="border-t border-gray-200 dark:border-[#333333]">
                      {example.result && (
                        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/10 border-b border-gray-200 dark:border-[#333333]">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-mono text-green-600 dark:text-green-400 uppercase mb-0.5">Result</p>
                              <p className="text-sm text-green-800 dark:text-green-300">{example.result}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {example.whyItWorked && (
                        <div className="px-4 py-3">
                          <p className="text-xs font-mono text-[#D4A017] uppercase mb-1">Why It Worked</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{example.whyItWorked}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Regenerate — admin only */}
              {isAdmin && (
                <div className="text-right">
                  <button
                    onClick={() => fetchSynthesized(true)}
                    disabled={synthesizing}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D4A017] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${synthesizing ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              )}
            </>
          ) : synthesizing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017] mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Generating conversation scripts...</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <p className="text-gray-500 dark:text-gray-400 mb-3">No conversation scripts available yet.</p>
              <button
                onClick={() => fetchSynthesized(true)}
                disabled={synthesizing}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-[#E8B030] transition-all disabled:opacity-50"
              >
                {synthesizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Conversation Scripts
                  </>
                )}
              </button>
            </div>
          )}

          {/* Exercise chunks */}
          {technique.chunks.exercise.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">Exercises</h2>
              <div className="space-y-4">
                {technique.chunks.exercise.map((chunk) => (
                  <div key={chunk.id}>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{chunk.content}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
