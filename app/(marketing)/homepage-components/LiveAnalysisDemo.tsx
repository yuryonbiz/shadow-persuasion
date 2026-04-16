'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

const SAMPLE_INPUT = "I've been thinking about it, and I just don't think the timing is right for a raise. You know how much I value you. Let's revisit this after Q3 when things settle down.";

// Pre-built realistic result matching the actual /api/analyze output format
const SAMPLE_RESULT = {
  threatScore: 6,
  powerDynamics: { yourPower: 4, theirPower: 8, dynamicsDescription: 'They hold positional authority and are using delay tactics to maintain control. The "I value you" framing is designed to make you feel appreciated while deflecting the core request.' },
  communicationStyle: { sensoryPreference: 'Auditory', emotionalState: 'Calculated composure', receptivity: 35 },
  tactics: [
    { tactic: 'Future Faking', category: 'Misdirection', quote: "let's revisit this after Q3", explanation: 'Pushes commitment to a vague future date with no guarantee. Creates the illusion of agreement while avoiding action.', counterResponse: "I appreciate the timeline. Can we set a specific date and define what metrics would make this a yes?" },
    { tactic: 'Flattery Shield', category: 'Flattery', quote: "You know how much I value you", explanation: 'Emotional cushioning before a rejection. Makes you feel guilty for pushing back after being praised.', counterResponse: "Thank you, and because that value is mutual, I want to make sure my compensation reflects it. What would need to change?" },
  ],
  responseOptions: [
    { type: 'Direct & Assertive', message: "I hear you on timing. I've done some research and my market rate is $X-Y. I'm not looking to leave, but I need us to close that gap. What would make this a yes before Q3?", riskLevel: 'MEDIUM', powerImpact: 3 },
    { type: 'Strategic Patience', message: "I understand. Let's put a specific date on the calendar, say June 15th, and agree on the metrics you'd need to see. That way we're both clear on the path forward.", riskLevel: 'LOW', powerImpact: 2 },
  ],
  successProbability: 72,
};

const LiveAnalysisDemo = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      setAnimKey((k) => k + 1);
    }, 2500);
  }, []);

  const r = SAMPLE_RESULT;

  return (
    <section className="bg-[#0D0D0D] w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-10">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-400 mb-2">
            SAMPLE ANALYSIS OUTPUT
          </h2>
          <p className="text-3xl text-white">See What the System Reveals</p>
        </div>

        {/* Input section */}
        <div className="mb-8">
          <label className="block font-mono text-xs text-gray-500 mb-2 uppercase tracking-wider">
            Message Being Analyzed
          </label>
          <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4 text-gray-300 text-sm italic">
            &ldquo;{SAMPLE_INPUT}&rdquo;
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-green-400/80 uppercase tracking-wider">Analysis Engine</span>
          </div>
        </div>

        {/* Results — mirrors the real analyze page layout */}
        <motion.div
          key={animKey}
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={showResults && !isAnalyzing ? { opacity: 1 } : { opacity: 0.1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Threat Score */}
          <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">Manipulation Threat Level</span>
              <span className="font-mono text-2xl font-bold text-yellow-400">{r.threatScore}/10</span>
            </div>
            <div className="w-full h-3 bg-[#333] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-yellow-500"
                initial={{ width: 0 }}
                animate={showResults ? { width: `${r.threatScore * 10}%` } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <p className="text-sm mt-2 font-mono text-yellow-400">Moderate Threat, {r.tactics.length} tactics detected</p>
          </div>

          {/* Power Dynamics + Communication — side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Power Dynamics */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold mb-4">Influence Position</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Your Power</span>
                    <span className="text-[#D4A017] font-bold">{r.powerDynamics.yourPower}/10</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#333] rounded-full">
                    <motion.div className="h-full rounded-full bg-[#D4A017]" initial={{ width: 0 }} animate={showResults ? { width: `${r.powerDynamics.yourPower * 10}%` } : { width: 0 }} transition={{ duration: 0.6, delay: 0.3 }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Their Power</span>
                    <span className="text-blue-400 font-bold">{r.powerDynamics.theirPower}/10</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#333] rounded-full">
                    <motion.div className="h-full rounded-full bg-blue-500" initial={{ width: 0 }} animate={showResults ? { width: `${r.powerDynamics.theirPower * 10}%` } : { width: 0 }} transition={{ duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{r.powerDynamics.dynamicsDescription}</p>
            </div>

            {/* Communication Profile */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold mb-4">Communication Profile</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-[#0A0A0A] rounded-lg p-3">
                  <div className="text-lg font-bold text-white">{r.communicationStyle.sensoryPreference}</div>
                  <div className="text-[10px] font-mono uppercase text-[#D4A017] mt-1">Processing</div>
                </div>
                <div className="text-center bg-[#0A0A0A] rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">{r.communicationStyle.emotionalState.split(' ')[0]}</div>
                  <div className="text-[10px] font-mono uppercase text-[#D4A017] mt-1">Mood</div>
                </div>
                <div className="text-center bg-[#0A0A0A] rounded-lg p-3">
                  <div className="text-lg font-bold text-red-400">{r.communicationStyle.receptivity}%</div>
                  <div className="text-[10px] font-mono uppercase text-[#D4A017] mt-1">Openness</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Low receptivity: resistant to direct persuasion. Use reframing and questions instead of statements.</p>
            </div>
          </div>

          {/* Tactics Detected */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">&#9888;</span>
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400 font-bold">Tactics Detected</span>
            </div>
            {r.tactics.map((t, i) => (
              <div key={i} className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-white font-bold text-sm">{t.tactic}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-gray-600 text-gray-400">{t.category}</span>
                </div>
                <blockquote className="border-l-2 border-[#D4A017] pl-3 text-sm text-gray-500 italic">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="text-xs text-gray-400">{t.explanation}</p>
                <div className="bg-[#0A0A0A] border border-[#333] rounded p-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4A017] font-bold block mb-1">Counter:</span>
                  <p className="text-sm text-white">&ldquo;{t.counterResponse}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          {/* Response Options */}
          <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold">Strategic Response Options</h3>
              <span className="font-mono text-xs text-gray-500">Success Rate: <span className="text-green-400 font-bold">{r.successProbability}%</span></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {r.responseOptions.map((opt, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-[#333] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{opt.type}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${opt.riskLevel === 'LOW' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}`}>
                      {opt.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 italic">&ldquo;{opt.message}&rdquo;</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-gray-500">Power shift: +{opt.powerImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signup CTA at bottom */}
          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm mb-3">This is a sample result. Sign up to analyze your own conversations.</p>
            <a href="#pricing" className="inline-block bg-[#D4A017] text-[#0A0A0A] font-mono uppercase font-bold px-8 py-3 rounded hover:bg-[#E8B830] transition-colors tracking-wider text-sm">
              Start Your Training
            </a>
          </div>
        </motion.div>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600 font-mono">
          <span>🔒 256-bit encryption</span>
          <span>🗑️ Delete your data anytime</span>
          <span>🚫 Never shared or sold</span>
        </div>
      </div>
    </section>
  );
};

export default LiveAnalysisDemo;
