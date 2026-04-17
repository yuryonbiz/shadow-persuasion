'use client';

import { useState } from 'react';

const SAMPLE_INPUT = "I've been thinking about it, and I just don't think the timing is right for a raise. You know how much I value you. Let's revisit this after Q3 when things settle down.";

const r = {
  threatScore: 6,
  powerDynamics: { yourPower: 4, theirPower: 8 },
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

export default function LiveAnalysisDemoSummary() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-[#0D0D0D] w-full">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-10">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">SAMPLE ANALYSIS OUTPUT</h2>
          <p className="text-3xl text-white">See What the System Reveals</p>
        </div>

        {/* Input */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 mb-6">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">Message Being Analyzed</p>
          <p className="text-gray-200 text-base italic leading-relaxed">&ldquo;{SAMPLE_INPUT}&rdquo;</p>
        </div>

        {/* Summary card */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-5 border-b border-[#333]">
            <div className="p-4 md:p-5 text-center border-r border-[#333]">
              <p className="text-3xl font-bold text-yellow-400">{r.threatScore}<span className="text-base text-gray-500">/10</span></p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase">Threat</p>
            </div>
            <div className="p-4 md:p-5 text-center md:border-r border-[#333]">
              <p className="text-3xl font-bold text-[#D4A017]">{r.powerDynamics.yourPower}<span className="text-base text-gray-500">/10</span></p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase">Your Power</p>
            </div>
            <div className="p-4 md:p-5 text-center border-r border-[#333] border-t md:border-t-0">
              <p className="text-3xl font-bold text-blue-400">{r.powerDynamics.theirPower}<span className="text-base text-gray-500">/10</span></p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase">Their Power</p>
            </div>
            <div className="p-4 md:p-5 text-center md:border-r border-[#333] border-t md:border-t-0">
              <p className="text-3xl font-bold text-red-400">{r.tactics.length}</p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase">Tactics</p>
            </div>
            <div className="p-4 md:p-5 text-center border-t md:border-t-0 col-span-2 md:col-span-1">
              <p className="text-3xl font-bold text-green-400">{r.successProbability}%</p>
              <p className="text-xs font-mono text-gray-500 mt-1 uppercase">Success Rate</p>
            </div>
          </div>

          {/* Quick insights */}
          <div className="p-5 md:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-red-400">&#9888;</span>
              <span className="text-sm text-gray-300"><strong className="text-white">Future Faking</strong> and <strong className="text-white">Flattery Shield</strong> detected in this message</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#D4A017]">&#9670;</span>
              <span className="text-sm text-gray-300">Communication style: <strong className="text-white">{r.communicationStyle.sensoryPreference}</strong> processing, <strong className="text-red-400">{r.communicationStyle.receptivity}% openness</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">&#10003;</span>
              <span className="text-sm text-gray-300"><strong className="text-white">{r.responseOptions.length} strategic responses</strong> generated with counter-scripts</span>
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 border-t border-[#333] text-sm font-mono uppercase tracking-wider text-[#D4A017] hover:bg-[#D4A017]/5 transition-colors"
          >
            {expanded ? 'Hide Full Analysis' : 'See Full Analysis'}
          </button>

          {/* Expanded details */}
          {expanded && (
            <div className="border-t border-[#333] p-5 md:p-6 space-y-6">
              {/* Tactics */}
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wider text-red-400 font-bold mb-3">Tactics Detected</h3>
                {r.tactics.map((t, i) => (
                  <div key={i} className="bg-[#0D0D0D] rounded-lg p-4 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">{t.tactic}</h4>
                      <span className="text-xs font-mono px-2 py-1 rounded-full bg-red-500/10 text-red-400">{t.category}</span>
                    </div>
                    <blockquote className="border-l-2 border-[#D4A017] pl-3 text-sm text-gray-400 italic">&ldquo;{t.quote}&rdquo;</blockquote>
                    <p className="text-sm text-gray-300">{t.explanation}</p>
                    <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
                      <p className="font-mono text-[10px] uppercase text-green-400 font-bold mb-1">Counter</p>
                      <p className="text-sm text-green-200">&ldquo;{t.counterResponse}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Options */}
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wider text-[#D4A017] font-bold mb-3">Response Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {r.responseOptions.map((opt, i) => (
                    <div key={i} className="bg-[#0D0D0D] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-sm">{opt.type}</h4>
                        <span className={`text-xs font-mono px-2 py-1 rounded-full border ${opt.riskLevel === 'LOW' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>{opt.riskLevel}</span>
                      </div>
                      <p className="text-sm text-gray-200 italic">&ldquo;{opt.message}&rdquo;</p>
                      <p className="text-xs font-mono text-[#D4A017] mt-2">Power shift: +{opt.powerImpact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA + privacy */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-3">This is a sample result. Sign up to analyze your own conversations.</p>
          <a href="/login" className="inline-block bg-[#D4A017] text-[#0A0A0A] font-mono uppercase font-bold px-8 py-3 rounded-lg hover:bg-[#E8B830] transition-colors tracking-wider text-sm">Start Your Training</a>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400 font-mono">
          <span>🔒 256-bit encryption</span>
          <span>🗑️ Delete your data anytime</span>
          <span>🚫 Never shared or sold</span>
        </div>
      </div>
    </section>
  );
}
