'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SparringType =
  | 'Deflecting Manipulation'
  | 'Objection Handling'
  | 'Frame Wars'
  | 'Negotiation Pressure'
  | 'Emotional Provocations';

type Difficulty = 'Standard' | 'Advanced';

interface Round {
  challenge: string;
  context: string;
  idealTechniques: string[];
}

interface RoundResult {
  roundNumber: number;
  challenge: string;
  userResponse: string;
  timeUsed: number;
  score: number;
  feedback: string;
  techniquesDetected: string[];
  timedOut: boolean;
}

type Phase = 'setup' | 'loading' | 'active' | 'feedback' | 'grading' | 'results';

const SPARRING_TYPES: SparringType[] = [
  'Deflecting Manipulation',
  'Objection Handling',
  'Frame Wars',
  'Negotiation Pressure',
  'Emotional Provocations',
];

const TYPE_ICONS: Record<SparringType, string> = {
  'Deflecting Manipulation': '\u{1F6E1}',
  'Objection Handling': '\u{1F4AC}',
  'Frame Wars': '\u{1F3AF}',
  'Negotiation Pressure': '\u{1F4A5}',
  'Emotional Provocations': '\u{1F525}',
};

export default function SparringPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [sparringType, setSparringType] = useState<SparringType>('Objection Handling');
  const [difficulty, setDifficulty] = useState<Difficulty>('Standard');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [feedbackData, setFeedbackData] = useState<{ score: number; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const totalTime = difficulty === 'Advanced' ? 8 : 15;

  // Personal best from localStorage
  const [personalBest, setPersonalBest] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem('shadow-sparring-best');
    if (stored) setPersonalBest(parseInt(stored, 10));
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            handleTimesUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentRound]);

  const handleTimesUp = () => {
    submitResponse(true);
  };

  const startSparring = async () => {
    setPhase('loading');
    setError(null);
    setResults([]);
    setCurrentRound(0);

    try {
      const res = await fetch('/api/sparring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          sparringType,
          difficulty,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate sparring rounds.');

      const data = await res.json();
      if (!data.rounds || data.rounds.length === 0) throw new Error('No rounds generated.');

      setRounds(data.rounds);
      setPhase('active');
      setTimeLeft(totalTime);
      setRoundStartTime(Date.now());
      setUserResponse('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPhase('setup');
    }
  };

  const submitResponse = async (timedOut = false) => {
    clearTimer();
    const timeUsed = timedOut ? totalTime : Math.round((Date.now() - roundStartTime) / 1000);
    const response = timedOut ? '' : userResponse.trim();

    setPhase('grading');

    try {
      const res = await fetch('/api/sparring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade',
          challenge: rounds[currentRound].challenge,
          userResponse: response,
          idealTechniques: rounds[currentRound].idealTechniques,
          timeUsed,
        }),
      });

      if (!res.ok) throw new Error('Grading failed');

      const grade = await res.json();

      const roundResult: RoundResult = {
        roundNumber: currentRound + 1,
        challenge: rounds[currentRound].challenge,
        userResponse: response,
        timeUsed,
        score: timedOut ? 0 : (grade.score || 0),
        feedback: timedOut ? "TIME'S UP -- No response submitted" : (grade.feedback || ''),
        techniquesDetected: grade.techniquesDetected || [],
        timedOut,
      };

      const newResults = [...results, roundResult];
      setResults(newResults);
      setFeedbackData({
        score: roundResult.score,
        feedback: roundResult.feedback,
      });
      setPhase('feedback');

      // Auto-advance after 2 seconds
      setTimeout(() => {
        if (currentRound + 1 >= rounds.length) {
          // Save personal best
          const totalScore = newResults.reduce((sum, r) => sum + r.score, 0);
          if (totalScore > personalBest) {
            setPersonalBest(totalScore);
            localStorage.setItem('shadow-sparring-best', totalScore.toString());
          }
          setPhase('results');
        } else {
          setCurrentRound((prev) => prev + 1);
          setUserResponse('');
          setTimeLeft(totalTime);
          setRoundStartTime(Date.now());
          setPhase('active');
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 2000);
    } catch {
      // Fallback: still record the round with score 0
      const roundResult: RoundResult = {
        roundNumber: currentRound + 1,
        challenge: rounds[currentRound].challenge,
        userResponse: response,
        timeUsed,
        score: 0,
        feedback: 'Grading unavailable',
        techniquesDetected: [],
        timedOut,
      };
      const newResults = [...results, roundResult];
      setResults(newResults);
      setFeedbackData({ score: 0, feedback: 'Grading unavailable' });
      setPhase('feedback');

      setTimeout(() => {
        if (currentRound + 1 >= rounds.length) {
          setPhase('results');
        } else {
          setCurrentRound((prev) => prev + 1);
          setUserResponse('');
          setTimeLeft(totalTime);
          setRoundStartTime(Date.now());
          setPhase('active');
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userResponse.trim()) submitResponse(false);
    }
  };

  // Timer visual
  const timerFraction = timeLeft / totalTime;
  const timerColor =
    timerFraction > 0.5 ? '#D4A017' : timerFraction > 0.25 ? '#E8943A' : '#EF4444';
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference * (1 - timerFraction);

  // Results calculations
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const avgTime =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.timeUsed, 0) / results.length).toFixed(1)
      : '0';
  const bestRound = results.reduce(
    (best, r) => (r.score > best.score ? r : best),
    results[0] || { score: 0, roundNumber: 0 }
  );
  const worstRound = results.reduce(
    (worst, r) => (r.score < worst.score ? r : worst),
    results[0] || { score: 10, roundNumber: 0 }
  );
  const allTechniques = [...new Set(results.flatMap((r) => r.techniquesDetected))];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider flex items-center gap-3">
          <span className="text-[#D4A017]">{'\u{1F94A}'}</span> Sparring Mode
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Rapid-fire conversational drills. Respond under pressure. Sharpen your edge.
        </p>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <div className="space-y-6">
          {/* Sparring Type */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold block mb-3">
              Sparring Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SPARRING_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSparringType(type)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all font-mono text-sm ${
                    sparringType === type
                      ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                      : 'border-[#333333] bg-[#1A1A1A] text-gray-300 hover:border-[#555]'
                  }`}
                >
                  <span className="mr-2">{TYPE_ICONS[type]}</span>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold block mb-3">
              Difficulty
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Standard', 'Advanced'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-3 rounded-lg border transition-all font-mono text-sm ${
                    difficulty === d
                      ? 'border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017]'
                      : 'border-[#333333] bg-[#1A1A1A] text-gray-300 hover:border-[#555]'
                  }`}
                >
                  {d}
                  <span className="block text-xs text-gray-500 mt-1">
                    {d === 'Standard' ? '15 seconds' : '8 seconds'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {personalBest > 0 && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-3 text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
                Personal Best:
              </span>
              <span className="text-[#D4A017] font-mono font-bold ml-2">
                {personalBest}/100
              </span>
            </div>
          )}

          <button
            onClick={startSparring}
            className="w-full py-4 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] transition-all text-lg"
          >
            Begin Sparring
          </button>
        </div>
      )}

      {/* LOADING PHASE */}
      {phase === 'loading' && (
        <div className="text-center p-12 border-2 border-dashed border-[#D4A017] rounded-lg">
          <div className="animate-pulse space-y-3">
            <p className="font-mono text-xl text-[#D4A017]">GENERATING CHALLENGES...</p>
            <p className="text-sm text-gray-500">
              Preparing 10 rounds of {sparringType.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE SPARRING PHASE */}
      {(phase === 'active' || phase === 'grading') && rounds[currentRound] && (
        <div className="space-y-5">
          {/* Round counter */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-400 uppercase tracking-wider">
              Round {currentRound + 1}/10
            </span>
            <span className="font-mono text-xs text-gray-600">
              {sparringType} / {difficulty}
            </span>
          </div>

          {/* Timer */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#333333"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={timerColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: timerColor }}
                >
                  {phase === 'grading' ? '...' : timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Context */}
          {rounds[currentRound].context && (
            <p className="text-gray-500 text-xs font-mono text-center italic">
              {rounds[currentRound].context}
            </p>
          )}

          {/* Challenge */}
          <div className="bg-[#1A1A1A] border border-[#D4A017]/50 rounded-lg p-5">
            <p className="text-white text-lg leading-relaxed">
              &ldquo;{rounds[currentRound].challenge}&rdquo;
            </p>
          </div>

          {/* Input */}
          <textarea
            ref={inputRef}
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your response..."
            disabled={phase === 'grading'}
            className="w-full h-24 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4A017] transition-colors resize-none disabled:opacity-50"
            autoFocus
          />

          <div className="flex gap-3">
            <button
              onClick={() => submitResponse(false)}
              disabled={!userResponse.trim() || phase === 'grading'}
              className="flex-1 py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {phase === 'grading' ? 'Grading...' : 'Submit'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] rounded text-gray-400 text-xs">Enter</kbd> to submit
          </p>
        </div>
      )}

      {/* FEEDBACK FLASH */}
      {phase === 'feedback' && feedbackData && (
        <div className="text-center p-10 space-y-4">
          <div
            className={`inline-block text-6xl font-mono font-bold ${
              feedbackData.score >= 7
                ? 'text-green-400'
                : feedbackData.score >= 4
                ? 'text-[#D4A017]'
                : 'text-red-400'
            }`}
          >
            {feedbackData.score}/10
          </div>
          <p className="text-gray-300 text-sm max-w-md mx-auto">{feedbackData.feedback}</p>
          <div className="w-8 h-0.5 bg-[#333333] mx-auto" />
          <p className="text-gray-600 text-xs font-mono animate-pulse">Next round loading...</p>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && results.length > 0 && (
        <div className="space-y-6">
          {/* Total Score */}
          <div className="text-center p-8 bg-[#1A1A1A] border border-[#D4A017] rounded-lg">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">
              Total Score
            </p>
            <p className="text-5xl font-mono font-bold text-[#D4A017]">{totalScore}/100</p>
            {totalScore >= personalBest && totalScore > 0 && (
              <p className="text-green-400 text-sm font-mono mt-2">NEW PERSONAL BEST</p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-center">
              <p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-1">
                Avg Response Time
              </p>
              <p className="text-xl font-mono text-white">{avgTime}s</p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-center">
              <p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-1">
                Rounds Timed Out
              </p>
              <p className="text-xl font-mono text-white">
                {results.filter((r) => r.timedOut).length}
              </p>
            </div>
          </div>

          {/* Best Round */}
          <div className="bg-[#1A1A1A] border border-green-900/50 rounded-lg p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-green-400 font-bold mb-2">
              Best Round (#{bestRound.roundNumber})
            </p>
            <p className="text-gray-400 text-sm italic mb-1">
              &ldquo;{bestRound.challenge}&rdquo;
            </p>
            <p className="text-white text-sm">
              Your response: &ldquo;{bestRound.userResponse || '[no response]'}&rdquo;
            </p>
            <p className="text-green-400 text-xs mt-1 font-mono">
              Score: {bestRound.score}/10 -- {bestRound.feedback}
            </p>
          </div>

          {/* Worst Round */}
          <div className="bg-[#1A1A1A] border border-red-900/50 rounded-lg p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold mb-2">
              Weakest Round (#{worstRound.roundNumber})
            </p>
            <p className="text-gray-400 text-sm italic mb-1">
              &ldquo;{worstRound.challenge}&rdquo;
            </p>
            <p className="text-white text-sm">
              Your response: &ldquo;{worstRound.userResponse || '[no response]'}&rdquo;
            </p>
            <p className="text-red-400 text-xs mt-1 font-mono">
              Score: {worstRound.score}/10 -- {worstRound.feedback}
            </p>
          </div>

          {/* Techniques Detected */}
          {allTechniques.length > 0 && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
                Techniques Detected in Your Responses
              </p>
              <div className="flex flex-wrap gap-2">
                {allTechniques.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded text-[#D4A017] text-xs font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Round-by-Round */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
              All Rounds
            </p>
            <div className="space-y-2">
              {results.map((r) => (
                <div
                  key={r.roundNumber}
                  className="flex items-center justify-between text-sm py-1 border-b border-[#222] last:border-0"
                >
                  <span className="text-gray-500 font-mono">R{r.roundNumber}</span>
                  <span className="text-gray-400 truncate flex-1 mx-3 text-xs">
                    {r.feedback}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      r.score >= 7
                        ? 'text-green-400'
                        : r.score >= 4
                        ? 'text-[#D4A017]'
                        : 'text-red-400'
                    }`}
                  >
                    {r.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setPhase('setup');
                setResults([]);
                setCurrentRound(0);
                setRounds([]);
              }}
              className="py-3 bg-[#1A1A1A] border border-[#333333] text-gray-400 font-mono text-sm uppercase tracking-wider rounded-lg hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
            >
              Try Different Mode
            </button>
            <button
              onClick={startSparring}
              className="py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] transition-all text-sm"
            >
              Spar Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
