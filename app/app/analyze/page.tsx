'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, TrendingUp, AlertTriangle, Target, Zap, HelpCircle, Shield, UserPlus, X, Check, Clock, Trash2, ChevronDown, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/format-date';

// ─── History Types ──────────────────────────────────────────────────────────

interface HistoryItem {
  id: string;
  input_text: string;
  input_type: string;
  threat_score: number;
  power_yours: number;
  power_theirs: number;
  tactics_count: number;
  person_id: string | null;
  created_at: string;
  full_result: AnalysisResult;
}


// ─── Types ───────────────────────────────────────────────────────────────────

interface Tactic {
  quote: string;
  tactic: string;
  category: string;
  explanation: string;
  counterResponse: string;
}

interface AnalysisResult {
  powerDynamics: {
    yourPower: number;
    theirPower: number;
    dynamicsDescription: string;
  };
  communicationStyle: {
    sensoryPreference: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Mixed';
    emotionalState: string;
    receptivity: number;
  };
  threatScore: number;
  tactics: Tactic[];
  counterScript: string;
  responseOptions: {
    type: string;
    message: string;
    description: string;
    powerImpact: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    psychologyPrinciple: string;
  }[];
  overallAssessment: string;
  successProbability: number;
  techniques_identified: string[];
  extractedText?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Urgency: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
  'Social Proof': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  Authority: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  Guilt: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
  Misdirection: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-800',
  Scarcity: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800',
  Fear: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
  Flattery: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  Reciprocity: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
  Anchoring: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
};

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\(Source: "(.*?)" by (.*?)\)/g, '<span class="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full mx-0.5">📖 $1</span>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function getCategoryStyle(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-700';
}

