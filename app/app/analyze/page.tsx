'use client';

import { useState } from 'react';
import { Copy, TrendingUp, AlertTriangle, Target, Zap, HelpCircle, Shield } from 'lucide-react';

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
  Urgency: 'bg-red-900/40 text-red-300 border-red-800',
  'Social Proof': 'bg-blue-900/40 text-blue-300 border-blue-800',
  Authority: 'bg-purple-900/40 text-purple-300 border-purple-800',
  Guilt: 'bg-orange-900/40 text-orange-300 border-orange-800',
  Misdirection: 'bg-pink-900/40 text-pink-300 border-pink-800',
  Scarcity: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  Fear: 'bg-red-900/40 text-red-300 border-red-800',
  Flattery: 'bg-emerald-900/40 text-emerald-300 border-emerald-800',
  Reciprocity: 'bg-cyan-900/40 text-cyan-300 border-cyan-800',
  Anchoring: 'bg-indigo-900/40 text-indigo-300 border-indigo-800',
};

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
    case 'LOW': return 'text-green-400 bg-green-400/20 border-green-400/50';
    case 'MEDIUM': return 'text-yellow-300 bg-yellow-400/20 border-yellow-400/50';
    case 'HIGH': return 'text-red-300 bg-red-400/20 border-red-400/50';
    default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10 border-gray-400/20';
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

export default function AnalyzePage() {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
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
    if (mode === 'image' && !imageFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedResponse(null);

    try {
      let res: Response;

      if (mode === 'image' && imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        res = await fetch('/api/analyze', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim() }),
        });
      }

      if (!res.ok) {
        throw new Error('Failed to analyze.');
      }

      const data = await res.json();
      if (data.extractedText) setText(data.extractedText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSelectedResponse(null);
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
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('analyze-image-input')?.click()}
              className={`h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                imagePreview
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-gray-300 dark:border-[#444] hover:border-[#D4A017]'
              }`}
            >
              <input
                id="analyze-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imagePreview} alt="Preview" className="max-h-28 rounded" />
                  <span className="text-sm text-green-400 font-mono">{imageFile?.name}</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl mb-2">&#128248;</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Drop a screenshot here or click to browse</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">PNG, JPG, or WEBP</p>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={mode === 'text' ? !text.trim() : !imageFile}
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

          {/* ── Threat Score Bar ── */}
          {result.threatScore > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#D4A017]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                    Manipulation Threat Level
                  </span>
                </div>
                <span className={`font-mono text-2xl font-bold ${getThreatTextColor(result.threatScore)}`}>
                  {result.threatScore}/10
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getThreatColor(result.threatScore)}`}
                  style={{ width: `${result.threatScore * 10}%` }}
                />
              </div>
              <p className={`text-sm mt-2 font-mono ${getThreatTextColor(result.threatScore)}`}>
                {getThreatLabel(result.threatScore)} &mdash; {result.tactics.length} tactic{result.tactics.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          )}

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

          {/* ── Highlighted Original Text (if we have text) ── */}
          {text && result.tactics.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold block mb-3">
                Analyzed Text &mdash; Manipulation Highlighted
              </span>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {highlightText(text, result.tactics)}
              </p>
            </div>
          )}

          {/* ── Image Preview (if image mode) ── */}
          {imagePreview && (
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold block mb-3">
                Uploaded Screenshot
              </span>
              <img src={imagePreview} alt="Conversation screenshot" className="rounded-md max-h-64 mx-auto" />
            </div>
          )}

          {/* ── Manipulation Tactics Detected ── */}
          {result.tactics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  Manipulation Tactics Detected
                </span>
              </div>
              {result.tactics.map((tactic, i) => (
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">{tactic.explanation}</p>
                  <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#333333] rounded p-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold block mb-1">
                      Counter:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">&ldquo;{tactic.counterResponse}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Full Counter-Script ── */}
          {result.counterScript && result.tactics.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#D4A017] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold">
                  Full Counter-Script
                </span>
                <button
                  onClick={() => handleCopy(result.counterScript)}
                  className="text-xs text-gray-500 hover:text-[#D4A017] transition-colors flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <p className="text-gray-900 dark:text-white leading-relaxed">{result.counterScript}</p>
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
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{result.overallAssessment}</p>
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

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
          >
            Analyze Another Conversation
          </button>
        </div>
      )}
    </div>
  );
}
