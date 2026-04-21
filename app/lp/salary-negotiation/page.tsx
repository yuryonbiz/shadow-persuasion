'use client';

import { useState } from 'react';
import { Special_Elite } from 'next/font/google';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Upload, Zap, TrendingUp, Camera, MessageSquare, FileText, Target, Shield, Swords, BarChart3, CheckCircle, ChevronDown, BookOpen, Brain, UserCheck, Mic, Briefcase } from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

/* ═══════════════════════════════════════════════
   Shared helpers
   ═══════════════════════════════════════════════ */

function SectionDivider({ text }: { text: string }) {
  return (
    <div className="relative bg-[#1A1A1A] py-3 border-y-2 border-red-900/30">
      <p className="text-center font-mono text-sm text-[#D4A017] tracking-[0.25em] uppercase">{text}</p>
    </div>
  );
}

function MidPageCTA({ headline }: { headline: string }) {
  return (
    <div className="flex justify-center px-6 py-12 md:py-16">
      <div className="max-w-2xl w-full bg-[#1A1A1A] rounded-2xl px-8 py-10 md:px-12 md:py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#F4ECD8] mb-6">{headline}</h2>
        <div className="mb-2"><span className="text-4xl md:text-5xl font-bold text-[#D4A017]">$99</span><span className="text-lg text-[#F4ECD8]/70">/month</span></div>
        <p className="text-sm text-[#F4ECD8]/50 mb-8">Cancel anytime. One raise pays for years.</p>
        <a href="/login" className="inline-block bg-[#D4A017] hover:bg-[#C49A3A] text-[#1A1A1A] font-bold text-lg px-10 py-4 rounded-lg tracking-wide transition-colors">GET YOUR COUNTER-STRATEGY</a>
        <p className="mt-6 text-sm text-[#F4ECD8]/40">Join 2,000+ members already training</p>
      </div>
    </div>
  );
}

function AccordionItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#D4A017]/20">
      <button className="w-full flex justify-between items-center text-left py-5 px-4 group" onClick={() => setOpen(!open)}>
        <span className="text-lg font-bold text-[#1a1207] group-hover:text-[#D4A017] transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-[#D4A017] shrink-0 ml-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-5 text-base leading-relaxed text-[#3a3024]">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════ */

