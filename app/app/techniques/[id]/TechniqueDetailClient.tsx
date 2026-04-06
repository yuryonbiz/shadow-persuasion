'use client';

import { useState } from 'react';
import { ArrowLeft, Play, BookOpen, Target, CheckCircle, XCircle, Lightbulb, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Technique {
  id: string;
  name: string;
  description: string;
  category: string;
  howTo: string[];
  whenToUse: string;
  whenNotToUse: string;
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

export default function TechniqueDetailClient({ technique }: { technique: Technique }) {
  const [mode, setMode] = useState<'learn' | 'practice' | 'examples'>('learn');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [practiceScenarios, setPracticeScenarios] = useState<PracticeScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Generate practice scenarios based on the technique
  const generateScenarios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/technique-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: technique.id,
          techniqueName: technique.name,
          description: technique.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPracticeScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error('Failed to generate practice scenarios:', error);
      // Fallback scenarios if API fails
      setPracticeScenarios(getDefaultScenarios(technique.id));
    }
    setIsLoading(false);
  };

  const getDefaultScenarios = (techniqueId: string): PracticeScenario[] => {
    const scenarioMap: Record<string, PracticeScenario[]> = {
      'anchoring': [
        {
          id: '1',
          situation: "You're negotiating salary for a new job. The hiring manager asks what salary you're looking for.",
          yourMessage: "What's the best way to use anchoring here?",
          options: [
            {
              text: "I'm looking for around $60,000",
              isCorrect: false,
              explanation: "This is a reasonable anchor but not high enough to leave room for negotiation.",
              techniqueApplication: "Weak anchoring - doesn't maximize your negotiating position."
            },
            {
              text: "I was hoping for something in the $85,000-$90,000 range based on my experience",
              isCorrect: true,
              explanation: "This sets a high anchor that influences their counteroffer upward.",
              techniqueApplication: "Strong anchoring - starts high and provides specific reasoning."
            },
            {
              text: "I'm flexible on salary - what were you thinking?",
              isCorrect: false,
              explanation: "This lets them anchor first, potentially lowballing you.",
              techniqueApplication: "Missed anchoring opportunity - you lose control of the negotiation frame."
            }
          ]
        }
      ],
      'reciprocity': [
        {
          id: '1',
          situation: "You want your colleague to help you with a project that's outside their normal duties.",
          yourMessage: "How do you create reciprocity to get their help?",
          options: [
            {
              text: "Hey, can you help me with this project? I really need it done by Friday.",
              isCorrect: false,
              explanation: "Direct ask without creating any sense of obligation or reciprocity.",
              techniqueApplication: "No reciprocity - just making a request without giving first."
            },
            {
              text: "I know you've been swamped with the Johnson account. I handled your client calls yesterday so you could focus on it. Could you help me with this project when you have a chance?",
              isCorrect: true,
              explanation: "References the favor you already did, creating reciprocal obligation.",
              techniqueApplication: "Perfect reciprocity - give first, then ask, with specific reference to your contribution."
            },
            {
              text: "If you help me with this project, I'll buy you lunch next week.",
              isCorrect: false,
              explanation: "This is transactional, not reciprocity. True reciprocity involves giving first.",
              techniqueApplication: "Quid pro quo, not reciprocity - the obligation is explicit rather than psychological."
            }
          ]
        }
      ]
    };

    return scenarioMap[techniqueId] || [];
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;

    setSelectedOption(optionIndex);
    setShowFeedback(true);

    const isCorrect = practiceScenarios[currentScenario]?.options[optionIndex]?.isCorrect;
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextScenario = () => {
    if (currentScenario < practiceScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Practice complete
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

  if (mode === 'practice') {
    if (isLoading) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017] mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Generating practice scenarios...</p>
          </div>
        </div>
      );
    }

    if (practiceScenarios.length === 0) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No practice scenarios available for this technique yet.</p>
            <button
              onClick={() => setMode('learn')}
              className="mt-4 px-6 py-2 bg-gray-200 dark:bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              Back to Learning
            </button>
          </div>
        </div>
      );
    }

    const scenario = practiceScenarios[currentScenario];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode('learn')}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {technique.name}
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentScenario + 1} of {practiceScenarios.length} | Score: {score}/{practiceScenarios.length}
          </div>
        </div>

        {/* Scenario */}
        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[#D4A017]" />
            <h2 className="font-mono uppercase text-[#D4A017]">Practice Scenario</h2>
          </div>

          <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg mb-4">
            <p className="text-gray-600 dark:text-gray-300">{scenario.situation}</p>
          </div>

          <p className="text-white font-medium mb-4">{scenario.yourMessage}</p>

          <div className="space-y-3">
            {scenario.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedOption === index
                    ? showFeedback
                      ? option.isCorrect
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-red-500 bg-red-900/20'
                      : 'border-[#D4A017] bg-[#2A2520]'
                    : 'border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#222222] hover:border-[#444444]'
                } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  {showFeedback && (
                    <div className="flex-shrink-0 mt-0.5">
                      {option.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : selectedOption === index ? (
                        <XCircle className="h-5 w-5 text-red-400" />
                      ) : null}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white">{option.text}</p>

                    {showFeedback && (selectedOption === index || option.isCorrect) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333333] space-y-2">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{option.explanation}</p>
                            <p className="text-xs text-[#D4A017] mt-1 font-mono uppercase">
                              Technique Application: {option.techniqueApplication}
                            </p>
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
              <button
                onClick={nextScenario}
                className="px-6 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
              >
                {currentScenario < practiceScenarios.length - 1 ? 'Next Scenario' : 'Complete Practice'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Learning Mode (default)
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <button
          onClick={() => router.push('/app/techniques')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Techniques
        </button>

        <div className="flex items-center gap-3 mb-2">
          <p className="font-mono text-sm text-[#D4A017] uppercase">{technique.category}</p>
          <span className="text-gray-500">•</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">Master this technique</p>
        </div>
        <h1 className="text-3xl font-bold tracking-wider">{technique.name}</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">{technique.description}</p>
      </header>

      {/* Mode Tabs */}
      <div className="flex space-x-1 bg-gray-50 dark:bg-[#222222] p-1 rounded-lg">
        <button
          onClick={() => setMode('learn')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'learn'
              ? 'bg-[#D4A017] text-[#0A0A0A]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Learn
        </button>
        <button
          onClick={startPractice}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'practice'
              ? 'bg-[#D4A017] text-[#0A0A0A]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Practice
        </button>
        <button
          onClick={() => setMode('examples')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'examples'
              ? 'bg-[#D4A017] text-[#0A0A0A]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Examples
        </button>
      </div>

      {mode === 'learn' && (
        <>
          {/* How to Use It */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
            <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">How to Use It</h2>
            <ul className="space-y-3">
              {technique.howTo.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-[#D4A017] text-[#0A0A0A] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Use / When NOT to Use */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h3 className="font-mono text-md text-green-400 uppercase mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                When to Use It
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{technique.whenToUse}</p>
            </div>
            <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
              <h3 className="font-mono text-md text-red-400 uppercase mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                When NOT to Use It
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{technique.whenNotToUse}</p>
            </div>
          </div>

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
        <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-[#333333]">
          <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-4">Real-World Examples</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Examples section coming soon - this will show real conversations and scripts demonstrating {technique.name} in action.
          </p>
        </div>
      )}
    </div>
  );
}
