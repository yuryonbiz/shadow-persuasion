'use client';

import { scenarios } from '@/lib/scenarios';
import { techniques } from '@/lib/techniques';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Send, ChevronDown, ChevronUp, Award, Target, AlertTriangle, Lightbulb, TrendingUp, StopCircle } from 'lucide-react';

type CoachingData = {
  feedback: string;
  score: number;
  technique: string;
  tip: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  coaching?: CoachingData;
};

type DebriefData = {
  score: number;
  techniquesUsed: { name: string; example: string; effectiveness: number }[];
  missedOpportunities: { moment: string; technique: string; suggestedResponse: string }[];
  turningPoints: { moment: string; impact: string; explanation: string }[];
  suggestions: string[];
};

function parseCoaching(raw: string): { content: string; coaching?: CoachingData } {
  const match = raw.match(/<!--COACHING:(.*?)-->/s);
  if (!match) return { content: raw };
  try {
    const coaching = JSON.parse(match[1]);
    const content = raw.replace(/\s*<!--COACHING:.*?-->/s, '').trim();
    return { content, coaching };
  } catch {
    return { content: raw.replace(/\s*<!--COACHING:.*?-->/s, '').trim() };
  }
}

function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold text-[#E8E8E0] mt-4 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-[#E8E8E0] mt-4 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-[#D4A017] mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#E8E8E0] font-semibold">$1</strong>')
    .replace(/\[TECHNIQUE: (.*?)\]/g, '<span class="inline-block bg-[#D4A017] text-[#0A0A0A] px-2 py-0.5 rounded text-xs font-mono font-bold mt-1 mb-1">$1</span>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017] font-mono text-sm">$1.</span><span class="text-[#ccc]">$2</span></div>')
    .replace(/^[-] (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017]">&rarr;</span><span class="text-[#ccc]">$1</span></div>')
    .replace(/\n\n/g, '<div class="h-3"></div>')
    .replace(/\n/g, '<br/>');
}

function CoachingAnnotation({ coaching }: { coaching: CoachingData }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = coaching.score >= 7 ? 'text-green-400' : coaching.score >= 4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="mt-2 border border-[#333] rounded-lg overflow-hidden bg-[#111]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3 w-3 text-[#D4A017]" />
          <span className="text-[#D4A017] font-mono uppercase">Coaching</span>
          <span className={`font-mono font-bold ${scoreColor}`}>{coaching.score}/10</span>
          {coaching.technique && (
            <span className="text-gray-500">| {coaching.technique}</span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-3 w-3 text-gray-500" /> : <ChevronDown className="h-3 w-3 text-gray-500" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 text-xs border-t border-[#222]">
          <div className="pt-2">
            <span className="text-gray-400">Feedback:</span>
            <p className="text-[#ccc] mt-0.5">{coaching.feedback}</p>
          </div>
          {coaching.tip && (
            <div>
              <span className="text-[#D4A017]">Tip:</span>
              <p className="text-[#ccc] mt-0.5">{coaching.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#333" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-500 uppercase">Score</span>
      </div>
    </div>
  );
}

function DebriefCard({ debrief, onClose }: { debrief: DebriefData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#0f0f0f] border border-[#333] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-6">
            <ScoreRing score={debrief.score} />
            <div>
              <h2 className="text-xl font-bold text-[#E8E8E0] tracking-wider">Mission Debrief</h2>
              <p className="text-sm text-gray-400 mt-1">
                {debrief.score >= 70 ? 'Strong performance. You deployed techniques effectively.' :
                 debrief.score >= 40 ? 'Decent showing. Room for improvement on technique application.' :
                 'Needs work. Review the missed opportunities below.'}
              </p>
            </div>
          </div>

          {/* Techniques Used */}
          {debrief.techniquesUsed.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-mono text-green-400 uppercase mb-3">
                <Target className="h-4 w-4" /> Techniques Deployed
              </h3>
              <div className="space-y-2">
                {debrief.techniquesUsed.map((t, i) => (
                  <div key={i} className="p-3 bg-[#1a1a1a] rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#E8E8E0]">{t.name}</span>
                      <span className="text-xs font-mono text-green-400">{t.effectiveness}/10</span>
                    </div>
                    <p className="text-xs text-gray-400 italic">&quot;{t.example}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed Opportunities */}
          {debrief.missedOpportunities.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-mono text-yellow-400 uppercase mb-3">
                <AlertTriangle className="h-4 w-4" /> Missed Opportunities
              </h3>
              <div className="space-y-2">
                {debrief.missedOpportunities.map((m, i) => (
                  <div key={i} className="p-3 bg-[#1a1a1a] rounded-lg border border-yellow-500/20">
                    <p className="text-sm text-[#ccc] mb-1">{m.moment}</p>
                    <p className="text-xs text-yellow-400">Should have used: <strong>{m.technique}</strong></p>
                    <p className="text-xs text-gray-400 mt-1 italic">&quot;{m.suggestedResponse}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Turning Points */}
          {debrief.turningPoints.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-mono text-[#D4A017] uppercase mb-3">
                <TrendingUp className="h-4 w-4" /> Key Turning Points
              </h3>
              <div className="space-y-2">
                {debrief.turningPoints.map((tp, i) => (
                  <div key={i} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#D4A017]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono uppercase ${tp.impact === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                        {tp.impact}
                      </span>
                    </div>
                    <p className="text-sm text-[#ccc]">{tp.moment}</p>
                    <p className="text-xs text-gray-400 mt-1">{tp.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {debrief.suggestions.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-mono text-blue-400 uppercase mb-3">
                <Award className="h-4 w-4" /> Improvement Plan
              </h3>
              <ul className="space-y-1.5">
                {debrief.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#ccc]">
                    <span className="text-blue-400 mt-0.5">&rarr;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] transition-colors"
          >
            Close Debrief
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScenarioDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const scenario = scenarios.find(s => s.id === id);

  const [mode, setMode] = useState<'briefing' | 'practice'>('briefing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debrief, setDebrief] = useState<DebriefData | null>(null);
  const [isDebriefing, setIsDebriefing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-red-400">Scenario not found</h1>
        <Link href="/app/scenarios" className="text-[#D4A017] hover:underline mt-4 inline-block">Back to scenarios</Link>
      </div>
    );
  }

  const relevantTechniques = techniques.filter(t => scenario.techniques.includes(t.name));

  const startPractice = async () => {
    setMode('practice');
    setIsLoading(true);

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], scenarioId: scenario.id }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to start scenario');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });

        const { content } = parseCoaching(fullContent);
        setMessages([{ id: 'opening', role: 'assistant', content }]);
      }

      const { content, coaching } = parseCoaching(fullContent);
      setMessages([{ id: 'opening', role: 'assistant', content, coaching }]);
    } catch (error) {
      console.error('Error starting scenario:', error);
      setMessages([{ id: 'error', role: 'assistant', content: 'Failed to start the scenario. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, scenarioId: scenario.id }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to get response');

      const placeholder: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: '' };
      setMessages(prev => [...prev, placeholder]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });

        const { content } = parseCoaching(fullContent);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content };
          return updated;
        });
      }

      const { content, coaching } = parseCoaching(fullContent);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content, coaching };
        return updated;
      });
    } catch (error) {
      console.error('Scenario chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`, role: 'assistant',
        content: 'An error occurred. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const requestDebrief = async () => {
    setIsDebriefing(true);
    try {
      const apiMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/scenarios/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, scenarioId: scenario.id }),
      });

      if (!response.ok) throw new Error('Failed to get debrief');

      const data = await response.json();
      setDebrief(data);
    } catch (error) {
      console.error('Debrief error:', error);
      alert('Failed to generate debrief. Please try again.');
    } finally {
      setIsDebriefing(false);
    }
  };

  // Briefing mode
  if (mode === 'briefing') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <p className="font-mono text-sm text-[#D4A017] uppercase">{scenario.category}</p>
          <h1 className="text-3xl font-bold tracking-wider mt-1">{scenario.title}</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
            <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-2">Briefing</h2>
            <p className="text-gray-300">{scenario.description}</p>
            <h2 className="font-mono text-lg text-[#D4A017] uppercase mt-4 mb-2">Objective</h2>
            <p className="text-gray-300">{scenario.objective}</p>
          </div>
          <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
            <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-2">Key Techniques</h2>
            <ul className="space-y-2">
              {relevantTechniques.map(t => (
                <li key={t.id}>
                  <Link href={`/app/library/${t.id}`} className="text-sm hover:underline">{t.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={startPractice}
            className="inline-block px-8 py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] transition-transform hover:scale-105"
          >
            Begin Operation
          </button>
        </div>
      </div>
    );
  }

  // Practice mode
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div>
          <span className="font-mono text-xs text-[#D4A017] uppercase">{scenario.category}</span>
          <h1 className="text-lg font-bold tracking-wider">{scenario.title}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setMode('briefing'); setMessages([]); setDebrief(null); }}
            className="px-4 py-2 text-xs font-mono uppercase border border-[#333] rounded-lg hover:border-[#D4A017] transition-colors"
          >
            Restart
          </button>
          {messages.filter(m => m.role === 'user').length >= 1 && (
            <button
              onClick={requestDebrief}
              disabled={isDebriefing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              <StopCircle className="h-3.5 w-3.5" />
              {isDebriefing ? 'Analyzing...' : 'End & Debrief'}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-lg ${
                msg.role === 'user'
                  ? 'p-4 bg-[#D4A017] text-[#0A0A0A]'
                  : 'bg-[#1A1A1A] border border-[#333333]'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-mono uppercase text-[#D4A017] tracking-wider">Counterpart</span>
                  </div>
                )}
                <div className="px-4 pb-3">
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: msg.role === 'user' ? '#0A0A0A' : '#ccc' }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  />
                </div>
              </div>
            </div>
            {/* Coaching annotation below assistant messages */}
            {msg.role === 'assistant' && msg.coaching && (
              <div className="max-w-2xl mt-1">
                <CoachingAnnotation coaching={msg.coaching} />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#333333]">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center space-x-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Your response..."
            rows={1}
            className="flex-1 p-2 bg-[#222222] text-[#E8E8E0] placeholder-gray-500 rounded-lg border border-[#333333] focus:ring-2 focus:ring-[#D4A017] focus:outline-none resize-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 bg-[#D4A017] text-[#0A0A0A] rounded-full disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Debrief modal */}
      {debrief && (
        <DebriefCard debrief={debrief} onClose={() => setDebrief(null)} />
      )}
    </div>
  );
}