export default function SalaryNegotiationLP() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tactics' | 'responses'>('overview');

  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] overflow-x-hidden`}>

      {/* ══ 1. HERO (CoverPage equivalent) ══ */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#F4ECD8] px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/logo.png" alt="Shadow Persuasion" className="w-40 md:w-52 mx-auto mb-8" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#6B5B3E] mb-4">
            <span className="font-bold">CLASSIFICATION:</span>{' '}Salary Negotiation Intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-wider leading-tight mb-6">
            Stop Leaving <span className="text-[#D4A017]">$5K-$50K+</span>{' '}on the Table
          </h1>
          <p className="text-lg md:text-xl text-[#5C3A1E] max-w-2xl mx-auto mb-4 leading-relaxed">
            Your boss has scripts, HR training, and budget authority. You walk in with nothing but hope. Shadow Persuasion gives you the exact words, tactics, and counter-strategies to close the gap.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <a href="/login" className="inline-flex items-center bg-black text-white font-mono uppercase font-bold text-lg px-10 py-4 hover:bg-gray-800 transition-colors tracking-wider">
              GET YOUR COUNTER-STRATEGY <ArrowRight className="ml-2" />
            </a>
            <p className="text-sm text-[#6B5B3E]">$99/month. Cancel anytime. 30-day money-back guarantee.</p>
          </div>
        </div>
      </section>

      {/* ══ 2. EXECUTIVE SUMMARY (pain + promise) ══ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <section>
          <div className="border-b-2 border-t-2 border-[#5C3A1E] py-1 mb-12 text-sm text-center text-[#6B5B3E] tracking-wide">
            <p>CLASSIFICATION: SALARY INTELLIGENCE BRIEFING | DATE: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
          </div>
          <h2 className="text-4xl font-bold uppercase tracking-wider mb-10 text-center text-[#2A1F0E]">The Problem</h2>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="flex-1 space-y-6 text-lg leading-relaxed text-[#3B2E1A]">
              <p>You know you are underpaid. Your market research confirms it. But every time you bring it up, your boss deflects with &quot;not the right time,&quot; &quot;budget constraints,&quot; or &quot;let&apos;s revisit next quarter.&quot; Next quarter never comes.</p>
              <p>You replay the conversation in your head and think of what you <span style={{ background: 'rgba(200, 168, 78, 0.25)' }}>SHOULD</span>{' '}have said. You watch less experienced coworkers earn more because they negotiated on the way in. You didn&apos;t. <span style={{ background: 'rgba(200, 168, 78, 0.25)' }}>Every month you wait, you lose money you already earned but never collected.</span></p>
              <p>Shadow Persuasion changes that. Powered by a proprietary knowledge base of psychology, negotiation research, and influence techniques that general AI has never seen. Upload what your boss said and get the exact counter-strategy. Practice the conversation with AI before the real meeting. Walk in prepared. <span style={{ background: 'rgba(200, 168, 78, 0.25)' }}>Stop leaving leverage on the table.</span></p>
              <p>Members report <span style={{ background: 'rgba(200, 168, 78, 0.25)' }}>$5,000 to $50,000+ salary increases</span>{' '}after their first negotiation using the system. The difference is not talent. It is having a system that decodes what your boss really means and tells you exactly what to say back.</p>
            </div>
            <div className="lg:w-[340px] shrink-0">
              <div className="border-2 border-[#A0884A] bg-[#F4ECD8]/50 p-6 sticky top-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#5C3A1E] border-b border-[#A0884A]/50 pb-3 mb-5">Intelligence Brief</h3>
                <div className="space-y-4">
                  {[
                    { icon: Briefcase, value: '$5K-$50K+', label: 'Average Raise Members Report' },
                    { icon: Target, value: '< 60 sec', label: 'From Boss Response to Counter-Strategy' },
                    { icon: Swords, value: 'AI Role-Play', label: 'Practice Before the Real Meeting' },
                    { icon: BookOpen, value: '700+', label: 'Negotiation Techniques Available' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 border border-[#A0884A]/30 bg-[#F4ECD8]/40">
                        <div className="mt-0.5 text-[#8B6914]"><Icon size={20} strokeWidth={1.8} /></div>
                        <div>
                          <p className="text-xl font-bold text-[#5C3A1E] leading-tight">{stat.value}</p>
                          <p className="text-sm text-[#7A6543] leading-snug">{stat.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ 3. HOW IT WORKS ══ */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-[#EDE3D0]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3 text-[#1A1A1A]">How It Works</h2>
          <p className="text-center text-[#5C4B32] mb-14 text-lg max-w-2xl mx-auto">From underpaid to counter-offer in under 60 seconds</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Upload, num: '01', title: 'SHOW US WHAT YOUR BOSS SAID', desc: "Screenshot your boss's rejection, paste the email, or describe the conversation. The AI instantly understands the dynamics.", details: [{ icon: Camera, text: "Screenshot your boss's text or email" }, { icon: MessageSquare, text: 'Describe the situation in your own words' }, { icon: FileText, text: 'Paste the exact response they gave you' }] },
              { icon: Zap, num: '02', title: 'GET YOUR COUNTER-STRATEGY', desc: 'The AI identifies what tactics your boss is using (delay, deflection, guilt tripping), maps the power dynamics, and gives you word-for-word scripts to shift the conversation.', details: [{ icon: Target, text: 'Detect delay tactics and deflection patterns' }, { icon: MessageSquare, text: 'Multiple response options with risk levels' }, { icon: Shield, text: 'Scripts adapted to your voice and situation' }] },
              { icon: TrendingUp, num: '03', title: 'PRACTICE AND WIN', desc: 'Role-play the salary conversation with AI before the real meeting. Get coaching on your delivery. Walk in with the exact framing, timing, and words to close.', details: [{ icon: Swords, text: 'AI plays your boss with realistic pushback' }, { icon: Target, text: 'Real-time coaching scores on your responses' }, { icon: BarChart3, text: 'Build negotiation confidence with each session' }] },
            ].map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.num} className="relative bg-white border border-gray-300 rounded-xl p-6 lg:p-8 hover:shadow-lg hover:border-[#D4A017] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center"><StepIcon className="h-6 w-6 text-[#D4A017]" /></div>
                    <span className="text-sm font-mono text-[#D4A017] tracking-widest font-bold">STEP {step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{step.title}</h3>
                  <p className="text-[#3B2E1A] text-base leading-relaxed mb-6">{step.desc}</p>
                  <ul className="space-y-3">
                    {step.details.map((d) => { const DI = d.icon; return (
                      <li key={d.text} className="flex items-start gap-3"><DI className="h-4 w-4 text-[#D4A017] mt-0.5 shrink-0" strokeWidth={2} /><span className="text-sm text-gray-600">{d.text}</span></li>
                    ); })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 4. SCENARIO SIMULATOR (before/after) ══ */}
      <section className="relative px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0] flex justify-center">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-amber-500/70">What You Say vs. What You Should Say</h2>
            <p className="text-3xl md:text-4xl mt-2 text-white">The $10,000 Difference in One Response</p>
          </div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative border-2 border-red-800/60 bg-[#222] p-6 sm:p-8 shadow-2xl rounded-lg">
              <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-t-lg" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-red-400 mb-1">Without Shadow Persuasion</h3>
              <p className="text-xs text-red-400/50 font-mono mb-6">What most people say</p>
              <p className="text-lg leading-relaxed text-gray-400 italic">&ldquo;I understand the budget is tight. Can we revisit this in six months? I&apos;m committed to proving my value and hopefully we can make it work then.&rdquo;</p>
              <p className="text-xs text-red-400/60 mt-4 font-mono">Result: You wait 6 months. Nothing changes.</p>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex">
              <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border-2 border-amber-500 flex items-center justify-center shadow-lg"><span className="font-mono text-amber-400 font-bold text-sm">VS</span></div>
            </div>
            <div className="relative border-2 border-green-600/50 bg-[#222] p-6 sm:p-8 shadow-2xl rounded-lg">
              <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-green-500 to-green-700 rounded-t-lg" />
              <h3 className="font-mono text-sm uppercase tracking-widest text-green-400 mb-1">With Shadow Persuasion</h3>
              <p className="text-xs text-green-400/50 font-mono mb-6">AI-generated counter-strategy</p>
              <p className="text-lg leading-relaxed text-gray-200">&ldquo;I appreciate the transparency. Based on my research, the market rate for this role with my track record is $95-110K. I&apos;m not looking to leave, but I need my compensation to reflect the value I&apos;m delivering. What would need to happen for us to close that gap this quarter?&rdquo;</p>
              <p className="text-xs text-green-400/60 mt-4 font-mono">Result: Specific timeline. Measurable criteria. Ball in their court.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 5. MID CTA ══ */}
      <MidPageCTA headline="Your Next Raise Is One Conversation Away" />

      <SectionDivider text="// SEE WHAT THE SYSTEM ACTUALLY DOES //" />

      {/* ══ 6. CAPABILITIES (salary-focused) ══ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <section className="relative bg-[#EDE3D0] rounded-lg px-6 py-8 md:p-12">
          <div className="text-left mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black">Your Salary Negotiation Toolkit</h2>
            <div className="w-24 h-1 bg-green-600 mt-4" />
            <p className="font-mono text-sm uppercase tracking-widest text-gray-600 mt-4">Everything You Need to Negotiate With Confidence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Conversation Analyzer', desc: "Upload your boss's rejection. See what delay tactics, deflection patterns, and guilt trips they're using. Get counter-scripts instantly." },
              { title: 'AI Strategic Coach', desc: 'Describe your salary situation and get a complete negotiation game plan with word-for-word scripts, timing recommendations, and risk assessment.' },
              { title: 'Training Arena', desc: "Practice the salary conversation with an AI that plays your boss. It pushes back realistically. You get scored on your delivery and coached in real time." },
              { title: 'Message Optimizer', desc: "Paste your draft email asking for a raise. Get psychologically optimized rewrites that frame your request for maximum impact." },
              { title: 'Technique Library', desc: '700+ techniques including anchoring, frame control, strategic silence, scarcity framing. Drawn from proprietary psychology research.' },
              { title: 'Voice Profile', desc: "The AI adapts all scripts to sound like YOU. You'll sound sharp, not scripted. Your boss won't know you're using a system." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-[#F4ECD8] border border-[#999] rounded-lg p-5">
                <CheckCircle className="h-5 w-5 text-green-700 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-black">{item.title}</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ══ 7. SAMPLE ANALYSIS (tabbed, beige) ══ */}
      <section className="bg-[#EDE3D0] w-full px-6 md:px-12 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-[#8A7A5A] text-center mb-2">Real Output From Our System</p>
          <h2 className="text-3xl font-bold text-center mb-8">Your Boss Said No. Here&apos;s What the AI Found.</h2>
          <div className="bg-[#F4ECD8] border border-[#C4B89A] rounded-xl p-5 mb-6">
            <p className="font-mono text-xs text-[#8A7A5A] uppercase tracking-wider mb-2">Your Boss&apos;s Response</p>
            <p className="text-[#3B2E1A] text-base italic leading-relaxed">&ldquo;I&apos;ve been thinking about it, and I just don&apos;t think the timing is right for a raise. You know how much I value you. Let&apos;s revisit this after Q3 when things settle down.&rdquo;</p>
          </div>
          <div className="flex gap-1 mb-1 bg-[#F4ECD8] p-1 rounded-t-xl border border-b-0 border-[#C4B89A]">
            {(['overview', 'tactics', 'responses'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 text-sm font-mono uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-[#D4A017] text-[#0A0A0A] font-bold' : 'text-[#6B5B3E] hover:text-[#1A1A1A] hover:bg-[#EDE3D0]'}`}>
                {tab === 'overview' ? 'Overview' : tab === 'tactics' ? 'Tactics Detected' : 'What To Say Back'}
              </button>
            ))}
          </div>
          <div className="bg-[#F4ECD8] border border-[#C4B89A] rounded-b-xl p-6 md:p-8 min-h-[280px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[#EDE3D0] rounded-xl p-5 border border-yellow-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm uppercase tracking-wider text-[#4A3C28] font-bold">Manipulation Threat Level</span>
                    <span className="font-mono text-3xl font-bold text-[#1A1A1A]">6/10</span>
                  </div>
                  <div className="w-full h-3 bg-[#D4C9AE] rounded-full overflow-hidden"><div className="h-full rounded-full bg-yellow-500" style={{ width: '60%' }} /></div>
                  <p className="text-sm mt-2 font-mono text-[#5C3A1E]">2 delay/deflection tactics detected</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{ val: '4/10', label: 'Your Current Power', color: 'text-[#D4A017]' }, { val: '8/10', label: 'Their Current Power', color: 'text-[#2563EB]' }, { val: '72%', label: 'Success Probability', color: 'text-green-700' }].map((s) => (
                    <div key={s.label} className="bg-[#EDE3D0] rounded-xl p-4 border border-[#C4B89A] text-center">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-xs font-mono text-[#6B5B3E] mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'tactics' && (
              <div className="space-y-4">
                <p className="text-sm text-[#6B5B3E] font-mono">2 manipulation tactics your boss used in this response</p>
                {[
                  { tactic: 'Future Faking', category: 'Misdirection', quote: "let's revisit this after Q3", explanation: 'Pushes commitment to a vague future date with no guarantee. Creates the illusion of agreement while avoiding action.' },
                  { tactic: 'Flattery Shield', category: 'Flattery', quote: "You know how much I value you", explanation: 'Emotional cushioning before a rejection. Makes you feel guilty for pushing back after being praised.' },
                ].map((t, i) => (
                  <div key={i} className="bg-[#EDE3D0] rounded-xl p-5 border border-red-600/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-[#1A1A1A]">{t.tactic}</h4>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">{t.category}</span>
                    </div>
                    <blockquote className="border-l-4 border-[#D4A017] pl-4 py-2 bg-[#F4ECD8] rounded-r-lg"><p className="text-base text-[#4A3C28] italic">&ldquo;{t.quote}&rdquo;</p></blockquote>
                    <p className="text-sm text-[#4A3C28] leading-relaxed">{t.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'responses' && (
              <div className="space-y-4">
                <p className="text-sm text-[#6B5B3E] font-mono">AI-generated counter-strategies</p>
                {[
                  { counter: 'Counter to: Future Faking', text: "I appreciate the timeline. Can we set a specific date and define what metrics would make this a yes?" },
                  { counter: 'Counter to: Flattery Shield', text: "Thank you, and because that value is mutual, I want to make sure my compensation reflects it. What would need to change?" },
                ].map((c, i) => (
                  <div key={i} className="bg-green-50 border border-green-300 rounded-xl p-5">
                    <p className="font-mono text-xs uppercase text-green-700 font-bold mb-1">{c.counter}</p>
                    <p className="text-base text-green-900 leading-relaxed">&ldquo;{c.text}&rdquo;</p>
                  </div>
                ))}
                <div className="border-t border-[#C4B89A] pt-4 mt-4">
                  <p className="font-mono text-xs uppercase text-[#6B5B3E] mb-3">Full Response Options</p>
                  {[
                    { type: 'Direct & Assertive', msg: "I hear you on timing. I've done some research and my market rate is $X-Y. I'm not looking to leave, but I need us to close that gap. What would make this a yes before Q3?", risk: 'MEDIUM' },
                    { type: 'Strategic Patience', msg: "I understand. Let's put a specific date on the calendar, say June 15th, and agree on the metrics you'd need to see. That way we're both clear on the path forward.", risk: 'LOW' },
                  ].map((opt, i) => (
                    <div key={i} className="bg-[#EDE3D0] border border-[#C4B89A] rounded-xl p-5 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-[#1A1A1A]">{opt.type}</h4>
                        <span className={`text-xs font-mono px-2 py-1 rounded-full border ${opt.risk === 'LOW' ? 'text-green-700 bg-green-50 border-green-300' : 'text-yellow-700 bg-yellow-50 border-yellow-300'}`}>{opt.risk} RISK</span>
                      </div>
                      <p className="text-base text-[#3B2E1A] italic leading-relaxed">&ldquo;{opt.msg}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </section>

      {/* ══ 8. COACHING SESSION (salary-specific) ══ */}
      <section className="relative bg-[#EAE3D2] py-16 sm:py-24 px-6 sm:px-8 border-b-2 border-dashed border-gray-400">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">Sample Session</h2>
            <p className="text-3xl text-black mt-2">AI Coaching: Salary Negotiation</p>
          </div>
          <div className="relative bg-[#F4ECD8] p-6 sm:p-8 border-2 border-gray-400 shadow-lg">
            <h3 className="font-mono text-center text-sm uppercase tracking-widest text-black mb-6 border-b border-dashed border-gray-400 pb-4">Transcript of AI Coaching Session</h3>
            <div className="space-y-6 text-lg text-gray-900">
              {[
                { speaker: 'YOU', text: 'My boss just rejected my raise request. He said "not the right time." How do I reframe this?' },
                { speaker: 'COACH', text: "First, don't react emotionally. That is what they expect. Your boss used a classic delay tactic. Use Frame Control: reposition the conversation from \"asking for a raise\" to \"aligning on your market value.\" Try this: \"I have been looking at what my role pays elsewhere, and I want to make sure we are aligned. Can we talk about how my compensation reflects the value I am delivering?\" Then pause. Let them respond first." },
                { speaker: 'YOU', text: 'What if he brings up budget constraints?' },
                { speaker: 'COACH', text: "Use Strategic Silence. After making your case, do not fill the silence. Let them sit with it. If they bring up budget, respond with: \"I understand. What would need to happen for us to revisit this in 90 days?\" This keeps the door open, puts the ball in their court, and creates a measurable timeline they have to commit to." },
              ].map((msg, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-4 items-start">
                  <div className="font-mono text-sm font-bold md:font-normal pt-1">{msg.speaker}:</div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 9. INFLUENCE DECODER (salary context) ══ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <section className="relative bg-[#EDE3D0] rounded-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">INFLUENCE DECODER</h2>
            <p className="text-3xl mt-2 text-black">Salary Negotiation Decoded</p>
            <p className="text-gray-600 mt-2 text-base">Every salary conversation has hidden tactics. Our AI flags them in real time.</p>
          </div>
          <div className="relative border-2 border-gray-400 bg-[#F4ECD8] p-6 sm:p-8 shadow-lg max-w-4xl mx-auto">
            <div className="space-y-6 text-lg text-gray-900">
              {[
                { speaker: 'EMPLOYEE', text: "I'd like to discuss my compensation. I've been here two years and taken on significantly more responsibility." },
                { speaker: 'MANAGER', text: "I really appreciate everything you do. You're one of our top performers. But the budget is locked until next fiscal year.", annotation: 'FLATTERY SHIELD + BUDGET DEFLECTION' },
                { speaker: 'EMPLOYEE', text: "I understand. What if we set specific targets for Q3 that would justify an adjustment?" },
                { speaker: 'MANAGER', text: "That's fair. Let me think about what those targets would look like.", annotation: 'FRAME ACCEPTED' },
              ].map((msg, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4 items-start">
                  <div className="font-mono text-sm pt-1 font-bold md:font-normal">{msg.speaker}:</div>
                  <div>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.annotation && (
                      <div className="flex items-center mt-2">
                        <div className="w-8 border-t-2 border-dashed border-red-500" />
                        <div className="bg-red-500 text-white text-xs font-mono uppercase px-2 py-1 rounded-sm shadow-md">{msg.annotation}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center mt-12 font-mono text-xs text-gray-500 uppercase tracking-wider">Analysis generated by Shadow Persuasion Conversation Analyzer</p>
          </div>
        </section>
      </div>

      {/* ══ 10. CONVERSATION BREAKDOWN (salary examples) ══ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">REAL EXAMPLES</h2>
            <p className="text-3xl text-black">What Your Boss Really Means</p>
          </div>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-6 mb-6 bg-[#EDE3D0] border-2 border-gray-400 p-4">
              <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">Original Message</div>
              <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">AI Breakdown</div>
              <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">Recommended Response</div>
              <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">Patterns</div>
            </div>
            <div className="space-y-2">
              {[
                { original: '"We don\'t have the budget for a raise right now"', breakdown: 'Deflection tactic using organizational constraints as a shield. Often means "I have not been given a compelling enough reason to fight for your raise."', response: '"I understand. What specific milestones would need to be hit for us to revisit compensation in Q3?"', patterns: ['BUDGET SHIELD', 'DEFLECTION'] },
                { original: '"You know how much I value you here"', breakdown: 'Flattery before rejection. Designed to make you feel appreciated so you feel guilty pushing back.', response: '"I appreciate that, and because the value is mutual, I want to make sure my compensation reflects it. What would need to change?"', patterns: ['FLATTERY SHIELD', 'GUILT SETUP'] },
                { original: '"Let\'s revisit this after the next review cycle"', breakdown: 'Classic delay tactic. Pushes the conversation to a vague future date with no commitment.', response: '"Great. Can we put a specific date on the calendar and agree on the metrics you would need to see?"', patterns: ['FUTURE FAKING', 'DELAY TACTIC'] },
              ].map((conv, i) => (
                <div key={i} className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-6 border-2 border-gray-400 p-4 bg-[#F4ECD8] hover:bg-[#EDE3D0] transition-colors">
                  <div className="text-sm"><p className="italic text-gray-800">{conv.original}</p></div>
                  <div className="text-sm"><p className="text-gray-700 leading-relaxed">{conv.breakdown}</p></div>
                  <div className="text-sm"><p className="text-black font-bold leading-relaxed">{conv.response}</p></div>
                  <div className="flex flex-col gap-1">
                    {conv.patterns.map((p) => (<span key={p} className="px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded bg-red-900 text-red-200 border-red-700">{p}</span>))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-6">
            {[
              { original: '"We don\'t have the budget for a raise right now"', breakdown: 'Deflection tactic using organizational constraints as a shield. Often means "I have not been given a compelling enough reason to fight for your raise."', response: '"I understand. What specific milestones would need to be hit for us to revisit compensation in Q3?"', patterns: ['BUDGET SHIELD', 'DEFLECTION'] },
              { original: '"You know how much I value you here"', breakdown: 'Flattery before rejection. Designed to make you feel appreciated so you feel guilty pushing back.', response: '"I appreciate that, and because the value is mutual, I want to make sure my compensation reflects it. What would need to change?"', patterns: ['FLATTERY SHIELD', 'GUILT SETUP'] },
              { original: '"Let\'s revisit this after the next review cycle"', breakdown: 'Classic delay tactic. Pushes the conversation to a vague future date with no commitment.', response: '"Great. Can we put a specific date on the calendar and agree on the metrics you would need to see?"', patterns: ['FUTURE FAKING', 'DELAY TACTIC'] },
            ].map((conv, i) => (
              <div key={i} className="border-2 border-gray-400 p-6 space-y-4 bg-[#F4ECD8]">
                <div><p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-1">Original Message</p><p className="italic text-gray-800">{conv.original}</p></div>
                <div><p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-1">AI Breakdown</p><p className="text-gray-700 leading-relaxed">{conv.breakdown}</p></div>
                <div><p className="font-mono text-xs uppercase tracking-wider text-gray-500 mb-1">Recommended Response</p><p className="text-black font-bold leading-relaxed">{conv.response}</p></div>
                <div className="flex flex-wrap gap-1">{conv.patterns.map((p) => (<span key={p} className="px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded bg-red-900 text-red-200 border-red-700">{p}</span>))}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 11. WHY NOT CHATGPT ══ */}
      <section className="bg-[#0D0D0D] py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-3">THE KNOWLEDGE GAP</h2>
            <p className="text-3xl md:text-4xl font-bold text-[#F4ECD8] mb-4">&ldquo;Can&apos;t I Just Ask ChatGPT How to Negotiate?&rdquo;</p>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">You could. But ChatGPT does not know what your boss actually meant. We do.</p>
          </div>
          <div className="bg-[#1A1A1A] border-l-4 border-[#D4A017] rounded-r-xl p-6 md:p-8 mb-10">
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-0.5 w-12 h-12 rounded-lg bg-[#D4A017]/10 flex items-center justify-center"><BookOpen className="h-6 w-6 text-[#D4A017]" /></div>
              <div>
                <h3 className="text-lg font-bold text-[#F4ECD8] mb-3">Proprietary Negotiation Intelligence</h3>
                <p className="text-gray-300 leading-relaxed mb-3">Our system draws from a continuously expanding library that general AI has never been trained on:</p>
                <ul className="space-y-1.5 text-gray-400">
                  <li className="flex items-start gap-2"><span className="text-[#D4A017] mt-0.5">&#9670;</span>Salary negotiation frameworks from behavioral economics research</li>
                  <li className="flex items-start gap-2"><span className="text-[#D4A017] mt-0.5">&#9670;</span>Counter-tactics for every common manager objection pattern</li>
                  <li className="flex items-start gap-2"><span className="text-[#D4A017] mt-0.5">&#9670;</span>700+ influence techniques mapped to salary-specific scenarios</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { left: 'Gives generic salary advice', right: 'Analyzes what YOUR boss specifically said and why' },
              { left: 'No knowledge of manipulation tactics', right: 'Detects delay, deflection, flattery shields, and guilt tripping' },
              { left: 'Cannot practice with you', right: 'AI role-play where you practice the conversation before the real meeting' },
              { left: 'Forgets everything after each chat', right: 'Tracks your negotiation history, style, and progress over time' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4 flex items-center gap-3">
                  <span className="text-red-400 text-lg shrink-0">&#x2715;</span>
                  <p className="text-gray-400 text-sm md:text-base">{row.left}</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#D4A017]/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-green-400 text-lg shrink-0">&#x2713;</span>
                  <p className="text-[#F4ECD8] text-sm md:text-base">{row.right}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider text="// THE RESULTS SPEAK FOR THEMSELVES //" />

      {/* ══ 12. EVIDENCE (salary metrics — matches homepage design) ══ */}
      <section className="relative px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-white">
              Before &amp; After: Salary Negotiation Results
            </h2>
            <div className="w-24 h-1 bg-[#D4A017] mt-4 mx-auto" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-base md:text-lg text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#D4A017]">
                  <th className="p-3 font-mono uppercase text-sm text-[#D4A017]">Metric</th>
                  <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">Before Protocol</th>
                  <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">After Protocol</th>
                  <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">&Delta; Change</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: 'Salary Negotiation Success Rate', before: '1 in 4', after: '3 in 4', change: '+200%' },
                  { metric: 'Confidence Going Into the Conversation', before: '4.2/10', after: '8.7/10', change: '+107%' },
                  { metric: 'Average Raise Achieved', before: '$2,100', after: '$14,800', change: '+605%' },
                  { metric: 'Time to Prepare Counter-Strategy', before: '2+ hours', after: '< 3 min', change: '-97%' },
                  { metric: 'Ability to Detect Boss Manipulation Tactics', before: '18%', after: '89%', change: '+394%' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="p-3">{row.metric}</td>
                    <td className="p-3 text-center">{row.before}</td>
                    <td className="p-3 text-center">{row.after}</td>
                    <td className="p-3 font-bold text-center text-[#D4A017]">{row.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-8 text-sm text-amber-500/50 font-mono">Based on self-reported member data. Individual results vary.</p>
        </div>
      </section>

      {/* ══ 13. TESTIMONIALS ══ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">MEMBER TESTIMONIALS</h2>
        <p className="text-3xl mt-1 mb-12">Members Who Negotiated and Won</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'SARAH K.', title: 'Tech Executive', quote: "I was getting passed over for promotion despite outperforming my peers. The Conversation Analyzer showed me that my boss was using delay tactics every time I brought up advancement. The AI gave me a specific framework to reframe the conversation, and I got promoted within 6 weeks." },
            { name: 'ALEX M.', title: 'Sales Professional', quote: "I used to wing every salary conversation. Shadow Persuasion taught me that negotiating is not about pressure, it is about understanding what the other person needs and framing your ask around that. I got a $22K raise using the anchoring technique alone." },
            { name: 'MARK T.', title: 'Software Engineer', quote: "I used the exact script Shadow Persuasion gave me and got a $28K raise. My boss literally said \"I did not realize the gap was that significant.\" The anchoring technique changed everything. I only wish I had found this before my last two annual reviews." },
          ].map((t, i) => (
            <div key={i} className="bg-[#EDE3D0] border-2 border-gray-400 p-6 relative">
              <span className="text-5xl leading-none text-amber-600/40 font-serif select-none">&ldquo;</span>
              <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold mb-1">[{t.name}], {t.title}</h3>
              <p className="text-base text-[#1A1A1A] leading-relaxed mt-3">&ldquo;{t.quote}&rdquo;</p>
              <div className="absolute bottom-4 right-4 text-red-700 text-sm font-bold border-2 border-red-700 p-1.5 -rotate-6 opacity-70 font-mono">VERIFIED</div>
            </div>
          ))}
        </div>
      </div>

      <MidPageCTA headline="Ready to Get the Salary You Deserve?" />

      {/* ══ TECHNIQUE PREVIEW (fanned layout matching homepage) ══ */}
      <TechniquePreview />

      {/* ══ 14. COMPARISON (matches homepage design) ══ */}
      <section className="bg-[#0D0D0D] w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-400">COMPARISON</h2>
            <p className="text-3xl mt-2 text-white">Why Shadow Persuasion</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-gray-400 bg-[#F4ECD8] shadow-lg p-6 sm:p-8">
            <div className="border border-dashed border-gray-400 p-6">
              <h3 className="text-2xl text-center font-bold">THE ALTERNATIVES</h3>
              <p className="text-center font-mono text-lg text-gray-600 mb-6">&nbsp;</p>
              <ul className="space-y-4">
                {['Google "how to ask for a raise" (generic advice)', 'Read a negotiation book ($20, no feedback)', 'Online courses ($500-$2,000, no AI feedback)', 'Hire a career coach ($200-500/hour)', 'ChatGPT (generic AI, does not know your boss)', 'Wing it and hope for the best'].map((f) => (
                  <li key={f} className="flex justify-between items-center text-lg"><span>{f}</span><span className="text-red-500 font-bold text-xl">&#x2715;</span></li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-amber-500 p-6 bg-[#fffef7] shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-mono text-xs uppercase px-2 py-1 font-bold">RECOMMENDED</div>
              <h3 className="text-2xl text-center font-bold text-amber-900">SHADOW PERSUASION MEMBER</h3>
              <p className="text-center font-mono text-lg mb-6"><span className="text-amber-700 font-bold">$99/MO</span></p>
              <ul className="space-y-4">
                {["Analyzes YOUR boss's exact words and tactics", 'Word-for-word counter-scripts for your situation', 'AI role-play to practice before the real meeting', '700+ negotiation techniques from proprietary research', 'Voice Profile so you sound like you, not a script', '24/7 AI coach for every conversation that matters', 'Persuasion Score and progress tracking', 'Daily field missions with AI grading'].map((f) => (
                  <li key={f} className="flex justify-between items-center text-lg"><span>{f}</span><span className="text-green-600 font-bold">&#10003;</span></li>
                ))}
              </ul>
              <a href="/login" className="block w-full mt-8 bg-black text-white font-mono uppercase px-4 py-3 text-lg text-center hover:bg-amber-700 transition-colors duration-300">START TRAINING NOW</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 15. GUARANTEE ══ */}
      <div className="flex justify-center px-6 py-12 md:py-16">
        <div className="max-w-2xl w-full bg-[#EDE3D0] border-2 border-[#D4A017] rounded-2xl px-8 py-10 md:px-12 md:py-14 text-center">
          <div className="text-5xl mb-4">&#x1f6e1;&#xfe0f;</div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-base md:text-lg text-[#1A1A1A]/80 leading-relaxed mb-6">Use Shadow Persuasion for your next salary conversation. If you don&apos;t feel significantly more prepared and confident, email us within 30 days for a full refund. No questions asked.</p>
          <p className="text-sm text-[#1A1A1A]/60">No contracts. No cancellation fees. Cancel anytime.</p>
        </div>
      </div>

      {/* ══ 16. FAQ ══ */}
      <section className="bg-[#F4ECD8] py-20 px-6 md:px-12 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#0D0D0D]">Salary Negotiation FAQ</h2>
            <div className="w-16 h-0.5 bg-[#D4A017] mt-4 mx-auto" />
          </div>
          <div className="bg-[#efe5cc] border border-[#D4A017]/30 rounded-lg overflow-hidden">
            <AccordionItem question="What if my boss already said no?">
              <p>That is actually the ideal time to use Shadow Persuasion. Upload exactly what they said and the AI will identify what tactics they used and give you a counter-strategy. Most &quot;no&quot; responses are delay tactics that can be reframed.</p>
            </AccordionItem>
            <AccordionItem question="Can I practice the conversation before the real meeting?">
              <p>Yes. The Training Arena lets you role-play a salary negotiation with an AI that plays your boss. It responds realistically, pushes back, and uses common manager objections. You get real-time coaching scores after each response.</p>
            </AccordionItem>
            <AccordionItem question="What if I don't know my market rate?">
              <p>The AI Strategic Coach helps you research and frame your market rate as part of your negotiation strategy. It is not just about knowing the number. It is about how you anchor and present it.</p>
            </AccordionItem>
            <AccordionItem question="Will I sound scripted?">
              <p>No. The Voice Profile feature learns YOUR natural communication style from samples you provide. Every script is adapted to sound like you, not a template.</p>
            </AccordionItem>
            <AccordionItem question="Is my conversation data private?">
              <p>Yes. All data is encrypted. We never share, sell, or use your conversations for training. You can delete your data at any time.</p>
            </AccordionItem>
            <AccordionItem question="Is $99/month worth it for a salary negotiation?">
              <p>Members report salary increases of $5,000 to $50,000+. A single successful negotiation pays for years of membership. And the system is not just for salary. You get access to all 121 use cases across career, business, relationships, and more.</p>
            </AccordionItem>
          </div>
        </div>
      </section>

      {/* ══ 17. FINAL CTA ══ */}
      <section className="bg-[#F4ECD8] px-6 md:px-12 py-10 md:py-14">
        <div className="max-w-md mx-auto text-center border-4 border-black p-8">
          <h2 className="text-3xl font-bold mb-4">Get Your Raise</h2>
          <p className="text-lg mb-4">$99/month (less than $3.30/day)</p>
          <ul className="space-y-3 text-lg mb-8 text-left">
            {['AI Conversation Analyzer for salary talks', 'Word-for-word counter-scripts', 'AI role-play to practice before the meeting', '700+ negotiation techniques', '30-day money-back guarantee'].map((item) => (
              <li key={item} className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-700 mt-0.5 shrink-0" /><span>{item}</span></li>
            ))}
          </ul>
          <a href="/login" className="block w-full bg-black text-white py-4 px-8 text-xl font-bold hover:bg-gray-800 transition-colors">GET YOUR COUNTER-STRATEGY</a>
          <p className="text-center mt-4 text-xs text-gray-600">Cancel anytime. No contracts. Results in your first week or your money back.</p>
          <div className="border-t-2 border-black py-1 mt-8 text-sm text-center"><p>END OF DOCUMENT</p></div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-[#0D0D0D] border-t border-white/10 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Home</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms and Conditions</Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-4">
            <img src="/logo-dark.png" alt="Shadow Persuasion" className="w-28" />
            <p className="text-xs text-gray-600 text-center">Copyright &copy; {new Date().getFullYear()} Shadow Persuasion. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ═══════════════════════════════════════════════
   Technique Preview (fanned cards, matches homepage)
   ═══════════════════════════════════════════════ */

const salaryTechniques = [
  { name: 'ANCHORING', description: 'Set the reference point in any negotiation to frame what is reasonable. State your target number first.', effectiveness: 9, context: 'Salary, Pricing' },
  { name: 'STRATEGIC SILENCE', description: 'After making your case, stop talking. Let them sit with it. Silence creates pressure to respond.', effectiveness: 9, context: 'Negotiation, Raises' },
  { name: 'FRAME CONTROL', description: 'Reposition the conversation from "asking for a raise" to "aligning on market value."', effectiveness: 10, context: 'All Negotiations' },
  { name: 'SCARCITY FRAMING', description: 'Communicate your market options without threatening. "I am not looking to leave, but..."', effectiveness: 8, context: 'Salary, Offers' },
  { name: 'PATTERN INTERRUPT', description: 'When your boss uses a familiar deflection, break the script with an unexpected reframe.', effectiveness: 8, context: 'Objection Handling' },
  { name: 'SOCIAL PROOF', description: 'Reference market data, peer compensation, and industry benchmarks to validate your ask.', effectiveness: 7, context: 'Salary Research' },
];

function TechniquePreview() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const mid = (salaryTechniques.length - 1) / 2;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
      <section className="relative py-16">
        <div className="text-left mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">TECHNIQUE PREVIEW</h2>
          <p className="text-3xl mt-2">Negotiation Techniques from the Library</p>
        </div>

        {/* Mobile: swipeable horizontal scroll */}
        <div
          className="flex lg:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {salaryTechniques.map((pattern, index) => (
            <div key={index} className="relative min-w-[260px] w-[260px] h-[220px] flex-shrink-0 snap-center">
              <div className="bg-[#F4ECD8] border-2 border-gray-400 shadow-xl rounded-sm p-5 flex flex-col justify-between h-full">
                <div className="absolute top-2 right-2 text-xs font-mono text-gray-400">{index + 1}/{salaryTechniques.length}</div>
                <div>
                  <h3 className="text-xl font-bold text-black">{pattern.name}</h3>
                  <p className="text-sm text-gray-700 leading-snug mt-2">{pattern.description}</p>
                </div>
                <div className="mt-3">
                  <div className="font-mono text-xs text-gray-500">{pattern.context}</div>
                  <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                    <div>Effectiveness:</div>
                    <div className="flex items-center gap-0.5">{Array.from({ length: 10 }).map((_, i) => (<div key={i} className={`h-3 w-1.5 ${i < pattern.effectiveness ? 'bg-black' : 'bg-gray-300'}`} />))}</div>
                    <div>{pattern.effectiveness}/10</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: fanned-out overlapping cards */}
        <div className="relative hidden lg:block h-[420px] max-w-6xl mx-auto">
          {salaryTechniques.map((pattern, index) => {
            const offset = index - mid;
            const xSpread = offset * 140;
            const yDip = Math.abs(offset) * 12;
            const rotation = offset * 3;
            const isHovered = hoveredCard === index;
            const zBase = index + 10;

            return (
              <motion.div
                key={index}
                className="absolute left-1/2 top-8 w-[260px] h-[250px] cursor-pointer"
                style={{
                  zIndex: isHovered ? 50 : zBase,
                  x: `calc(-50% + ${xSpread}px)`,
                  y: yDip,
                  rotate: rotation,
                }}
                whileHover={{
                  y: -20,
                  scale: 1.08,
                  rotate: 0,
                  transition: { duration: 0.2 },
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <div className="bg-[#F4ECD8] border-2 border-gray-400 shadow-xl rounded-sm p-5 flex flex-col justify-between h-full">
                  <div className="absolute top-2 right-2 text-xs font-mono text-gray-400">{index + 1}/{salaryTechniques.length}</div>
                  <div>
                    <h3 className="text-xl font-bold text-black">{pattern.name}</h3>
                    <p className="text-sm text-gray-700 leading-snug mt-2">{pattern.description}</p>
                  </div>
                  <div className="mt-3">
                    <div className="font-mono text-xs text-gray-500">{pattern.context}</div>
                    <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                      <div>Effectiveness:</div>
                      <div className="flex items-center gap-0.5">{Array.from({ length: 10 }).map((_, i) => (<div key={i} className={`h-3 w-1.5 ${i < pattern.effectiveness ? 'bg-black' : 'bg-gray-300'}`} />))}</div>
                      <div>{pattern.effectiveness}/10</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="font-mono text-sm text-gray-500 uppercase tracking-wider">[700+ Techniques Available Inside the Full Library]</p>
        </div>
      </section>
    </div>
  );
}
