'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, BookOpen, Target, CheckCircle, XCircle, Lightbulb, MessageSquare, Swords, Link2, Sparkles, Book, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface SynthesizedProfile {
  description: string;
  howTo: string[];
  whenToUse: string;
  whenNotToUse: string;
  examples: { scenario: string; description: string }[];
}

interface PracticeScenario {
  id: string;
  situation: string;
  yourMessage: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
    techniqueApplication: string;
  }[];
}

export default function TechniqueDetailClient({ techniqueId }: { techniqueId: string }) {
  const [technique, setTechnique] = useState<TechniqueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<string>('learn');
  const [synthesized, setSynthesized] = useState<SynthesizedProfile | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);

  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [practiceScenarios, setPracticeScenarios] = useState<PracticeScenario[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const router = useRouter();

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

  // Generate synthesized profile
  const handleSynthesize = async () => {
    if (!technique) return;
    setSynthesizing(true);
    try {
      const res = await fetch('/api/techniques/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techniqueId: technique.id }),
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
  };

  // Practice
  const generateScenarios = async () => {
    if (!technique) return;
    setPracticeLoading(true);
    setPracticeError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

      const res = await fetch('/api/technique-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: technique.id,
          techniqueName: technique.name,
          description: technique.chunks.overview?.[0]?.content?.slice(0, 200) || technique.name,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.scenarios?.length > 0) {
          setPracticeScenarios(data.scenarios);
        } else {
          setPracticeError('No scenarios generated. Try again.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setPracticeError(errData.error || `Failed to generate scenarios (${res.status})`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setPracticeError('Request timed out. The AI is taking too long — please try again.');
      } else {
        setPracticeError('Failed to connect. Please try again.');
      }
      console.error('Failed to generate practice scenarios:', err);
    }
    setPracticeLoading(false);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    if (practiceScenarios[currentScenario]?.options[optionIndex]?.isCorrect) {
      setScore(s => s + 1);
    }
  };

  const nextScenario = () => {
    if (currentScenario < practiceScenarios.length - 1) {
      setCurrentScenario(c => c + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setMode('learn');
    }
  };

  const startPractice = async () => {
    setMode('practice');
    setCurrentScenario(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    if (practiceScenarios.length === 0) {
      await generateScenarios();
    }
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

  // ── Practice mode ──
  if (mode === 'practice') {
    if (practiceLoading) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017] mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Generating practice scenarios...</p>
          <p className="mt-1 text-xs text-gray-400">This can take up to 30 seconds</p>
        </div>
      );
    }

    if (practiceError || practiceScenarios.length === 0) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          {practiceError ? (
            <p className="text-red-400 text-sm mb-4">{practiceError}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">No practice scenarios available yet.</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => generateScenarios()} className="px-6 py-2 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B830] transition-colors">
              Try Again
            </button>
            <button onClick={() => setMode('learn')} className="px-6 py-2 bg-gray-200 dark:bg-[#333333] text-gray-900 dark:text-white rounded-lg">
              Back to Learning
            </button>
          </div>
        </div>
      );
    }

    const scenario = practiceScenarios[currentScenario];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('learn')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to {technique.name}
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentScenario + 1} of {practiceScenarios.length} | Score: {score}/{practiceScenarios.length}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[#D4A017]" />
            <h2 className="font-mono uppercase text-[#D4A017]">Practice Scenario</h2>
          </div>

          <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg mb-4">
            <p className="text-gray-600 dark:text-gray-300">{scenario.situation}</p>
          </div>

          <p className="text-gray-900 dark:text-white font-medium mb-4">{scenario.yourMessage}</p>

          <div className="space-y-3">
            {scenario.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedOption === index
                    ? showFeedback
                      ? option.isCorrect ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                      : 'border-[#D4A017] bg-[#2A2520]'
                    : 'border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#222222] hover:border-[#444444]'
                } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  {showFeedback && (
                    <div className="flex-shrink-0 mt-0.5">
                      {option.isCorrect ? <CheckCircle className="h-5 w-5 text-green-400" /> : selectedOption === index ? <XCircle className="h-5 w-5 text-red-400" /> : null}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{option.text}</p>
                    {showFeedback && (selectedOption === index || option.isCorrect) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333333] space-y-2">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{option.explanation}</p>
                            <p className="text-xs text-[#D4A017] mt-1 font-mono uppercase">Technique Application: {option.techniqueApplication}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className="mt-6 text-center">
              <button onClick={nextScenario} className="px-6 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors">
                {currentScenario < practiceScenarios.length - 1 ? 'Next Scenario' : 'Complete Practice'}
              </button>
            </div>
          )}
        </div>
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
      <div className="flex space-x-1 bg-gray-50 dark:bg-[#222222] p-1 rounded-lg">
        <button
          onClick={() => setMode('learn')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'learn' ? 'bg-[#D4A017] text-[#0A0A0A]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Learn
        </button>
        <button
          onClick={startPractice}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'practice' ? 'bg-[#D4A017] text-[#0A0A0A]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Practice
        </button>
        <button
          onClick={() => setMode('examples')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'examples' ? 'bg-[#D4A017] text-[#0A0A0A]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Examples
        </button>
      </div>

      {mode === 'learn' && (
        <>
          {/* Overview chunks */}
          {technique.chunks.overview.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">Overview</h2>
              <div className="space-y-4">
                {technique.chunks.overview.map((chunk) => (
                  <div key={chunk.id}>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{chunk.content}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application chunks → How to Use */}
          {technique.chunks.application.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">How to Use It</h2>
              <div className="space-y-4">
                {technique.chunks.application.map((chunk) => (
                  <div key={chunk.id}>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{chunk.content}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Framework chunks */}
          {technique.chunks.framework.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">Framework</h2>
              <div className="space-y-4">
                {technique.chunks.framework.map((chunk) => (
                  <div key={chunk.id}>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{chunk.content}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Generate Summary button */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
            {!synthesized ? (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Want a structured summary with step-by-step instructions?</p>
                <button
                  onClick={handleSynthesize}
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
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="font-mono text-lg text-[#D4A017] uppercase flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Synthesized Profile
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300">{synthesized.description}</p>

                {/* How To */}
                <div>
                  <h3 className="font-mono text-md text-[#D4A017] uppercase mb-3">Step-by-Step</h3>
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
              </div>
            )}
          </div>

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

          {/* Practice CTA */}
          <div className="text-center p-8 bg-gradient-to-r from-[#2A2520] to-[#1A1A1A] rounded-lg border border-[#D4A017]/30">
            <h3 className="text-xl font-bold mb-2">Ready to Master This Technique?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Test your understanding with interactive scenarios</p>
            <button
              onClick={startPractice}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] transition-all hover:scale-105"
            >
              <Play className="h-5 w-5" />
              Start Interactive Practice
            </button>
          </div>
        </>
      )}

      {mode === 'examples' && (
        <div className="space-y-6">
          <h2 className="font-mono text-lg text-[#D4A017] uppercase flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Real-World Examples
          </h2>

          {/* Example chunks from the knowledge base */}
          {technique.chunks.example.length > 0 ? (
            technique.chunks.example.map((chunk) => (
              <div key={chunk.id} className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-xs font-mono uppercase">Example</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{chunk.bookTitle}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{chunk.content}</p>
                <p className="text-xs text-gray-500 italic">Source: {chunk.bookTitle} by {chunk.author}</p>
              </div>
            ))
          ) : synthesized?.examples ? (
            synthesized.examples.map((ex, i) => (
              <div key={i} className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-xs font-mono uppercase">Scenario {i + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{ex.scenario}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{ex.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <p className="text-gray-500 dark:text-gray-400 mb-3">No example chunks available.</p>
              <button
                onClick={handleSynthesize}
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
                    Generate Examples with AI
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

          {/* CTA to practice */}
          <div className="text-center pt-2">
            <button
              onClick={startPractice}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-[#E8B030] transition-all hover:scale-105"
            >
              <Play className="h-4 w-4" />
              Practice {technique.name} Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