function getThreatColor(score: number): string {
  if (score <= 3) return 'bg-green-500';
  if (score <= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getThreatLabel(score: number): string {
  if (score <= 3) return 'Low Threat';
  if (score <= 6) return 'Moderate Threat';
  return 'High Threat';
}

function getThreatTextColor(score: number): string {
  if (score <= 3) return 'text-green-400';
  if (score <= 6) return 'text-yellow-400';
  return 'text-red-400';
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'LOW': return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-400/20 border-green-300 dark:border-green-400/50';
    case 'MEDIUM': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-400/20 border-yellow-300 dark:border-yellow-400/50';
    case 'HIGH': return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-400/20 border-red-300 dark:border-red-400/50';
    default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/20';
  }
}

function highlightText(original: string, tactics: Tactic[]): React.ReactNode[] {
  if (!tactics.length) return [original];

  const sortedTactics = [...tactics]
    .filter((t) => original.includes(t.quote))
    .sort((a, b) => original.indexOf(a.quote) - original.indexOf(b.quote));

  if (!sortedTactics.length) return [original];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const tactic of sortedTactics) {
    const idx = original.indexOf(tactic.quote, lastIndex);
    if (idx === -1) continue;

    if (idx > lastIndex) {
      parts.push(original.slice(lastIndex, idx));
    }

    parts.push(
      <span
        key={idx}
        className={`border-b-2 border-dashed ${
          tactic.category === 'Urgency' || tactic.category === 'Fear'
            ? 'border-red-400'
            : tactic.category === 'Guilt'
            ? 'border-orange-400'
            : tactic.category === 'Authority'
            ? 'border-purple-400'
            : 'border-yellow-400'
        }`}
        title={`${tactic.tactic} (${tactic.category})`}
      >
        {tactic.quote}
      </span>
    );

    lastIndex = idx + tactic.quote.length;
  }

  if (lastIndex < original.length) {
    parts.push(original.slice(lastIndex));
  }

  return parts;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

interface PersonProfile {
  id: string;
  name: string;
  relationshipType?: string;
}

export default function AnalyzePage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Save to Person Profile state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [peopleProfiles, setPeopleProfiles] = useState<PersonProfile[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [newPersonName, setNewPersonName] = useState('');
  const [savingToProfile, setSavingToProfile] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Analysis history state
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Context form state
  const [contextExpanded, setContextExpanded] = useState(false);
  const [ctxRole, setCtxRole] = useState<'sender' | 'receiver' | 'observer' | ''>('');
  const [ctxGoal, setCtxGoal] = useState('');
  const [ctxGoalCustom, setCtxGoalCustom] = useState('');
  const [ctxPersonId, setCtxPersonId] = useState('');
  const [ctxPersonDesc, setCtxPersonDesc] = useState('');
  const [ctxBackground, setCtxBackground] = useState('');
  const [ctxPeopleProfiles, setCtxPeopleProfiles] = useState<PersonProfile[]>([]);

  // Follow-up chat state
  const [followUpExpanded, setFollowUpExpanded] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const followUpEndRef = useRef<HTMLDivElement>(null);

  const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  // Fetch people profiles for context form
  useEffect(() => {
    if (!contextExpanded || !user) return;
    const fetchCtxPeople = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch('/api/profiler/people', { headers });
        if (res.ok) {
          const data = await res.json();
          setCtxPeopleProfiles(data.profiles || []);
        }
      } catch (e) {
        console.error('Failed to load people for context:', e);
      }
    };
    fetchCtxPeople();
  }, [contextExpanded, user, getHeaders]);

  // Fetch people profiles when modal opens
  useEffect(() => {
    if (!showSaveModal) return;
    const fetchPeople = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch('/api/profiler/people', { headers });
        if (res.ok) {
          const data = await res.json();
          setPeopleProfiles(data.profiles || []);
        }
      } catch (e) {
        console.error('Failed to load people profiles:', e);
      }
    };
    fetchPeople();
  }, [showSaveModal, getHeaders]);

  // Fetch analysis history on mount and when user changes
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/analyze/history?limit=10', { headers });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, getHeaders]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/analyze/history?id=${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    if (item.full_result) {
      setResult(item.full_result);
      setText(item.input_text || '');
      setLastAnalysisId(item.id);
      setError(null);
      setSelectedResponse(null);
    }
  };

  const handleSaveToProfile = async () => {
    if (!result) return;
    setSavingToProfile(true);

    // Map analysis result into the profile traits structure the detail page expects
    const traitsPayload = {
      communication: {
        sensoryPreference: result.communicationStyle.sensoryPreference,
        emotionalPattern: result.communicationStyle.emotionalState,
        receptivity: result.communicationStyle.receptivity,
        summary: result.overallAssessment,
      },
      triggers: {
        defensive: result.tactics.map(t => t.tactic),
      },
      // Preserve raw analysis for reference
      _lastAnalysis: {
        threat_score: result.threatScore,
        power_dynamics: result.powerDynamics,
        detected_tactics: result.tactics.map(t => ({ tactic: t.tactic, quote: t.quote })),
        techniques_identified: result.techniques_identified,
        analyzed_at: new Date().toISOString(),
      },
    };

    try {
      const headers = await getHeaders();

      if (selectedPersonId) {
        // Update existing profile — merge analysis into traits
        const person = peopleProfiles.find(p => p.id === selectedPersonId);
        const res = await fetch('/api/profiler/people', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            id: selectedPersonId,
            traits: traitsPayload,
            updated_at: new Date().toISOString(),
          }),
        });
        if (res.ok) {
          setSaveToast(`Saved to ${person?.name || 'profile'}'s profile`);
          // Link analysis history to this person
          if (lastAnalysisId && selectedPersonId) {
            fetch('/api/analyze/history', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...headers },
              body: JSON.stringify({ id: lastAnalysisId, person_id: selectedPersonId }),
            }).catch(console.error);
          }
        } else {
          setSaveToast('Failed to save to profile');
        }
      } else if (newPersonName.trim()) {
        // Create new profile with analysis
        const res = await fetch('/api/profiler/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            name: newPersonName.trim(),
            relationshipType: 'Other',
            traits: traitsPayload,
          }),
        });
        if (res.ok) {
          const newPerson = await res.json();
          setSaveToast(`Saved to ${newPersonName.trim()}'s profile`);
          // Link analysis history to newly created person
          if (lastAnalysisId && newPerson?.id) {
            fetch('/api/analyze/history', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...headers },
              body: JSON.stringify({ id: lastAnalysisId, person_id: newPerson.id }),
            }).catch(console.error);
          }
        } else {
          setSaveToast('Failed to create profile');
        }
      }
    } catch (e) {
      console.error('Error saving to profile:', e);
      setSaveToast('Failed to save to profile');
    } finally {
      setSavingToProfile(false);
      setShowSaveModal(false);
      setSelectedPersonId('');
      setNewPersonName('');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const addImageFiles = (files: File[]) => {
    const imageOnly = files.filter(f => f.type.startsWith('image/'));
    if (imageOnly.length === 0) return;
    const remaining = 5 - imageFiles.length;
    const toAdd = imageOnly.slice(0, remaining);
    if (toAdd.length === 0) return;
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImageFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    addImageFiles(files);
  };

  const handleCopy = async (text: string, index?: number) => {
    await navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleAnalyze = async () => {
    if (mode === 'text' && !text.trim()) return;
    if (mode === 'image' && imageFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedResponse(null);

    try {
      let res: Response;
      const headers = await getHeaders();
      const resolvedGoal = ctxGoal === 'other' ? ctxGoalCustom : ctxGoal;

      if (mode === 'image' && imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file, i) => formData.append(`image_${i}`, file));
        if (ctxRole) formData.append('role', ctxRole);
        if (resolvedGoal) formData.append('goal', resolvedGoal);
        if (ctxPersonId) formData.append('personId', ctxPersonId);
        if (ctxPersonDesc) formData.append('personContext', ctxPersonDesc);
        if (ctxBackground) formData.append('backgroundContext', ctxBackground);
        res = await fetch('/api/analyze', { method: 'POST', headers, body: formData });
      } else {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            text: text.trim(),
            role: ctxRole || undefined,
            goal: resolvedGoal || undefined,
            personId: ctxPersonId || undefined,
            personContext: ctxPersonDesc || undefined,
            backgroundContext: ctxBackground || undefined,
          }),
        });
      }

      if (!res.ok) {
        throw new Error('Failed to analyze.');
      }

      const data = await res.json();
      const textToAnalyze = mode === 'image' && data.extractedText ? data.extractedText : text.trim();
      if (data.extractedText) setText(data.extractedText);
      setResult(data);

      // Auto-save to history (fire and forget)
      getHeaders().then((saveHeaders) => {
        fetch('/api/analyze/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...saveHeaders },
          body: JSON.stringify({
            input_text: textToAnalyze,
            input_type: mode,
            threat_score: data.threatScore,
            power_yours: data.powerDynamics?.yourPower,
            power_theirs: data.powerDynamics?.theirPower,
            tactics: data.tactics,
            response_options: data.responseOptions,
            communication_style: data.communicationStyle,
            counter_script: data.counterScript,
            overall_assessment: data.overallAssessment,
            techniques_identified: data.techniques_identified,
            full_result: data,
          }),
        })
          .then((r) => r.json())
          .then((saved) => {
            if (saved?.id) {
              setLastAnalysisId(saved.id);
              fetchHistory(); // refresh history list
            }
          })
          .catch(console.error);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setImageFiles([]);
    setImagePreviews([]);
    setError(null);
    setSelectedResponse(null);
    setLastAnalysisId(null);
    setFollowUpExpanded(false);
    setFollowUpMessages([]);
    setFollowUpInput('');
  };

  const handleFollowUp = async () => {
    if (!followUpInput.trim() || !result || followUpLoading) return;
    const userMsg = followUpInput.trim();
    setFollowUpInput('');
    setFollowUpMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setFollowUpLoading(true);

    // Build context summary from analysis
    const resolvedGoal = ctxGoal === 'other' ? ctxGoalCustom : ctxGoal;
    const contextParts: string[] = [];
    if (ctxRole) contextParts.push(`User's role: ${ctxRole}`);
    if (resolvedGoal) contextParts.push(`Goal: ${resolvedGoal}`);
    if (ctxBackground) contextParts.push(`Background: ${ctxBackground}`);

    try {
      const headers = await getHeaders();
      const res = await fetch('/api/analyze/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          originalText: text,
          analysisResult: {
            overallAssessment: result.overallAssessment,
            powerDynamics: result.powerDynamics,
            communicationStyle: result.communicationStyle,
            threatScore: result.threatScore,
            tactics: result.tactics.map(t => ({ tactic: t.tactic, quote: t.quote, category: t.category })),
            responseOptions: result.responseOptions.map(r => ({ type: r.type, message: r.message })),
            techniques_identified: result.techniques_identified,
          },
          context: contextParts.join('. '),
          messages: [...followUpMessages, { role: 'user', content: userMsg }],
        }),
      });

      if (!res.ok) throw new Error('Failed to get follow-up response');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      // Add placeholder for streaming
      setFollowUpMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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
            if (content) {
              assistantContent += content;
              setFollowUpMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setFollowUpMessages(prev => [...prev.filter(m => m.content !== ''), { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setFollowUpLoading(false);
      setTimeout(() => followUpEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Power meter sub-component
  const PowerMeter = ({ label, description, value, color }: {
    label: string;
    description?: string;
    value: number;
    color: string;
  }) => (
    <div className="flex-1">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-mono uppercase text-[#D4A017]">{label}</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-[#333333] px-3 py-1 rounded">{value}/10</span>
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
          <span className="text-[#D4A017]">&#128269;</span> Conversation Analyzer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm max-w-3xl">
          Paste any message or upload a screenshot for a comprehensive analysis: power dynamics,
          communication profiling, manipulation detection, strategic response options, and counter-scripts.
        </p>

        {/* How it works */}
        <div className="mt-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#D4A017] text-[#0A0A0A] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
              ?
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">How it works:</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paste text or upload screenshot &rarr; AI analyzes power dynamics, detects manipulation &rarr; Get strategic responses + counter-scripts &rarr; Copy & send
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Input Area */}
      {!result && !isLoading && (
        <div className="space-y-4">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-2 text-sm font-mono uppercase tracking-wider rounded-lg border transition-all ${
                mode === 'text'
                  ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017] font-bold'
                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:border-[#D4A017]'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex-1 py-2 text-sm font-mono uppercase tracking-wider rounded-lg border transition-all ${
                mode === 'image'
                  ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017] font-bold'
                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:border-[#D4A017]'
              }`}
            >
              Upload Screenshot
            </button>
          </div>

          {mode === 'text' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any message, email, sales pitch, or conversation..."
              className="w-full h-48 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors resize-none"
              autoFocus
            />
          ) : (
            <div className="space-y-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => imageFiles.length < 5 && document.getElementById('analyze-image-input')?.click()}
                className={`min-h-[8rem] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  imagePreviews.length > 0
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-gray-300 dark:border-[#444] hover:border-[#D4A017]'
                } ${imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  id="analyze-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreviews.length > 0 ? (
                  <div className="w-full p-3">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt={`Screenshot ${i + 1}`} className="h-24 rounded border border-gray-600" />
                          <button
                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {imageFiles.length < 5 && (
                      <p className="text-xs text-gray-400 text-center mt-2">Click or drop to add more</p>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="text-3xl mb-2">&#128248;</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Drop screenshots here or click to browse</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">PNG, JPG, or WEBP &mdash; up to 5 images</p>
                  </>
                )}
              </div>
              {imagePreviews.length > 0 && (
                <div className="text-center">
                  <span className="text-sm font-mono text-[#D4A017]">{imageFiles.length}/5 screenshots</span>
                </div>
              )}
            </div>
          )}

          {/* Context Form (collapsible) */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setContextExpanded(!contextExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors"
            >
              <span className="font-mono uppercase tracking-wider text-xs">Add context for better analysis</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${contextExpanded ? 'rotate-180' : ''}`} />
            </button>

            {contextExpanded && (
              <div className="px-4 pb-4 space-y-5 border-t border-gray-200 dark:border-[#333333] pt-4">
                {/* Role */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D4A017] mb-2">Who are you?</label>
                  <div className="space-y-2">
                    {([
                      { value: 'sender', label: "I'm the sender (left/blue)" },
                      { value: 'receiver', label: "I'm the receiver (right/gray)" },
                      { value: 'observer', label: "Just analyzing someone else's conversation" },
                    ] as const).map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="ctx-role"
                          value={opt.value}
                          checked={ctxRole === opt.value}
                          onChange={() => setCtxRole(opt.value)}
                          className="accent-[#D4A017]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D4A017] mb-2">What&apos;s your goal?</label>
                  <select
                    value={ctxGoal}
                    onChange={(e) => setCtxGoal(e.target.value)}
                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                  >
                    <option value="">Select a goal...</option>
                    <option value="Get them to agree to something">Get them to agree to something</option>
                    <option value="Set a boundary">Set a boundary</option>
                    <option value="Detect if I'm being manipulated">Detect if I&apos;m being manipulated</option>
                    <option value="Build rapport / strengthen relationship">Build rapport / strengthen relationship</option>
                    <option value="Close a deal / negotiate">Close a deal / negotiate</option>
                    <option value="Understand their psychology">Understand their psychology</option>
                    <option value="Craft the perfect response">Craft the perfect response</option>
                    <option value="other">Other</option>
                  </select>
                  {ctxGoal === 'other' && (
                    <input
                      type="text"
                      value={ctxGoalCustom}
                      onChange={(e) => setCtxGoalCustom(e.target.value)}
                      placeholder="Describe your goal..."
                      className="w-full mt-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
                    />
                  )}
                </div>

                {/* Person */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D4A017] mb-2">Who is this person?</label>
                  <select
                    value={ctxPersonId}
                    onChange={(e) => { setCtxPersonId(e.target.value); if (e.target.value) setCtxPersonDesc(''); }}
                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                  >
                    <option value="">Select a person...</option>
                    {ctxPeopleProfiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}{p.relationshipType ? ` (${p.relationshipType})` : ''}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={ctxPersonDesc}
                    onChange={(e) => { setCtxPersonDesc(e.target.value); if (e.target.value) setCtxPersonId(''); }}
                    placeholder="Or describe them: e.g., my boss, a client, my ex"
                    className="w-full mt-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
                  />
                </div>

                {/* Background */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D4A017] mb-2">Background context</label>
                  <textarea
                    value={ctxBackground}
                    onChange={(e) => setCtxBackground(e.target.value)}
                    placeholder="Anything else the AI should know? e.g., We've been arguing about this for weeks"
                    rows={2}
                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={mode === 'text' ? !text.trim() : imageFiles.length === 0}
            className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Analyze Conversation
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg">
          <div className="animate-pulse space-y-2">
            <p className="font-mono text-lg text-[#D4A017]">[ANALYZING...]</p>
            <p className="text-sm text-gray-500">Running comprehensive power dynamics & manipulation scan</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">

          {/* ── Top action bar ── */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] text-gray-600 dark:text-gray-300 font-mono text-xs uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
            >
              Analyze New Conversation
            </button>
          </div>

          {/* ── Threat Score Bar (always visible) ── */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#D4A017]" />
                <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  {result.threatScore > 0 ? 'Manipulation Threat Level' : 'Threat Assessment'}
                </span>
              </div>
              {result.threatScore > 0 ? (
                <span className={`font-mono text-2xl font-bold ${getThreatTextColor(result.threatScore)}`}>
                  {result.threatScore}/10
                </span>
              ) : (
                <span className="font-mono text-2xl font-bold text-green-400">
                  All Clear
                </span>
              )}
            </div>
            {result.threatScore > 0 ? (
              <>
                <div className="w-full h-3 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getThreatColor(result.threatScore)}`}
                    style={{ width: `${result.threatScore * 10}%` }}
                  />
                </div>
                <p className={`text-sm mt-2 font-mono ${getThreatTextColor(result.threatScore)}`}>
                  {getThreatLabel(result.threatScore)} &mdash; {result.tactics.length} tactic{result.tactics.length !== 1 ? 's' : ''} detected
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full h-3 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>
            )}
            {result.threatScore === 0 && (
              <p className="text-sm mt-2 text-green-400 font-mono">
                No manipulation detected &mdash; this conversation appears straightforward. See your strategic position below.
              </p>
            )}
          </div>

          {/* ── Power Dynamics ── */}
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#D4A017]" />
                <h2 className="font-mono text-lg uppercase text-[#D4A017]">Influence Position Analysis</h2>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <HelpCircle className="h-3 w-3" />
                Who has control in this conversation?
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-6">
                <PowerMeter
                  label="Your Influence Level"
                  description="How much control you currently have"
                  value={result.powerDynamics.yourPower}
                  color="bg-[#D4A017]"
                />
                <PowerMeter
                  label="Their Influence Level"
                  description="How much control they currently have"
                  value={result.powerDynamics.theirPower}
                  color="bg-blue-500"
                />
              </div>
              <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">{result.powerDynamics.dynamicsDescription}</p>
              </div>
            </div>
          </div>

          {/* ── Communication Intelligence ── */}
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#D4A017]" />
                <h2 className="font-mono text-lg uppercase text-[#D4A017]">Communication Profile</h2>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <HelpCircle className="h-3 w-3" />
                How they process information & respond to influence
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {result.communicationStyle.sensoryPreference}
                </div>
                <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">Processing Style</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {result.communicationStyle.sensoryPreference === 'Visual' ? 'Use pictures, charts, visuals' :
                   result.communicationStyle.sensoryPreference === 'Auditory' ? 'Use sound, rhythm, verbal emphasis' :
                   result.communicationStyle.sensoryPreference === 'Kinesthetic' ? 'Use feelings, touch, movement' :
                   'Mix different communication styles'}
                </div>
              </div>
              <div className="text-center bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg">
                <div className="text-xl font-bold text-blue-400 mb-1">
                  {result.communicationStyle.emotionalState}
                </div>
                <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">Current Mood</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Their emotional state right now</div>
              </div>
              <div className="text-center bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg">
                <div className="text-xl font-bold text-green-400 mb-1">
                  {result.communicationStyle.receptivity}%
                </div>
                <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">Influence Openness</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {result.communicationStyle.receptivity >= 70 ? 'Very open to suggestions' :
                   result.communicationStyle.receptivity >= 40 ? 'Moderately receptive' :
                   'Resistant to influence attempts'}
                </div>
              </div>
            </div>
          </div>

          {/* ── Analyzed Text (always show if we have text) ── */}
          {text && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold block mb-3">
                {result.tactics.length > 0 ? 'Analyzed Text — Manipulation Highlighted' : 'Analyzed Text'}
              </span>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {result.tactics.length > 0 ? highlightText(text, result.tactics) : text}
              </p>
            </div>
          )}

          {/* ── Image Previews (if image mode) ── */}
          {imagePreviews.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold block mb-3">
                Uploaded Screenshot{imagePreviews.length > 1 ? 's' : ''} ({imagePreviews.length})
              </span>
              <div className="flex flex-wrap gap-3 justify-center">
                {imagePreviews.map((preview, i) => (
                  <img key={i} src={preview} alt={`Screenshot ${i + 1}`} className="rounded-md max-h-48" />
                ))}
              </div>
            </div>
          )}

          {/* ── Tactics Section (always visible) ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {result.tactics.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              ) : (
                <Shield className="h-5 w-5 text-green-400" />
              )}
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                {result.tactics.length > 0 ? 'Manipulation Tactics Detected' : 'Influence Scan'}
              </span>
            </div>
            {result.tactics.length > 0 ? (
              result.tactics.map((tactic, i) => (
                <div key={i} className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-mono text-gray-900 dark:text-white font-bold">{tactic.tactic}</h3>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded border whitespace-nowrap ${getCategoryStyle(tactic.category)}`}
                    >
                      {tactic.category}
                    </span>
                  </div>
                  <blockquote className="border-l-2 border-[#D4A017] pl-3 text-sm text-gray-500 dark:text-gray-400 italic">
                    &ldquo;{tactic.quote}&rdquo;
                  </blockquote>
                  <div className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: renderMarkdown(tactic.explanation) }} />
                  <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#333333] rounded p-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold block mb-1">
                      Counter:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">&ldquo;{tactic.counterResponse}&rdquo;</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#1A1A1A] border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-green-400 font-mono">No manipulation tactics detected.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This conversation appears to be straightforward communication. Your strategic response options below focus on positioning and influence.</p>
              </div>
            )}
          </div>

          {/* ── Counter-Script / Recommended Approach (always visible) ── */}
          {result.counterScript && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#D4A017] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold">
                  {result.tactics.length > 0 ? 'Full Counter-Script' : 'Recommended Approach'}
                </span>
                <button
                  onClick={() => handleCopy(result.counterScript)}
                  className="text-xs text-gray-500 hover:text-[#D4A017] transition-colors flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="text-gray-900 dark:text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(result.counterScript) }} />
            </div>
          )}

          {/* ── Strategic Response Options ── */}
          {result.responseOptions && result.responseOptions.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#D4A017]" />
                  <h2 className="font-mono text-lg uppercase text-[#D4A017]">Strategic Response Options</h2>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <HelpCircle className="h-3 w-3" />
                    Click to see psychology details
                  </div>
                  <div className="font-mono text-gray-500 dark:text-gray-400">
                    Success Rate: <span className="text-green-400 font-bold">{result.successProbability}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {result.responseOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`bg-gray-50 dark:bg-[#222222] p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedResponse === index
                        ? 'border-[#D4A017] bg-amber-50 dark:bg-[#2A2520]'
                        : 'border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-[#444444]'
                    }`}
                    onClick={() => setSelectedResponse(selectedResponse === index ? null : index)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono uppercase text-[#D4A017] font-bold text-sm">
                          {option.type}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(option.riskLevel)}`}>
                          {option.riskLevel === 'LOW' ? 'SAFE' :
                           option.riskLevel === 'MEDIUM' ? 'CAREFUL' : 'RISKY'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-green-400 font-bold">
                        +{option.powerImpact}% influence
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{option.description}</p>

                    {/* Message */}
                    <div className="bg-gray-200 dark:bg-[#333333] p-3 rounded relative group">
                      <p className="text-gray-900 dark:text-white font-medium text-sm pr-8">{option.message}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(option.message, index);
                        }}
                        className="absolute top-2 right-2 p-1 bg-gray-300 dark:bg-[#444444] rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#555555]"
                      >
                        {copiedIndex === index ? (
                          <span className="text-xs text-green-400 font-mono">Done</span>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {/* Psychology Principle - Expanded View */}
                    {selectedResponse === index && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333333] space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-[#D4A017] mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-mono uppercase text-[#D4A017] mb-1">Psychology Behind This</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{option.psychologyPrinciple}</p>
                          </div>
                        </div>
                        <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-2 rounded text-xs text-gray-500 dark:text-gray-400">
                          <strong>Why this works:</strong> {option.description}
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">
                            Risk Level: {option.riskLevel === 'LOW' ? 'Safe to use' :
                                       option.riskLevel === 'MEDIUM' ? 'Watch their reaction' :
                                       'Use carefully - could backfire'}
                          </span>
                          <span className="text-green-400 font-mono">
                            Expected boost: +{option.powerImpact}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Overall Assessment ── */}
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
            <h2 className="font-mono text-lg uppercase text-[#D4A017] mb-4">Strategic Assessment</h2>
            <div className="space-y-4">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(result.overallAssessment) }} />
              </div>
              {result.techniques_identified.length > 0 && (
                <div>
                  <h3 className="font-mono text-sm uppercase text-[#D4A017] mb-2">
                    Techniques Detected
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.techniques_identified.map((technique, index) => (
                      <span
                        key={index}
                        className="bg-red-500/20 text-red-300 text-xs font-mono border border-red-500/30 px-2 py-1 rounded-full"
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save to Person Profile + Reset */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 py-3 bg-white dark:bg-[#1A1A1A] border border-[#D4A017] text-[#D4A017] font-mono text-sm uppercase tracking-wider rounded-lg hover:bg-[#D4A017] hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Save to Person Profile
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
            >
              Analyze Another Conversation
            </button>
          </div>

          {/* ── Follow-Up Chat ── */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setFollowUpExpanded(!followUpExpanded)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#D4A017]" />
                <span className="font-mono uppercase tracking-wider text-sm text-[#D4A017] font-bold">Ask a follow-up question about this conversation</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${followUpExpanded ? 'rotate-180' : ''}`} />
            </button>

            {followUpExpanded && (
              <div className="border-t border-gray-200 dark:border-[#333333]">
                {/* Messages */}
                <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                  {followUpMessages.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Ask anything about this conversation &mdash; predict responses, get alternative approaches, or explore the dynamics further.
                    </p>
                  )}
                  {followUpMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-[#D4A017] text-[#0A0A0A] whitespace-pre-wrap'
                          : 'bg-gray-100 dark:bg-[#222222] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-[#333333]'
                      }`}>
                        {msg.role === 'user' ? msg.content : (
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none [&_strong]:text-[#D4A017] [&_a]:text-[#D4A017]"
                            dangerouslySetInnerHTML={{ __html: msg.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/^(\d+)\.\s/gm, '<br/><strong>$1.</strong> ')
                              .replace(/^[-•]\s(.*)/gm, '<br/>→ $1')
                              .replace(/\(Source: "(.*?)" by (.*?)\)/g, '<span class="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">📖 $1</span>')
                              .replace(/\n\n/g, '<br/><br/>')
                              .replace(/\n/g, '<br/>')
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {followUpLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg px-4 py-2.5 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#D4A017]" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={followUpEndRef} />
                </div>

                {/* Suggested prompts */}
                {followUpMessages.length === 0 && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {['What if they say no?', 'How should I open this conversation?', "What's their likely motivation?", 'Give me 3 different approaches'].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => { setFollowUpInput(chip); }}
                        className="text-xs bg-gray-100 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:border-[#D4A017] hover:text-[#D4A017] transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-[#333333] flex gap-2">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && followUpInput.trim() && !followUpLoading) handleFollowUp(); }}
                    placeholder="Ask about this conversation..."
                    className="flex-1 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] transition-colors"
                  />
                  <button
                    onClick={handleFollowUp}
                    disabled={!followUpInput.trim() || followUpLoading}
                    className="px-4 py-2.5 bg-[#D4A017] text-[#0A0A0A] rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save to Profile Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg uppercase text-[#D4A017]">Save to Person Profile</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {peopleProfiles.length > 0 && (
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Select Existing Person
                </label>
                <select
                  value={selectedPersonId}
                  onChange={(e) => { setSelectedPersonId(e.target.value); setNewPersonName(''); }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                >
                  <option value="">-- Select a person --</option>
                  {peopleProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#333333]" />
              <span className="text-xs text-gray-500 uppercase">or create new</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-[#333333]" />
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                New Person Name
              </label>
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => { setNewPersonName(e.target.value); setSelectedPersonId(''); }}
                placeholder="Enter name..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
              />
            </div>

            <button
              onClick={handleSaveToProfile}
              disabled={savingToProfile || (!selectedPersonId && !newPersonName.trim())}
              className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {savingToProfile ? 'Saving...' : 'Save Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* Recent Analyses History — always visible below */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#D4A017]" />
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                Recent Analyses
              </span>
            </div>
            {history.length > 3 && (
              <button
                onClick={() => setHistoryExpanded(!historyExpanded)}
                className="flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#E8B830] font-mono uppercase transition-colors"
              >
                {historyExpanded ? 'Show Less' : `View All (${history.length})`}
                <ChevronDown className={`h-3 w-3 transition-transform ${historyExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(historyExpanded ? history : history.slice(0, 3)).map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadFromHistory(item)}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg cursor-pointer hover:border-[#D4A017] transition-all group"
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                  item.threat_score <= 3 ? 'bg-green-500/20 text-green-400' :
                  item.threat_score <= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {item.threat_score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {item.input_text ? item.input_text.slice(0, 80) : 'Image analysis'}
                    {item.input_text && item.input_text.length > 80 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.tactics_count} tactic{item.tactics_count !== 1 ? 's' : ''}
                    </span>
                    {item.input_type === 'image' && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">IMG</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteHistory(item.id, e)}
                  className="flex-shrink-0 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {historyLoading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 font-mono">Loading...</p>
          )}
        </div>
      )}

      {/* Toast notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-900/90 border border-green-700 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check className="h-4 w-4" />
          <span className="text-sm font-mono">{saveToast}</span>
        </div>
      )}
    </div>
  );
}
