'use client';

import { useState } from 'react';

const SAMPLE_INPUT = "I've been thinking about it, and I just don't think the timing is right for a raise. You know how much I value you. Let's revisit this after Q3 when things settle down.";

const r = {
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

const tabs = ['Overview', 'Tactics Detected', 'Response Options'] as const;
type Tab = typeof tabs[number];

export default function LiveAnalysisDemoTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  return (
    <section className="bg-[#0D0D0D] w-full">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-10">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">SAMPLE ANALYSIS OUTPUT</h2>
          <p className="text-3xl text-white">See What the System Reveals</p>
        </div>

        {/* Input */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 mb-6">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">Message Being Analyzed</p>
          <p className="text-gray-200 text-base italic leading-relaxed">&ldquo;{SAMPLE_INPUT}&rdquo;</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-1 bg-[#1A1A1A] p-1 rounded-t-xl border border-b-0 border-[#333]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-mono uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-[#D4A017] text-[#0A0A0A] font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#252525]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-b-xl p-6 md:p-8 min-h-[350px]">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Threat Score */}
              <div className="bg-[#0D0D0D] rounded-xl p-5 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm uppercase tracking-wider text-gray-300 font-bold">Manipulation Threat Level</span>
                  <span className="font-mono text-3xl font-bold text-yellow-400">{r.threatScore}/10</span>
                </div>
                <div className="w-full h-3 bg-[#252525] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-yellow-500" style={{ width: `${r.threatScore * 10}%` }} />
                </div>
                <p className="text-sm mt-2 font-mono text-yellow-400/80">{r.tactics.length} tactics detected</p>
              </div>

              {/* Power + Comms side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0D0D0D] rounded-xl p-5 border border-[#D4A017]/20">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-[#D4A017] font-bold mb-4">Influence Position</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300">Your Power</span>
                        <span className="text-[#D4A017] font-bold text-lg">{r.powerDynamics.yourPower}/10</span>
                      </div>
                      <div className="w-full h-3 bg-[#252525] rounded-full"><div className="h-full rounded-full bg-[#D4A017]" style={{ width: `${r.powerDynamics.yourPower * 10}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300">Their Power</span>
                        <span className="text-blue-400 font-bold text-lg">{r.powerDynamics.theirPower}/10</span>
                      </div>
                      <div className="w-full h-3 bg-[#252525] rounded-full"><div className="h-full rounded-full bg-blue-500" style={{ width: `${r.powerDynamics.theirPower * 10}%` }} /></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-4 leading-relaxed">{r.powerDynamics.dynamicsDescription}</p>
                </div>

                <div className="bg-[#0D0D0D] rounded-xl p-5 border border-blue-500/20">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-blue-400 font-bold mb-4">Communication Profile</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Processing Style', value: r.communicationStyle.sensoryPreference, color: 'text-white' },
                      { label: 'Emotional State', value: r.communicationStyle.emotionalState, color: 'text-blue-300' },
                      { label: 'Influence Openness', value: `${r.communicationStyle.receptivity}%`, color: 'text-red-400' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b border-[#252525] pb-3 last:border-0 last:pb-0">
                        <span className="text-sm text-gray-400">{item.label}</span>
                        <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-4">Low receptivity. Use reframing and questions instead of direct statements.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Tactics Detected' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 font-mono mb-2">{r.tactics.length} manipulation tactics identified in this message</p>
              {r.tactics.map((t, i) => (
                <div key={i} className="bg-[#0D0D0D] rounded-xl p-5 border border-red-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">{t.tactic}</h4>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">{t.category}</span>
                  </div>
                  <blockquote className="border-l-3 border-[#D4A017] pl-4 py-2 bg-[#1A1A1A] rounded-r-lg">
                    <p className="text-base text-gray-300 italic">&ldquo;{t.quote}&rdquo;</p>
                  </blockquote>
                  <p className="text-sm text-gray-300 leading-relaxed">{t.explanation}</p>
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-green-400 font-bold mb-2">Recommended Counter</p>
                    <p className="text-base text-green-200">&ldquo;{t.counterResponse}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Response Options' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400 font-mono">AI-generated response strategies</p>
                <span className="font-mono text-sm text-gray-300">Success Rate: <span className="text-green-400 font-bold text-lg">{r.successProbability}%</span></span>
              </div>
              {r.responseOptions.map((opt, i) => (
                <div key={i} className="bg-[#0D0D0D] rounded-xl p-5 border border-[#D4A017]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">{opt.type}</h4>
                    <span className={`text-xs font-mono px-3 py-1 rounded-full border ${opt.riskLevel === 'LOW' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'}`}>
                      {opt.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-base text-gray-200 leading-relaxed italic">&ldquo;{opt.message}&rdquo;</p>
                  <p className="text-xs font-mono text-[#D4A017]">Power shift: +{opt.powerImpact} points in your favor</p>
                </div>
              ))}
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
