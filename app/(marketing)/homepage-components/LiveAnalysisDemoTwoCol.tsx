'use client';

const SAMPLE_INPUT = "I've been thinking about it, and I just don't think the timing is right for a raise. You know how much I value you. Let's revisit this after Q3 when things settle down.";

const r = {
  threatScore: 6,
  powerDynamics: { yourPower: 4, theirPower: 8, dynamicsDescription: 'They hold positional authority and are using delay tactics to maintain control. The "I value you" framing is designed to make you feel appreciated while deflecting the core request.' },
  communicationStyle: { sensoryPreference: 'Auditory', emotionalState: 'Calculated composure', receptivity: 35 },
  tactics: [
    { tactic: 'Future Faking', category: 'Misdirection', quote: "let's revisit this after Q3", explanation: 'Pushes commitment to a vague future date with no guarantee.', counterResponse: "I appreciate the timeline. Can we set a specific date and define what metrics would make this a yes?" },
    { tactic: 'Flattery Shield', category: 'Flattery', quote: "You know how much I value you", explanation: 'Emotional cushioning before a rejection. Makes you feel guilty for pushing back.', counterResponse: "Thank you, and because that value is mutual, I want to make sure my compensation reflects it. What would need to change?" },
  ],
  responseOptions: [
    { type: 'Direct & Assertive', message: "I hear you on timing. I've done some research and my market rate is $X-Y. I'm not looking to leave, but I need us to close that gap. What would make this a yes before Q3?", riskLevel: 'MEDIUM', powerImpact: 3 },
    { type: 'Strategic Patience', message: "I understand. Let's put a specific date on the calendar, say June 15th, and agree on the metrics you'd need to see. That way we're both clear on the path forward.", riskLevel: 'LOW', powerImpact: 2 },
  ],
  successProbability: 72,
};

export default function LiveAnalysisDemoTwoCol() {
  return (
    <section className="bg-[#0D0D0D] w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-10">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">SAMPLE ANALYSIS OUTPUT</h2>
          <p className="text-3xl text-white">See What the System Reveals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left column — sticky input + key stats */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
            {/* Input message */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
              <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-3">Message Analyzed</p>
              <p className="text-gray-200 text-base italic leading-relaxed">&ldquo;{SAMPLE_INPUT}&rdquo;</p>
            </div>

            {/* Key metrics */}
            <div className="bg-[#1A1A1A] border border-yellow-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 font-bold">Threat Level</span>
                <span className="text-2xl font-bold text-yellow-400">{r.threatScore}/10</span>
              </div>
              <div className="w-full h-2.5 bg-[#252525] rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full bg-yellow-500" style={{ width: `${r.threatScore * 10}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0D0D0D] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-[#D4A017]">{r.powerDynamics.yourPower}/10</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">Your Power</p>
                </div>
                <div className="bg-[#0D0D0D] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{r.powerDynamics.theirPower}/10</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">Their Power</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-[#0D0D0D] rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-white">{r.communicationStyle.sensoryPreference}</p>
                  <p className="text-[10px] text-gray-500 font-mono">Style</p>
                </div>
                <div className="bg-[#0D0D0D] rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-red-400">{r.communicationStyle.receptivity}%</p>
                  <p className="text-[10px] text-gray-500 font-mono">Open</p>
                </div>
                <div className="bg-[#0D0D0D] rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-green-400">{r.successProbability}%</p>
                  <p className="text-[10px] text-gray-500 font-mono">Success</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a href="/login" className="block w-full bg-[#D4A017] text-[#0A0A0A] font-mono uppercase font-bold px-6 py-3 rounded-lg hover:bg-[#E8B830] transition-colors tracking-wider text-sm text-center">
              Start Your Training
            </a>
            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-mono">
              <span>🔒 Encrypted</span>
              <span>🗑️ Delete anytime</span>
              <span>🚫 Never shared</span>
            </div>
          </div>

          {/* Right column — detailed results */}
          <div className="space-y-4">
            {/* Tactics */}
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider text-red-400 font-bold mb-3 flex items-center gap-2">
                <span>&#9888;</span> {r.tactics.length} Tactics Detected
              </h3>
              {r.tactics.map((t, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-red-500/15 rounded-xl p-5 mb-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{t.tactic}</h4>
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-red-500/10 text-red-400">{t.category}</span>
                  </div>
                  <blockquote className="border-l-2 border-[#D4A017] pl-3 py-1 text-sm text-gray-400 italic">&ldquo;{t.quote}&rdquo;</blockquote>
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
              {r.responseOptions.map((opt, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-[#D4A017]/15 rounded-xl p-5 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-white">{opt.type}</h4>
                    <span className={`text-xs font-mono px-2 py-1 rounded-full border ${opt.riskLevel === 'LOW' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>{opt.riskLevel}</span>
                  </div>
                  <p className="text-sm text-gray-200 italic leading-relaxed">&ldquo;{opt.message}&rdquo;</p>
                  <p className="text-xs font-mono text-[#D4A017] mt-2">Power shift: +{opt.powerImpact}</p>
                </div>
              ))}
            </div>

            {/* Analysis context */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
              <p className="text-sm text-gray-400 leading-relaxed">{r.powerDynamics.dynamicsDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
