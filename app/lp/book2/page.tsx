'use client';

/* ════════════════════════════════════════════════════════════
   /lp/book2 — Shadow Persuasion Front-End Funnel (V2)
   Follows full Alen Sultanic AC template flow with all Tier 1
   + Tier 2 additions. Includes Old Way vs New Way graphics.
   ════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { Special_Elite } from 'next/font/google';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Shield,
  AlertTriangle,
  ChevronDown,
  Lock,
  Zap,
  Briefcase,
  Eye,
  Sparkles,
  X,
  Smile,
  Frown,
} from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

/* ─────────────── Reusable yellow highlighter span ─────────────── */
const HL = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{ background: 'rgba(212, 160, 23, 0.30)', padding: '0 4px', borderRadius: 2 }}
    className="font-semibold"
  >
    {children}
  </span>
);

/* ─────────────── Reusable: Document divider ─────────────── */
function DocDivider({ text }: { text?: string }) {
  return (
    <div className="border-t-2 border-b-2 border-[#5C3A1E] py-1 my-12 text-xs text-center text-[#6B5B3E] tracking-[0.25em] uppercase">
      <p>{text || 'CLASSIFICATION: PUBLIC DROP'}</p>
    </div>
  );
}

/* ─────────────── Order CTA box ─────────────── */
function OrderBox({ small = false, bgVariant = 'cream' }: { small?: boolean; bgVariant?: 'cream' | 'dark' }) {
  const isDark = bgVariant === 'dark';
  return (
    <div
      className={`mx-auto max-w-2xl border-4 ${
        isDark ? 'border-[#D4A017] bg-[#1A1A1A] text-[#F4ECD8]' : 'border-black bg-[#F4ECD8] text-[#1A1A1A]'
      } p-6 md:p-10 text-center shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]`}
    >
      <p className={`text-xs font-mono uppercase tracking-[0.25em] ${isDark ? 'text-[#D4A017]' : 'text-[#5C3A1E]'} mb-3`}>
        ⏱  This Offer Expires Soon. Limited Time.
      </p>
      <div className="flex items-end justify-center gap-3 mb-2">
        <span className={`text-2xl line-through ${isDark ? 'text-[#F4ECD8]/40' : 'text-[#5C3A1E]/60'}`}>$47</span>
        <span className={`text-6xl md:text-7xl font-black ${isDark ? 'text-[#D4A017]' : 'text-black'}`}>$7</span>
      </div>
      <p className={`text-sm ${isDark ? 'text-[#D4A017]' : 'text-green-700'} font-bold uppercase tracking-wider mb-6`}>
        Save $40 Today
      </p>
      <p className={`text-base mb-6 ${isDark ? 'text-[#F4ECD8]/80' : 'text-[#3B2E1A]'}`}>
        Download the eBook for <span className="line-through">$47</span> just <strong>$7</strong>.<br />
        Delivered instantly. Start reading in the next 2 minutes.
      </p>
      <a
        href="/checkout/book"
        className={`inline-flex items-center gap-2 ${
          isDark
            ? 'bg-[#D4A017] hover:bg-[#C4901A] text-black'
            : 'bg-black hover:bg-[#1A1A1A] text-[#F4ECD8]'
        } font-mono uppercase font-bold text-base md:text-lg px-8 md:px-10 py-4 tracking-wider transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]`}
      >
        Download eBook Now
        <ArrowRight className="h-5 w-5" />
      </a>
      {!small && (
        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs ${isDark ? 'text-[#F4ECD8]/60' : 'text-[#5C3A1E]'}`}>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 30-day money-back</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant delivery</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Testimonial card ─────────────── */
function Testimonial({
  name,
  result,
  quote,
  hidden,
}: {
  name: string;
  result: string;
  quote: string;
  hidden: string;
}) {
  return (
    <div className="bg-white border-2 border-[#5C3A1E]/30 p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,0.10)] relative">
      <div className="absolute -top-3 left-6 bg-[#D4A017] text-black px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold">
        Operator Report
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5C3A1E] to-[#1A1A1A] flex items-center justify-center text-[#F4ECD8] font-mono font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-mono font-bold text-[#1A1A1A]">{name}</p>
          <p className="text-xs text-[#5C3A1E] uppercase tracking-wide">{result}</p>
        </div>
      </div>
      <p className="text-sm md:text-base leading-relaxed text-[#1A1A1A] mb-3 italic">&ldquo;{quote}&rdquo;</p>
      <div className="border-t border-[#5C3A1E]/20 pt-3 mt-3">
        <p className="text-xs text-[#5C3A1E] uppercase tracking-wider font-bold mb-1">Hidden Benefit:</p>
        <p className="text-sm text-[#3B2E1A]">{hidden}</p>
      </div>
    </div>
  );
}

/* ─────────────── Bullet for "what you'll discover" ─────────────── */
function DiscoveryBullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#5C3A1E]/15 last:border-b-0">
      <CheckCircle className="h-5 w-5 text-[#D4A017] shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-base md:text-lg leading-relaxed text-[#1A1A1A]">{children}</p>
      </div>
    </div>
  );
}

/* ─────────────── Bonus card ─────────────── */
function BonusCard({
  num,
  title,
  description,
  value,
  icon: Icon,
}: {
  num: string;
  title: string;
  description: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white border-2 border-black relative shadow-[6px_6px_0_0_#D4A017]">
      <div className="absolute -top-3 -left-3 bg-[#D4A017] text-black px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold border-2 border-black">
        Free Bonus #{num}
      </div>
      <div className="p-6 md:p-8 flex gap-5 items-start">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F4ECD8] border-2 border-black flex items-center justify-center shrink-0">
          <Icon className="h-8 w-8 md:h-10 md:w-10 text-[#D4A017]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">{title}</h3>
          <p className="text-sm md:text-base text-[#3B2E1A] leading-relaxed mb-3">{description}</p>
          <p className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E]">
            Value: <span className="line-through">{value}</span> <span className="text-[#D4A017] font-bold">FREE</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── FAQ Accordion ─────────────── */
function FAQItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#5C3A1E]/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left py-5 group"
      >
        <span className="text-base md:text-lg font-bold text-[#1A1A1A] group-hover:text-[#D4A017] transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[#D4A017] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-5 text-base leading-relaxed text-[#3B2E1A]">{a}</div>}
    </div>
  );
}

/* ─────────────── Old Way vs New Way side-by-side graphic (Graphic #1) ─────────────── */
function OldVsNewGraphic() {
  const oldSteps = [
    'Read another persuasion book',
    'Memorize techniques (anchoring, mirroring, labeling)',
    'Try to remember them mid-conversation',
    'Deploy a technique awkwardly',
    'Watch their face change as the detector fires',
    'Lose the conversation. Buy another book.',
  ];
  const newSteps = [
    'Disable The Detector',
    'Plant The Conclusion',
    'Shift The Frame',
    'Lock In Without Closing',
  ];

  return (
    <div className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {/* OLD WAY */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#8B0000]/10 border-2 border-[#8B0000] flex items-center justify-center shrink-0">
              <X className="h-6 w-6 text-[#8B0000]" strokeWidth={3} />
            </div>
            <div className="bg-[#F4E9D0] border-2 border-[#8B0000]/50 px-5 py-3 flex-1">
              <p className="font-bold uppercase tracking-wider text-[#1A1A1A]">The Old Way</p>
            </div>
          </div>
          <div className="space-y-3">
            {oldSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8B0000]/10 border-2 border-[#8B0000] flex items-center justify-center shrink-0">
                  <X className="h-4 w-4 text-[#8B0000]" strokeWidth={3} />
                </div>
                <div className="bg-[#F4E9D0] border border-[#8B0000]/30 px-4 py-2.5 flex-1 text-sm md:text-base text-[#1A1A1A]">
                  Step {i + 1}: {step}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-[#8B0000]/20 border-2 border-[#8B0000] flex items-center justify-center shrink-0">
                <Frown className="h-4 w-4 text-[#8B0000]" strokeWidth={2.5} />
              </div>
              <div className="bg-[#F4E9D0] border-2 border-[#8B0000]/60 px-4 py-3 flex-1 font-bold text-[#8B0000]">
                End Result: Trust Dropped. Relationship Damaged. No Outcome.
              </div>
            </div>
          </div>
        </div>

        {/* NEW WAY */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-black border-2 border-[#D4A017] px-5 py-3 flex-1">
              <p className="font-bold uppercase tracking-wider text-[#D4A017]">The <u>New</u> Way</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D4A017]/20 border-2 border-[#D4A017] flex items-center justify-center shrink-0">
              <Smile className="h-6 w-6 text-[#D4A017]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            {newSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-black border-2 border-[#D4A017] px-4 py-2.5 flex-1 text-sm md:text-base text-[#F4ECD8] font-bold">
                  Easy Step {i + 1}: {step}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#D4A017]/20 border-2 border-[#D4A017] flex items-center justify-center shrink-0">
                  <Smile className="h-4 w-4 text-[#D4A017]" strokeWidth={2.5} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <div className="bg-black border-2 border-[#D4A017] px-4 py-3 flex-1 font-bold text-[#D4A017]">
                Desired Result: They Said Yes. Relationship Intact. You Look Like The Reasonable One.
              </div>
              <div className="w-8 h-8 rounded-full bg-[#D4A017] border-2 border-black flex items-center justify-center shrink-0">
                <Smile className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── New Way flow graphic (Graphic #2 - vertical arrows) ─────────────── */
function NewWayFlowGraphic() {
  const steps = [
    'Disable The Detector',
    'Plant The Conclusion',
    'Shift The Frame',
    'Lock In Without Closing',
  ];
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-2 justify-center">
        <div className="bg-black border-2 border-[#D4A017] px-8 py-3">
          <p className="font-bold uppercase tracking-wider text-[#D4A017] text-lg">The <u>New</u> Way</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#D4A017]/20 border-2 border-[#D4A017] flex items-center justify-center">
          <Smile className="h-6 w-6 text-[#D4A017]" strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-center text-sm text-[#5C3A1E] mb-6 uppercase tracking-wider">The Easy Way</p>

      {steps.map((step, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 justify-center">
            <div className="bg-black border-2 border-[#D4A017] px-6 py-3 w-64 text-center">
              <p className="font-bold text-[#F4ECD8] text-sm md:text-base">Easy Step {i + 1}: {step}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#D4A017]/20 border-2 border-[#D4A017] flex items-center justify-center shrink-0">
              <Smile className="h-4 w-4 text-[#D4A017]" strokeWidth={2.5} />
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-start pl-[calc(50%-8rem-1rem)] my-1">
              <ArrowDown className="h-6 w-6 text-[#5C3A1E]" strokeWidth={2} />
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-start pl-[calc(50%-8rem-1rem)] my-1">
        <ArrowDown className="h-6 w-6 text-[#5C3A1E]" strokeWidth={2} />
      </div>

      <div className="flex items-center gap-3 justify-center">
        <div className="bg-[#D4A017] border-2 border-black px-6 py-3 w-64 text-center">
          <p className="font-bold text-black text-sm md:text-base uppercase tracking-wider">Desired Result</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#D4A017] border-2 border-black flex items-center justify-center shrink-0">
          <Smile className="h-5 w-5 text-black" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */

export default function BookFunnelPageV2() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] overflow-x-hidden`}>
      {/* ═════════ TOP BANNER ═════════ */}
      <div className="bg-black text-[#F4ECD8] py-2.5 text-center text-xs md:text-sm font-mono uppercase tracking-wider">
        ⚠  Version 2 · Limited Time: Get The Field Manual For <span className="text-[#D4A017]">$7</span> (Normally $47).  <a href="/checkout/book" className="underline hover:text-[#D4A017]">Claim Now →</a>
      </div>

      {/* ═════════ 1. HERO ═════════ */}
      <section className="relative px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <img src="/logo.png" alt="Shadow Persuasion" className="w-32 md:w-44 mx-auto mb-8 dark:hidden" />

          <p className="text-lg md:text-2xl lg:text-3xl text-[#5C3A1E] font-bold uppercase tracking-wider leading-snug mb-8 max-w-4xl mx-auto">
            For Anyone Who&apos;s Ever Walked Out Of A Conversation Wondering Why They Just Agreed To Something They Didn&apos;t Want To Agree To
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
            New Field Manual Reveals The{' '}
            <span className="text-[#D4A017]">47 Counterintuitive Conversation Tactics</span>{' '}
            That Make People Say <HL>Yes Without Realizing Why</HL>
          </h1>

          <p className="text-lg md:text-xl text-[#3B2E1A] max-w-3xl mx-auto leading-relaxed mb-10">
            While bypassing their built-in &ldquo;persuasion detector,&rdquo; eliminating the awkwardness of memorized scripts,
            and working in real everyday conversations. Not just pitches and negotiations.
          </p>

          {/* Book mockup */}
          <div className="my-12 flex justify-center">
            <div className="relative">
              <div className="w-56 md:w-72 h-72 md:h-96 bg-gradient-to-br from-[#1A1A1A] via-[#2A1F0E] to-[#0A0A0A] border-4 border-[#D4A017] shadow-[12px_12px_0_0_rgba(0,0,0,0.4)] flex flex-col justify-between p-6 md:p-8 transform -rotate-2">
                <div>
                  <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#D4A017] mb-3">
                    Shadow Persuasion
                  </p>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#F4ECD8] leading-tight">
                    The 47 Counter-<br/>intuitive Conversation Tactics
                  </h2>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#F4ECD8]/70 italic mb-2">
                    That make people say yes without realizing why
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#D4A017]">
                    [Field Manual]
                  </p>
                </div>
                <div className="absolute -top-4 -right-4 bg-[#D4A017] text-black px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold border-2 border-black rotate-12">
                  $7
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <a
              href="/checkout/book"
              className="inline-flex items-center bg-black text-[#F4ECD8] font-mono uppercase font-bold text-lg md:text-xl px-10 md:px-14 py-5 tracking-wider hover:bg-[#1A1A1A] transition-all shadow-[6px_6px_0_0_#D4A017] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#D4A017]"
            >
              Get The Book For $7 <ArrowRight className="ml-3 h-6 w-6" />
            </a>
            <p className="text-sm text-[#5C3A1E]">
              <span className="font-bold">$47</span> <span className="line-through opacity-60">→</span> <span className="font-bold text-[#1A1A1A]">$7 today</span> · 30-day money-back guarantee · Instant download
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 2. WHAT IS SHADOW PERSUASION? ═════════ */}
      <DocDivider text="// WHAT IS SHADOW PERSUASION? //" />

      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-6">
              What Is <span className="text-[#D4A017]">Shadow Persuasion</span>?
            </h2>
            <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
              <p>
                <strong>Shadow Persuasion</strong> is a counterintuitive approach to influence that lets you win
                the conversations that actually decide your life. Salary negotiations. Fights with your partner.
                Arguments with teenagers. Custody mediation. Reconnecting with estranged family. Sales calls.
                Job interviews. Conversations with manipulators you cannot cut out of your life.
              </p>
              <p>
                You win these conversations <HL>without the other person ever realizing they were being persuaded.</HL>
              </p>
              <p>
                We do it by deploying <strong>47 below-the-radar tactics</strong> that bypass the brain&apos;s
                built-in &ldquo;persuasion detector.&rdquo; That is the defense mechanism firing in your listener&apos;s head
                the second they sense you are trying to influence them. It is also the reason why 90% of the techniques
                you read about in every other influence book quietly stop working the moment you deploy them.
              </p>
              <p>
                And as a result, this frees you up to have the conversations you actually want to have. Honest ones.
                Productive ones. Ones where both of you walk out feeling good. <strong>This is Shadow Persuasion.</strong>
              </p>
            </div>
          </div>
          <div className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.10)]">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#5C3A1E] border-b border-[#5C3A1E]/30 pb-3 mb-5">
              How It Works // 4 Parts
            </p>
            <ol className="space-y-4">
              {[
                { n: '01', title: 'Disable The Detector', body: 'In the first 30 seconds, turn off the listener\'s "I\'m being sold" alarm.' },
                { n: '02', title: 'Plant The Conclusion', body: 'Structure the conversation so they reach your outcome on their own.' },
                { n: '03', title: 'Shift The Frame', body: 'When you can\'t win the conversation being had, quietly change what it\'s about.' },
                { n: '04', title: 'Lock In Without Closing', body: 'Exit in a way that prevents reversal without any visible "closing" move.' },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="font-mono text-3xl font-black text-[#D4A017] leading-none">{s.n}</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-sm md:text-base text-[#1A1A1A]">{s.title}</p>
                    <p className="text-sm text-[#3B2E1A] mt-1">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ═════════ 3. SHADOW PERSUASION IS A SHORTCUT (compressed origin bridge) ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide mb-8 text-center">
          Shadow Persuasion Is A <span className="text-[#D4A017]">Shortcut</span>
        </h2>
        <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A] max-w-3xl mx-auto">
          <p>
            Before I built the Shadow Persuasion method, I was struggling with the conversations that actually mattered
            in my life for almost a decade, and I was on the verge of giving up on the idea that I could ever be good
            at this.
          </p>
          <p>
            I was <HL>reading every persuasion book on the shelf</HL>, memorizing every technique, running every
            framework, paying for $2,000 negotiation courses, watching YouTube gurus break down Chris Voss tapes frame
            by frame. I was doing everything the right way.
          </p>
          <p>
            And I was losing almost every conversation I walked into.
          </p>
          <p>
            Eventually, that forced me to question everything I had been taught, turn the entire model upside down,
            break all the rules about how influence was supposed to work, and free myself from the chains of
            &ldquo;visible&rdquo; persuasion.
          </p>
          <p>
            After eight years of recording, dissecting, and reverse-engineering over four hundred hours of my own
            high-stakes conversations, I finally reached the point where I was <HL>winning almost every important
            conversation I walked into</HL>. Raises. Custody. Family reconciliations. Contractor disputes. Sales calls.
            Hard talks with my wife.
          </p>
          <p className="font-bold">
            Now, you have the opportunity to duplicate the entire Shadow Persuasion system I built by downloading a
            $7 ebook called <em>Shadow Persuasion: The 47 Counterintuitive Conversation Tactics That Make People Say
            Yes Without Realizing Why</em>.
          </p>
          <p>Here&apos;s how it works:</p>
        </div>

        <div className="mt-10">
          <OldVsNewGraphic />
        </div>
      </section>

      {/* ═════════ 4. SECONDARY HEADLINE ═════════ */}
      <DocDivider text="// THE STORY //" />

      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
          Here&apos;s How I Went From <HL>Losing Almost Every Important Conversation</HL>{' '}In My Life, To Closing Almost Every One I Walk Into, By Ignoring The Common Wisdom, Breaking All The Rules, And Turning The Entire Persuasion Model Upside Down
        </h2>
        <p className="text-base md:text-lg text-[#3B2E1A] max-w-3xl mx-auto">
          This is something completely new, completely different, completely unlike anything you&apos;ve heard about
          influence before.
          <br />
          <em>Read the story below to discover Shadow Persuasion.</em>
        </p>
      </section>

      {/* ═════════ 5. THE LETTER ═════════ */}
      <section className="px-6 py-8 md:py-12 max-w-3xl mx-auto text-base md:text-lg leading-[1.85] text-[#1A1A1A] space-y-5">
        <p><strong>Dear Future Shadow Persuader,</strong></p>
        <p>
          <strong>From:</strong> The laptop of Nate Harlan<br />
          <strong>Re:</strong> Why every persuasion book in your house is making you worse at this (and the only counterintuitive way out)
        </p>

        <hr className="border-[#5C3A1E]/30 my-8" />

        <p>
          Would it surprise you to learn that I went from <HL>losing 90% of my important conversations</HL> to winning
          almost every one I walk into, using the information revealed in this field manual?
        </p>
        <p>Skeptical?</p>
        <p>You should be.</p>
        <p>After all, you can&apos;t believe everything you read on the internet :-)</p>

        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-wide pt-6">
          So Let Me Prove It To You
        </h3>
        <p>But first, read this disclaimer:</p>
        <p>
          I have the benefit of spending the last eight years recording, dissecting, and reverse-engineering over four
          hundred hours of my own high-stakes conversations. Sales calls. Negotiations. Hard conversations with my wife.
          Parent-teacher conferences. Custody mediation. An ugly three-month kitchen renovation dispute. Coaching sessions
          with my private clients. I have watched my own tactics land and fail at a level of detail most people never get.
        </p>
        <p>
          The average person who buys any &ldquo;how to&rdquo; information gets little to no results. I&apos;m using
          these references for example purposes only.
        </p>
        <p>
          Your results will vary and depend on many factors, including but not limited to your background, experience,
          and willingness to actually try the tactics in real conversations instead of just reading about them.
        </p>
        <p>
          All purchases entail risk as well as massive and consistent effort and action. If you&apos;re not willing to
          accept that, please <strong>DO NOT</strong> get this eBook.
        </p>
        <p>And yes, it took me time and energy to figure this out.</p>
        <p>With that said... let me jump right in and show you...</p>
      </section>

      {/* ═════════ 6. COUNTERINTUITIVE MODEL ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            And I Did It By Using A <HL>Completely Counterintuitive Model</HL>{' '}That I&apos;m About To Share With You On This Very Page
          </h2>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A] max-w-3xl mx-auto">
            <p>
              The same <strong>Shadow Persuasion</strong> model that{' '}
              <HL>1,200+ readers from every walk of life</HL> are now using to win the conversations they used to lose.
            </p>
            <p>
              And in turn, <strong>landing outcomes they had been chasing for years</strong> faster than they thought
              possible (one reader closed a $42K salary bump in a single 22-minute call after two years of &ldquo;we&apos;ll
              revisit it next quarter&rdquo;).
            </p>
            <p>
              All while <strong>never sounding &ldquo;salesy,&rdquo; never deploying a single memorized script, and
              never having anyone catch them &ldquo;running a technique&rdquo;</strong> on the other side of the table,
              so they can focus on the actual conversation instead of juggling frameworks in their head.
            </p>
            <p>
              And best of all, <HL>without ever having to read another single persuasion book again.</HL>
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 7. TESTIMONIAL #1 + weaving ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-8 leading-tight">
          Just Like <span className="text-[#D4A017]">Marcus T.</span>, Who Downloaded Shadow Persuasion A Few Months Ago And Soon After Closed A <HL>$42,000 Salary Increase</HL> Without His Manager Realizing The Negotiation Had Even Started
        </h2>

        <div className="max-w-2xl mx-auto mb-8">
          <Testimonial
            name="Marcus T."
            result="$42K Salary Increase"
            quote="Negotiated a $42,000 raise without my manager realizing the negotiation had even started. She walked out of the meeting thinking it was her idea."
            hidden="Every visible negotiation tactic damages the relationship. Even when it works. Shadow tactics do not."
          />
        </div>

        <div className="max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-[#1A1A1A] space-y-4">
          <p>
            And even though getting a $42,000 raise is a huge deal in itself, <strong>that&apos;s not the best part.</strong>
          </p>
          <p>
            The best part is that <HL>his manager walked out of that meeting thinking the raise was her idea</HL>, which
            means the relationship didn&apos;t just survive the negotiation. It got stronger. Six months later she
            promoted him again, because in her mind, he was the guy who helped her solve a problem.
          </p>
          <p>
            That&apos;s what every visible negotiation book gets wrong. They teach you to win the negotiation at the
            cost of the relationship. Shadow Persuasion lets you win <em>and</em> leave the other person feeling good
            about it.
          </p>
          <p>And Marcus isn&apos;t the only one either...</p>
        </div>
      </section>

      {/* ═════════ 8. TESTIMONIAL #2 ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-8 leading-tight">
            This Is <span className="text-[#D4A017]">Elena R.</span>, Another Shadow Persuasion Reader, Who Downloaded The Book Not Too Long Ago...
          </h2>

          <div className="max-w-2xl mx-auto mb-8">
            <Testimonial
              name="Elena R."
              result="Reconciled with estranged father"
              quote="I had not spoken to my father in seven years. Used the opening tactic from Chapter 3 at my cousin's wedding. We have been talking weekly since."
              hidden="I had rehearsed every apology and reconciliation line. All of them fired his detector. What actually worked was a Cold Open about something unrelated."
            />
          </div>

          <div className="max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-[#1A1A1A] space-y-4">
            <p>
              And soon after she reconnected with her father, she wrote this in our private community:
            </p>
            <blockquote className="border-l-4 border-[#D4A017] pl-5 italic text-[#3B2E1A]">
              &ldquo;Seven years of silence. I had rehearsed every apology. Every therapy-approved line. Every
              &lsquo;I want to repair this&rsquo; script. I tried all of them and he shut down every time. Finally
              used Cold Open about something completely unrelated at my cousin&apos;s wedding. 20 minutes in, he was
              the one bringing up what went wrong. We talk every Sunday now.&rdquo;
            </blockquote>
            <p>
              Here&apos;s another Shadow Persuasion reader who started using these tactics:
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 9. TESTIMONIAL #3 ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-8 leading-tight">
          Meet <span className="text-[#D4A017]">Daniel K.</span>, Who Ended A <HL>2-Year Recurring Fight</HL>{' '}With His Wife In One 12-Minute Conversation
        </h2>

        <div className="max-w-2xl mx-auto mb-8">
          <Testimonial
            name="Daniel K."
            result="Ended a 2-year recurring fight"
            quote="Finally ended a recurring fight with my wife that had been dragging on for two years. One 12-minute conversation, using tactics from Chapter 10."
            hidden="Couples therapy taught us frameworks. The book taught me what NOT to say. Removing those phrases ended the fight permanently."
          />
        </div>

        <p className="text-center text-base md:text-lg text-[#3B2E1A] max-w-3xl mx-auto italic">
          Marcus, Elena, and Daniel are a group of over 1,200 new-wave Shadow Persuaders who are doing things differently.
        </p>
      </section>

      {/* ═════════ 10. WE DON'T FOCUS ON ═════════ */}
      <section className="px-6 py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4 text-center">
            And You Can <span className="text-[#D4A017]">BET</span>...
          </h2>
          <p className="text-lg md:text-xl text-center text-[#F4ECD8]/80 mb-10">
            This Shadow Persuasion model is unlike any method you&apos;ve heard of before. This is something
            <strong className="text-[#D4A017]">{' '}completely different</strong>, because...
          </p>
          <ul className="space-y-4 text-lg md:text-xl">
            {[
              'memorizing techniques',
              'anchoring numbers',
              'mirroring body language',
              'building "rapport" through fake small talk',
              'closing scripts, pitches, or "frame control"',
            ].map((t) => (
              <li key={t} className="flex items-center gap-4">
                <span className="text-[#D4A017] font-mono text-xl">[ × ]</span>
                <span>We don&apos;t focus on <strong className="text-[#D4A017]">{t}</strong></span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-lg md:text-xl text-center leading-relaxed">
            In fact, <HL>we rarely (if ever) use anything that another person could possibly recognize as a &ldquo;technique.&rdquo;</HL>
          </p>
        </div>

        {/* Instead we... */}
        <div className="max-w-3xl mx-auto mt-16 border-t border-[#D4A017]/40 pt-12">
          <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#D4A017] mb-6 text-center">
            Instead, We Deploy The 47 Tactics Most Influence Books Never Mention
          </h3>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-5">
            Like I said, this is something completely different and it has the power to change everything for you.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-5">
            And I know that&apos;s true because it changed everything for me.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85">
            The Shadow Persuasion model let me get rid of <strong className="text-[#D4A017]">99% of all the BS I
            hated</strong> about trying to influence anyone, about trying to &ldquo;be more persuasive,&rdquo; about
            trying to be someone other than who I am in conversations that mattered.
          </p>
        </div>
      </section>

      {/* ═════════ 11. 99% OF BS - 5 things I stopped doing ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-center mb-10">
          Here Are The 5 Things I <span className="text-[#D4A017]">Stopped Doing</span>{' '}The Moment I Understood The Shadow Persuasion Model
        </h2>
        <div className="space-y-4">
          {[
            'I stopped trying to "sound confident." It was the single fastest way to fire the other person\'s detector. I replaced it with a low-status opening that makes elite negotiators look collaborative instead of combative.',
            'I stopped memorizing scripts. Every script I had ever learned came out of my mouth sounding like a script. I replaced them with three structural moves I could adapt in real time.',
            'I stopped "building rapport." The fake small talk at the start of every important meeting was the most damaging move I was making. I replaced it with something that builds real trust in under 60 seconds and isn\'t detectable as a technique.',
            'I stopped trying to "close." Every closing move I had ever been taught was visible. I replaced them with Lock-In tactics that prevent reversal without any of the obvious "are you ready to move forward?" theater.',
            'I stopped reading persuasion books. I had read 31 of them. Every new one made me slightly worse at actual conversations because I was thinking about frameworks instead of listening. I threw the whole shelf out.',
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start bg-white border-l-4 border-[#D4A017] p-5 shadow-[4px_4px_0_0_rgba(0,0,0,0.06)]">
              <span className="font-mono text-2xl font-black text-[#D4A017] leading-none shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-base md:text-lg text-[#1A1A1A] leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ 12. CIRCLE OF DOOM ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-[#EBE0C7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// THE OLD WAY //</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              Here&apos;s What My Life Used To Look Like. I Call This The <span className="text-[#8B0000]">&ldquo;Circle Of Doom&rdquo;</span>
            </h2>
            <p className="text-base md:text-lg text-[#3B2E1A] mt-4 max-w-2xl mx-auto">
              If you&apos;ve ever tried to &ldquo;be more persuasive,&rdquo; you&apos;ve been here:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Read another persuasion book (Cialdini, Voss, Greene, Carnegie…)',
              'Highlight the techniques you want to start using',
              'Try to remember them in actual conversations',
              'Awkwardly deploy "anchoring" or "labeling emotions" mid-conversation',
              'Watch the other person\'s face change as they sense you\'re running a play',
              'Lose the conversation as their guard goes up and trust drops',
              'Decide you\'re "just bad at this" and buy another book',
              'Start over',
            ].map((step, i) => (
              <div key={i} className="bg-white border-2 border-[#8B0000]/40 p-4 md:p-5 flex gap-4 items-start">
                <span className="font-mono text-2xl font-black text-[#8B0000] leading-none shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm md:text-base text-[#1A1A1A] leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-2xl mx-auto bg-[#8B0000]/10 border-2 border-[#8B0000]/40 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-[#8B0000] mx-auto mb-3" />
            <p className="text-base md:text-lg text-[#1A1A1A]">
              The Circle of Doom not only sucked. It kept me stuck for <HL>3 years</HL>, forcing me to underearn by
              around $90K a year, lose arguments I was right about, and watch less-talented people get promoted ahead
              of me while I worked twice as hard.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mt-10 text-base md:text-lg leading-relaxed text-[#1A1A1A] space-y-4">
            <p>To be honest, I almost gave up on the whole idea of ever being good at this.</p>
            <p>But before I gave up, I wanted to try something.</p>
            <p>Something that, if it worked, would change everything.</p>
            <p>And as you&apos;re about to find out, what I tried... <HL>it worked</HL>.</p>
            <p>And I spent the next several years turning it into a system.</p>
          </div>
        </div>
      </section>

      {/* ═════════ 13. PUT SYSTEM IN BOOK + PERSONAL INTRO ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-10 text-center">
          And I Put This Entire System In A <HL>117-Page Field Manual</HL>{' '}Called <em>Shadow Persuasion</em>. You Can Start Reading It In Just A Few Moments From Now...
        </h2>

        <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
          <p>But before you do, I&apos;d like to introduce myself and tell you how all this came to be.</p>

          <p>
            My name is <strong>Nate Harlan</strong>.
          </p>
          <p>
            You probably haven&apos;t heard that name before. That&apos;s by design.
          </p>
          <p>
            Most of my work over the last eight years has been behind the scenes. Coaching private clients one on one.
            Consulting with founders on specific high-stakes conversations they couldn&apos;t afford to lose. Sitting
            in the back of the room with a notepad while a CEO ran a board meeting I had helped him prepare for. I
            don&apos;t run a YouTube channel. I don&apos;t teach a bootcamp. I don&apos;t do speaking tours. This
            field manual is the first thing I&apos;ve ever made public under this name.
          </p>
          <p>
            My life&apos;s pretty good right now. I live in <HL>Austin, Texas</HL> with my wife Sarah and our
            four-year-old daughter. I walk my kid to preschool in the mornings, take calls with private clients in the
            afternoons, and spend the rest of my time recording, reviewing, and refining the tactics in this book. I
            get to pick which conversations I want to be in. I haven&apos;t had to &ldquo;win&rdquo; a fight with
            anyone I love in a long time, because the conversations that used to become fights don&apos;t escalate
            anymore.
          </p>
          <p className="italic text-[#3B2E1A]">
            That was not always my life.
          </p>
        </div>
      </section>

      {/* ═════════ 14. WHERE I WAS ON [DATE] - ORIGIN STORY ═════════ */}
      <section className="px-6 py-12 md:py-20 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8">
            As We Get To Know Each Other, You&apos;ll Quickly Realize I&apos;m The <span className="text-[#D4A017]">Luckiest Person On Earth</span>. So Let&apos;s Talk About Where I Was On <HL>March 14, 2016</HL>
          </h2>

          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#F4ECD8]/90">
            <p>
              I was <strong>29 years old</strong> and living in a 400-square-foot studio apartment in Philadelphia.
              The neighbor above me played drums at 11 p.m. three nights a week. I didn&apos;t have the
              conversational tools to ask him to stop.
            </p>
            <p>
              I had no savings.
            </p>
            <p>
              I had no close friends I could call at 10 p.m. when things were falling apart.
            </p>
            <p>
              I had no relationship with my parents, because I hadn&apos;t been able to defuse the fight at the
              Thanksgiving table 18 months earlier that ended with my father walking out and my mother saying
              &ldquo;don&apos;t come back until you figure out how to talk to us.&rdquo; I hadn&apos;t figured it out.
            </p>
            <p>
              And on that specific March night, I had just read a text from my fiancée Jenna that ended with the line{' '}
              <em>&ldquo;the worst part is I don&apos;t think you actually know how to have a real conversation with
              anyone in your life, including me.&rdquo;</em>
            </p>
            <p>
              This meant I couldn&apos;t do the thing I wanted to do more than anything, which was simply{' '}
              <strong>be in real relationships with the people I cared about</strong>.
            </p>
            <p>
              There&apos;s a stupid myth out there that says if you&apos;re just a &ldquo;good person&rdquo; and you
              communicate &ldquo;honestly,&rdquo; the relationships in your life work out. Well, sometimes they
              don&apos;t.
            </p>
            <p>
              I was a good person. I was trying to be honest. And I was losing every important conversation in my
              life, because honesty without skill was firing everyone&apos;s detectors the same way a bad salesperson
              fires yours.
            </p>
            <p>I gave it everything I had. I gave it my BEST shot. And it didn&apos;t work.</p>
            <p>Because I played by the rules and I did everything right...</p>
          </div>
        </div>
      </section>

      {/* ═════════ 15. UNDESIRABLE RESULTS + DISCOVERED MECHANISM ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8">
          I Ended Up Alone In A 400-Square-Foot Apartment, Making $54K A Year, And I <HL>Hated It</HL>
        </h2>

        <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
          <p>
            I hated it because I had goals, dreams, and aspirations. I wanted more out of life. I wanted a family.
            I wanted to build something. I wanted the kind of career where I wasn&apos;t watching less-capable people
            get promoted ahead of me every 18 months.
          </p>
          <p>
            And being the guy who lost every important conversation in his life wasn&apos;t going to get me there.
          </p>
          <p>
            So I did what everyone else does in that situation. I started looking for a way out. I looked everywhere.
          </p>
          <p>
            A few months later, I stumbled onto a thread on a private forum where a group of people called themselves
            <strong>&ldquo;Operators&rdquo;</strong>. They were ex-hostage negotiators, M&amp;A lawyers, family
            mediators, a couple of professional poker players, and one retired FBI profiler. They were talking about
            &ldquo;below-the-radar influence&rdquo; in a way I had never heard before.
          </p>
          <p>
            This was a cool concept to me, and as I researched more, I found that most of them had started out exactly
            where I was. They had also read every book. They had also tried every technique. They had also lost the
            conversations that mattered most.
          </p>
          <p>
            <strong>The only difference was:</strong> somewhere along the way they stopped trying to look like they
            were persuading, and started trying to look like they <em>weren&apos;t</em>.
          </p>
        </div>
      </section>

      {/* ═════════ 16. THE MECHANISM - PERSUASION DETECTOR ═════════ */}
      <DocDivider text="// THE MECHANISM //" />

      <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6 text-center">
          The <span className="text-[#D4A017]">Persuasion Detector</span>{' '}Is One Of The Most Underrated Concepts In The Entire Field Of Influence. And It&apos;s The Reason Every Other Book Has Been Failing You
        </h2>
        <p className="text-base md:text-lg text-center text-[#3B2E1A] mb-10">Just think about it:</p>

        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            'Have you ever watched a salesperson try to "anchor" you with a high price? And immediately thought "they\'re trying to anchor me right now"?',
            'Have you ever had someone "mirror" your body language a little too obviously? And it instantly creeped you out?',
            'Have you ever been in a negotiation where the other person used Chris Voss\'s "labeling" technique on you? And you literally thought "this guy read Never Split The Difference last weekend"?',
            'Have you ever had a partner try to validate your feelings using an obvious therapy script? And it made the fight worse?',
            'Have you ever had someone open with a Carnegie-style "remember their name and use it three times" move? And you instantly knew you were being worked?',
          ].map((q, i) => (
            <div key={i} className="flex gap-4 items-start bg-white border border-[#5C3A1E]/30 p-4 md:p-5">
              <span className="text-2xl">🤔</span>
              <p className="text-base md:text-lg text-[#1A1A1A] leading-relaxed">{q}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-black text-[#F4ECD8] p-8 md:p-10 border-4 border-[#D4A017]">
          <p className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[#D4A017] mb-4">
            That&apos;s the persuasion detector.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-4">
            Every human brain has one. It evolved over hundreds of thousands of years to spot{' '}
            <strong>influence attempts</strong>. In a tribal environment, being persuaded by the wrong person was a
            survival risk, so the brain learned to resist first and evaluate later.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-4">
            When the detector fires, three things happen instantly. <HL>Trust drops.</HL> The listener becomes{' '}
            <HL>resistant.</HL> They start <HL>mentally pushing back</HL> on whatever you say next, even things they would
            have agreed with five minutes earlier.
          </p>
          <p className="text-lg md:text-xl font-bold text-[#D4A017]">
            The entire &ldquo;visible persuasion&rdquo; industry is built on tactics that fire the detector.
          </p>
          <p className="text-base md:text-lg mt-4">
            Working around the detector was the perfect thing for me. It didn&apos;t require me to become a different
            person, memorize new scripts, or perform confidence I didn&apos;t feel. It just required me to stop doing
            the things that were tipping everyone off that I was trying.
          </p>
        </div>
      </section>

      {/* ═════════ 17. YOU DON'T EVEN HAVE TO ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            And The Best Part That Attracted Me To Doing It This Way?
          </h2>
          <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-wide text-center mb-10 text-[#D4A017]">
            You Don&apos;t Even Have To <HL>Memorize A Single Script</HL>
          </h3>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
            <p>
              Which means you can walk into any important conversation without rehearsing lines in the car on the way
              there. You can actually listen to what the other person is saying instead of running through your
              mental flashcards trying to remember which &ldquo;technique&rdquo; to pull out next.
            </p>
            <p>
              You can be fully present. Which, as it turns out, is the single biggest advantage you can have in any
              high-stakes conversation.
            </p>
            <p>
              All you have to do is learn the <strong>four structural moves</strong> that make up the Shadow
              Persuasion system. Disable. Plant. Shift. Lock In. They&apos;re not scripts. They&apos;re positions.
              You adapt them to the conversation you&apos;re actually in.
            </p>
            <p>
              And once you&apos;ve run them a few times, they stop feeling like &ldquo;tactics&rdquo; at all. They
              just feel like <HL>how you talk now</HL>.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 18. BIRTH OF JOURNEY + 3 YEARS BRUTAL ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8">
          And That Was The Birth Of My <span className="text-[#D4A017]">Obsession</span>
        </h2>
        <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
          <p>
            After that forum thread, I started recording my own conversations. Sales calls at my day job. Phone calls
            with my mother, once we started talking again. The coaching sessions I eventually started taking on the
            side. Every disagreement I got into with Sarah (who at the time was just starting to become someone I was
            serious about).
          </p>
          <p>
            I had no idea how to structure a system. I didn&apos;t know how to code the patterns I was seeing. I
            didn&apos;t know how to tell the signal from the noise. I didn&apos;t know which moves were actually
            working and which ones were just correlated with outcomes that would have happened anyway.
          </p>
          <p>
            All I knew how to do was <strong>notice</strong>. Notice the exact second someone&apos;s face changed.
            Notice the phrase that preceded every shutdown. Notice the one kind of opening that made hostile people
            suddenly lean forward.
          </p>
          <p>
            Looking back, those first <HL>three years were brutal.</HL>
          </p>
          <p>Late nights reviewing transcripts.</p>
          <p>Hard work coding the patterns.</p>
          <p>Stress, because for every real insight I had, ten more conversations went sideways.</p>
          <p>
            I followed every protocol the Operators were using. I got real results. I closed a $17K contract at work
            that I never would have closed the year before. I had my first real conversation with my father in 20
            months. I even started dating Sarah properly.
          </p>
          <p>
            But in the process, I created a new problem: <strong>I had 400 hours of recorded conversations sitting on
            a hard drive and no system to extract what was actually working from what was just luck.</strong> I
            needed to reverse-engineer the patterns or I&apos;d plateau.
          </p>
          <p>
            That was my life, and I was ready to quit again.
          </p>
          <p>But thankfully, I didn&apos;t.</p>
        </div>
      </section>

      {/* ═════════ 19. FAST FORWARD TO TODAY ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8">
            That Was <HL>Ten Years Ago</HL>, And Fast Forward To Today It Almost Seems Like A Bad Dream
          </h2>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#F4ECD8]/90">
            <p>
              I proved the idea that you have to &ldquo;learn visible persuasion techniques&rdquo; to be good at
              influence to be all wrong.
            </p>
            <p>
              Instead of watching less-capable coworkers get promoted ahead of me while I grind through another
              Cialdini re-read, I&apos;m spending my mornings walking my daughter to preschool and my afternoons on
              calls with private clients who pay me $2,500 a session to prep them for the conversation that will
              decide their year.
            </p>
            <p>
              Instead of avoiding my parents&apos; calls because I don&apos;t know how to talk to them, I fly my
              mother out to Austin twice a year and she and Sarah now text each other more than Sarah and I do.
            </p>
            <p>
              Instead of living in a studio apartment in a neighborhood I don&apos;t like, I work out of a small
              office two blocks from my house, I pick up my kid at 3:30, and I haven&apos;t worn a tie in six years.
            </p>
            <p className="italic text-[#D4A017]">
              Chatting with friends and writing this copy you&apos;re reading.
            </p>
            <p>
              I have the kind of family life I didn&apos;t know was possible for me in 2016, a professional reputation
              I can be quietly proud of, and a client waitlist I don&apos;t have to advertise to keep full.
            </p>
            <p>
              Unlike the influence gurus in this space, who are running Instagram accounts and doing live events and
              selling $3,000 bootcamps... I spend almost all of my time with the people I actually love, and my
              clients find me through quiet word of mouth because they saw someone else win a conversation and
              asked &ldquo;who helped you with that?&rdquo;
            </p>
            <p>
              You see, most people in this space end up spending all their time <HL>performing persuasion</HL> instead
              of doing it. They become brands. They have to. The model they&apos;re teaching requires them to be
              on stage.
            </p>
            <p>
              I did that for three months back in 2019, trying to build a coaching business the &ldquo;normal&rdquo;
              way, and it not only drove me crazy, it drove me to the point where I was losing my own skills. Every
              performance fired my own detector against myself.
            </p>
            <p>
              Instead of me quietly helping people win conversations, I was visibly trying to sell persuasion
              training, which is exactly what fires the detector in the audience. I was doing the thing I teach
              people not to do.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 20. MAIN DIFFERENCE WITH OLD WAY + NEW WAY FLOW GRAPHIC ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
          Wanna Know What The Main Difference Is With The Shadow Persuasion Model And That <span className="text-[#D4A017]">&ldquo;Old Way&rdquo;</span> Of Doing Things?
        </h2>

        <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A] mb-10">
          <p>
            The old way <strong>tries to persuade visibly and hopes the other person cooperates</strong>. The Shadow
            Persuasion model arranges the conversation so that <strong>the other person persuades
            themselves</strong>, on your behalf, without ever realizing that&apos;s what happened.
          </p>
          <p>
            Rather than doing all those things I mentioned above in order to get someone to say yes, here&apos;s what
            it looks like now:
          </p>
        </div>

        <div className="my-10 bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
          <NewWayFlowGraphic />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mt-10 mb-6 text-center">
          And The Result Of Using This New Way?
        </h3>
        <div className="bg-[#EBE0C7] border-l-4 border-[#D4A017] p-6 md:p-8 space-y-4 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
          <p>
            I get people volunteering concessions I never would have had the nerve to ask for. Managers who pitch me
            the raise before I have to. Contractors who lower their quote before I mention the budget. Family members
            who apologize for things I thought they&apos;d take to the grave.
          </p>
          <p>
            And the best part is that <HL>nobody feels manipulated afterward</HL>. Because structurally, they weren&apos;t.
            They reached their own conclusion. I just made it easy for the right conclusion to be the one that felt
            most natural to them.
          </p>
        </div>

        <p className="text-center italic text-[#3B2E1A] mt-8 text-base md:text-lg max-w-2xl mx-auto">
          If you follow every step I teach, you end up with the outcomes you want in the conversations that decide
          your life. But it&apos;s actually much more than that.
        </p>

        <div className="max-w-3xl mx-auto mt-10 border-t border-[#5C3A1E]/30 pt-8">
          <h4 className="text-xl md:text-2xl font-bold uppercase tracking-wide mb-4 text-center">
            It&apos;s Actually <HL>A Completely Different Way Of Moving Through The World</HL>
          </h4>
          <p className="text-base md:text-lg leading-relaxed text-[#1A1A1A]">
            Because once you stop firing detectors, the quality of every interaction in your life shifts. People trust
            you faster. Arguments end sooner. Strangers help you without being asked. You walk out of rooms with
            outcomes you didn&apos;t even know you were going to ask for.
          </p>
        </div>
      </section>

      {/* ═════════ 21. I'M NOT SAYING OLD WAY IS BAD ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            And Look, <span className="text-[#D4A017]">I&apos;m Not Saying Visible Persuasion Is Bad</span>
          </h2>

          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
            <p>
              Cialdini&apos;s principles are real. Voss&apos;s mirroring works in the right context. Carnegie&apos;s
              advice about remembering names is genuinely good manners. I&apos;m not telling you to burn those books.
              They&apos;re solid foundational reading.
            </p>
            <p>
              What I&apos;m saying is this: <strong>if your goal is actually getting the outcome you want in
              high-stakes conversations with sophisticated people, the visible toolkit might actually be the thing
              that&apos;s holding you back from getting it.</strong>
            </p>
            <p>
              The visible approach requires you to perform confidence, remember the right script, pick the right
              technique for the moment, and execute it cleanly enough that a person who has probably read the same
              book doesn&apos;t catch you running it.
            </p>
            <p>
              The Shadow Persuasion approach just requires <HL>one structural shift</HL>: you stop trying to be seen
              persuading, and you start arranging the conversation so the other person reaches the conclusion on
              their own.
            </p>
            <p>That&apos;s the entire difference. That&apos;s why this is different.</p>
          </div>
        </div>
      </section>

      {/* ═════════ 22. STAKE MY REPUTATION ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-[#D4A017] mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
            And You Know What? I&apos;ll Stake My Entire <span className="text-[#D4A017]">Reputation</span> On This One Promise
          </h2>
          <p className="text-xl md:text-2xl text-[#D4A017] font-bold leading-relaxed mb-8">
            You can win virtually any high-stakes conversation in your life without the other person ever realizing you tried to.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-4">
            And once you start using the Shadow Persuasion model, getting the outcome you want in these conversations
            isn&apos;t something you ever need to worry about again. Or even think about.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-4">
            It&apos;s something that happens <HL>naturally</HL> once you stop firing detectors. The outcome becomes
            the default instead of the exception.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85">
            Here&apos;s what I want you to do right now: set your calendar to <HL>30 days from today</HL>. Because if
            you implement the tactics in this book, that&apos;s when you&apos;ll start seeing your first real wins.
            Agreements that used to take weeks, raises you hadn&apos;t asked for, fights that would have dragged on
            for months now ending in 12 minutes.
          </p>
        </div>
      </section>

      {/* ═════════ 23. IF I CAN DO THIS SO CAN YOU + COMMUNITY ═════════ */}
      <section className="px-6 py-16 md:py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6 text-center">
          And Just A Few Years Ago, I&apos;d Have Told You That You Were <HL>Crazy</HL> If You Thought Such A Model Existed. But Today I Know Better
        </h2>
        <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A] max-w-3xl mx-auto mb-10">
          <p>Listen:</p>
          <p>
            I don&apos;t care how many times you&apos;ve tried to become more persuasive and failed. I don&apos;t care
            how many books you&apos;ve bought and shelved half-read. I don&apos;t care if you&apos;ve told yourself
            you&apos;re &ldquo;just not a people person.&rdquo;
          </p>
          <p>I promise you this...</p>
          <p>
            <strong>Anyone</strong> can win almost any high-stakes conversation with the right model. That includes
            the introverted. The soft-spoken. The ones who stammer under pressure. The ones who think of the right
            thing to say in the shower the next morning. Shadow Persuasion doesn&apos;t require you to become a
            different kind of person. It just requires you to stop firing the detector.
          </p>
          <p>Ultimately, I want you to know one thing:</p>
        </div>

        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight text-center mb-10 text-[#D4A017]">
          If I Can Do This, So Can You
        </h3>

        <div className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.08)]">
          <p className="text-base md:text-lg leading-relaxed text-[#1A1A1A] mb-6 text-center">
            Because over <HL>1,200 other readers</HL> are doing it too right now inside the private Shadow Persuasion
            community. Here&apos;s what some of them have been posting recently:
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { name: 'Priya R.', text: 'Just closed a contractor dispute. He came down $4,200 on the quote. Used the Strategic Pause from Chapter 6. Literally said nothing for 14 seconds. He filled the silence with concessions.' },
              { name: 'James W.', text: 'Ended a 14-month passive-aggressive cold war with my brother-in-law in one Thanksgiving. Did not even plan it. The Reframe from Chapter 11 just came out naturally.' },
              { name: 'Sarah L.', text: 'Got out of a 3-year lease on a car I couldn\'t afford anymore. The dealer acted like it was his idea. Did not pay the expected early-termination fee.' },
              { name: 'Mike D.', text: 'Weird one: convinced my 8-year-old to start brushing without a fight. Applied the Plant the Conclusion pattern. He thinks he came up with the new routine.' },
            ].map((p) => (
              <div key={p.name} className="bg-[#F4ECD8] border border-[#5C3A1E]/30 p-4 text-sm">
                <p className="font-mono font-bold text-[#D4A017] mb-2 text-xs uppercase tracking-wider">
                  {p.name} · Community Post
                </p>
                <p className="text-[#1A1A1A] italic leading-relaxed">&ldquo;{p.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ 24. I DID THE HARD WORK FOR YOU ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            And Here&apos;s Another Reason You Too Can Do This
          </h2>
          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
            <p>
              It took me <strong>eight years</strong> to figure this out.
            </p>
            <p>
              And another <strong>two years</strong> after that to perfect it and turn it into something teachable.
            </p>
            <p>
              Which is safe to say that <HL>there isn&apos;t anything left for you to figure out</HL>.
            </p>
            <p>
              I already did all of the hard work for you. I recorded the 400 hours. I coded the patterns. I ran the
              reverse-engineering against failure cases so we know what breaks the tactics as well as what makes them
              land. I tested them across salary negotiations, custody mediations, contractor disputes, parenting
              conversations, reconciliations with estranged family, and ugly divorce settlements.
            </p>
            <p>
              I figured it all out.
            </p>
            <p>
              Which means there&apos;s nothing for you to &ldquo;figure out.&rdquo; You just need to download this
              book and, most important of all, <strong>implement it</strong>.
            </p>
            <p>That&apos;s it.</p>
          </div>
        </div>
      </section>

      {/* ═════════ 25. 4-PART SYSTEM REVEALED ═════════ */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// THE SYSTEM //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Here&apos;s The Exact <span className="text-[#D4A017]">4-Part System</span>{' '}Revealed In The Shadow Persuasion Book For Winning Almost Any High-Stakes Conversation
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              n: '01',
              title: 'Disable The Detector',
              body: 'The first 30 seconds determine whether they treat your words as collaborative or as sales. We\'ll set up the opening that makes the listener\'s guard come down without them noticing it ever went up. Ten tactics.',
            },
            {
              n: '02',
              title: 'Plant The Conclusion',
              body: 'Structure the conversation so they arrive at your desired outcome on their own. People defend conclusions they reached themselves. We\'ll walk them there one question at a time. Fourteen tactics.',
            },
            {
              n: '03',
              title: 'Shift The Frame',
              body: 'Sometimes you cannot win the conversation being had. You have to quietly change what it\'s about. We\'ll cover the twelve reframes that work on everyone from teenagers to CEOs, and nobody notices it happened.',
            },
            {
              n: '04',
              title: 'Lock In Without Closing',
              body: 'Exit in a way that prevents reversal without using any of the obvious "closing" moves. Eleven tactics for the last thirty seconds of any important exchange, including the One-Line Email that cuts post-deal reversal from 31% to 4%.',
            },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_0_#D4A017] flex flex-col"
            >
              <span className="font-mono text-6xl md:text-7xl font-black text-[#D4A017] leading-none mb-4">
                {s.n}
              </span>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
                {s.title}
              </h3>
              <p className="text-base text-[#3B2E1A] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-base md:text-lg text-[#3B2E1A] max-w-2xl mx-auto">
          Those are the 4 parts to winning almost any high-stakes conversation. All of this is revealed in the
          117-page Shadow Persuasion field manual in step-by-step detail.
        </p>
      </section>

      {/* ═════════ 26. TWO TYPES + #1 MISTAKE ═════════ */}
      <section className="px-6 py-12 md:py-20 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-6">
            Now, Speaking Of The Model... I&apos;m Going To Share Something A Little <HL>Disturbing</HL> With You
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-5">Here it goes:</p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-5">
            I am <strong>hurting my own private coaching business</strong> by showing you this. My $2,500-per-session
            clients pay what they pay precisely because this information is hard to get. Putting 47 of my best tactics
            in a $7 book makes my premium pricing harder to defend.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#F4ECD8]/85 mb-8">
            And the other gurus out there are making loads of money by teaching the exact opposite of what I teach.
            Their whole business model depends on the visible toolkit <em>not</em> working, so you keep buying their
            next book. I&apos;m about to tell you why it doesn&apos;t work.
          </p>
          <p className="text-lg md:text-xl text-[#D4A017] font-bold mb-8">Ready for it?</p>

          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-[#D4A017]">
            The #1 Mistake Everyone Else Makes Is <HL>Trying To Look Like They&apos;re Persuading</HL>
          </h3>

          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#F4ECD8]/90">
            <p>Here&apos;s why:</p>
            <p>
              There are two types of persuaders out there. There are the <strong>Visible Persuaders</strong> and
              there are <strong className="text-[#D4A017]">Shadow Persuaders</strong>.
            </p>
            <p>
              For my first eight years, I was a Visible Persuader. Visible Persuaders are always out there trying to{' '}
              <strong>look skilled</strong>. They want to sound confident. They want the other person to see them
              running a technique. Part of them, secretly, wants to get caught, because getting caught means someone
              noticed how good they were. Their strategy is to try to <strong>out-technique</strong> the other person.
            </p>

            <p>And by focusing on this strategy, they spend a ton of time on:</p>
            <ul className="space-y-3 ml-5 list-disc marker:text-[#D4A017]">
              <li>Memorizing scripts that come out sounding like scripts</li>
              <li>Rehearsing &ldquo;power moves&rdquo; that everyone can see coming</li>
              <li>Performing confidence they don&apos;t actually feel</li>
              <li>Building &ldquo;rapport&rdquo; through fake small talk that the listener sees straight through</li>
            </ul>
            <p>
              All of this requires time and energy. And all of it fires the other person&apos;s detector, which is
              the one thing you absolutely cannot let happen.
            </p>
            <p>
              The problem isn&apos;t the model itself. It&apos;s that <strong>being seen persuading is structurally
              incompatible with actually being persuasive</strong>. The second the other person knows you&apos;re
              running a play, the play stops working.
            </p>
            <p>
              This is the same exact thing that happened to me before I figured out the Shadow Persuasion model.
            </p>
            <p className="text-xl md:text-2xl font-bold text-[#D4A017]">The solution?</p>

            <h4 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#D4A017] pt-4">
              Become A Shadow Persuader Instead
            </h4>

            <p>
              That&apos;s right. We deliberately try <strong>not to look skilled</strong>. We deploy the 47 tactics
              that the other person can&apos;t see us running. We&apos;d rather get the outcome with little visible
              effort than get the applause for a brilliant move that also got our proposal rejected.
            </p>
            <p className="italic text-[#F4ECD8]/70">No thanks. I did that for eight years and it sucks.</p>
            <p>
              So here&apos;s the deal: I explain everything in <em>Shadow Persuasion</em>. It&apos;s a 117-page
              field manual that shows you the entire system end to end.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 27. MID PAGE CTA ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-center mb-8">
          Ready To Stop Losing Conversations You Should Be Winning?
        </h2>
        <OrderBox />
      </section>

      {/* ═════════ 28. 25 BULLETS ═════════ */}
      <DocDivider text="// FIELD MANUAL CONTENTS //" />

      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Here&apos;s What Else You&apos;ll Discover Inside <em>Shadow Persuasion</em>
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A] mt-4">
            47 tactics. 4 Parts. No filler.
          </p>
        </div>

        <div className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.10)]">
          {[
            'How To Disable Anyone\'s Persuasion Detector In The First 30 Seconds Of A Conversation (so they treat everything you say next as collaborative, not sales)',
            'The Counterintuitive "Cold Open" That Gets You An Audience With Anyone, Including People Who Normally Screen You Out',
            'Why "Building Rapport" Is The Most Damaging Thing You Can Do In The First Five Minutes (and the invisible alternative that builds real trust)',
            'The Exact Opening That Disarms A Hostile Boss, Client, Partner, Or Family Member Before They Can Attack',
            'How Trying To Sound Confident Quietly Destroys Your Credibility (and the "low-status opening" elite negotiators use instead)',
            'The Step-By-Step Path To Make Anyone Reach YOUR Conclusion On Their Own (so they defend it later as if it were their idea)',
            'The "Strategic Pause" That Makes A Contractor Drop A $13,500 Overcharge To $2,500 In 11 Seconds Of Silence',
            'How To Use Someone\'s Own Words Against Their Resistance Without Them Ever Noticing',
            'The Counterintuitive Way To Handle Manipulators Without Confrontation (so they back off without ever realizing you saw what they were doing)',
            'How To End A Two-Year Recurring Fight In One 12-Minute Conversation (tested on spouses, parents, adult siblings, and ex-partners)',
            'Why "Mirroring" Backfires On Anyone Smarter Than A Toddler (and the subtle alternative that works on everyone)',
            'The Single Word That Makes People Believe You Are "On Their Side" Without You Having To Actually Agree With Anything',
            'How To Spot When Someone Is Running A Visible Tactic On You (and the elegant counter that makes them feel exposed without you having to say a word)',
            'Why Deploying Cialdini\'s Principles Now Marks You As An Amateur (and the modern versions sophisticated listeners still fall for)',
            'The Quietest Way To Take Control Of A Meeting Without Speaking First Or Loudest',
            'How To Make A "Yes" Stick: The Post-Agreement Pattern That Prevents The Other Person From Changing Their Mind 24 Hours Later',
            'The "Reverse Qualifier" That Makes Prospects, Dates, And Bosses Chase You Instead Of The Reverse',
            'How To Win A Price Negotiation Without Naming The First Number',
            'The "Timeline Compression" Move That Ends A Three-Week Stalemate In A Single Email',
            'How To Get An Apology From Someone Who Will Never Admit They Were Wrong',
            'The One-Line Email Move That Cuts Post-Deal Reversal Rates From 31% Down To 4%',
            'The "Volcano" Technique: How To Let A Manipulator\'s Primary Tactic Stop Working Against You Without Any Confrontation',
            'The Last-Word Exit: How To End Every Important Conversation In A Position Of Strength Without Sounding Aggressive',
            'The Hidden Cost Move That Collapses Someone\'s Bad Decision Before You Ever Have To Argue Against It',
            'The 7-Minute Daily Practice That Makes All 47 Tactics Second Nature Within 30 Days',
          ].map((text, i) => (
            <DiscoveryBullet key={i}>
              {text}
            </DiscoveryBullet>
          ))}
        </div>

        <p className="text-center mt-8 text-base md:text-lg text-[#1A1A1A]">
          We&apos;ll also show you how to <HL>walk into any room with people you&apos;ve never met and become the most quietly influential person in it within 20 minutes.</HL>
        </p>
      </section>

      {/* ═════════ 29. BONUSES ═════════ */}
      <section className="px-6 py-16 md:py-24 bg-[#EBE0C7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// FREE BONUSES //</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              Plus You&apos;re Also Getting <span className="text-[#D4A017]">4 Free Bonuses</span>{' '}Worth $218
            </h2>
            <p className="text-base md:text-lg text-[#3B2E1A] mt-4">
              All included free with your $7 download. No upsells. No catch.
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <BonusCard
              num="1"
              title="The Manipulation Tactics Decoder"
              description="50 common manipulation tactics across five categories (emotional, language, social, informational, and power plays) with the exact red flag for each one and the counter-move that shuts it down. Laid out so you can screenshot any page to your phone and pull it up mid-conversation."
              value="$47"
              icon={Eye}
            />
            <BonusCard
              num="2"
              title="The Power Dynamics Cheatsheet"
              description="The one-page reference you pull up on your phone before any high-stakes conversation. Five chronological sections: Before You Walk In, First 30 Seconds, During, If You're Losing Ground, and How To End. Plain English, no jargon."
              value="$27"
              icon={Zap}
            />
            <BonusCard
              num="3"
              title="48 Salary Negotiation Scripts"
              description="Word-for-word scripts for every phase of a compensation conversation. Every objection (all fifteen of them), every counter, every framing. Opening moves. Stating your number. Negotiating the offer. Follow-up emails. Special situations like counter-offers and 'what would make you stay?' Six parts, forty-eight scripts."
              value="$97"
              icon={Briefcase}
            />
            <BonusCard
              num="4"
              title="The Reactance Detector Cheatsheet"
              description="24 phrase swaps across four categories. The exact phrases that fire the listener's Persuasion Detector, and the quiet version of each one that does the same work invisibly. Plus ten signals that someone is running a tactic on YOU right now, and what to do about it."
              value="$47"
              icon={Shield}
            />
          </div>
        </div>
      </section>

      {/* ═════════ 30. NO CATCH PRICING NARRATIVE ═════════ */}
      <section className="px-6 py-16 md:py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
          And Before You Download... I Want You To Know That <HL>There&apos;s No Catch</HL>
        </h2>
        <div className="space-y-5 text-base md:text-lg leading-[1.85] text-[#1A1A1A]">
          <p>I realize this is very inexpensive and that I&apos;m practically giving it away...</p>
          <p>
            And you&apos;re probably wondering: <em>&ldquo;If you&apos;re doing so well with this, why would you give
            it away for next to nothing?&rdquo;</em>
          </p>
          <p>So there has to be a &ldquo;catch&rdquo;...</p>
          <p>
            And I know there are some websites out there that offer you a great deal on something but then they stick
            you in some program that charges your card every month.
          </p>
          <p><strong>This isn&apos;t one of them.</strong></p>
          <p>
            There&apos;s NO hidden &ldquo;continuity program&rdquo; you have to try or anything even remotely like that.
          </p>
          <p>
            I&apos;m literally giving you this entire book, for <strong>$7</strong>, as a means of &ldquo;putting my
            best foot forward&rdquo; and demonstrating real value. My hope is that you&apos;ll love it, and this will
            be the start of a good business relationship for years to come.
          </p>

          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide pt-4 text-center text-[#8B0000]">
            But With All That Said: This Won&apos;t Last Long
          </h3>
          <p>
            I was planning on selling this book for <strong>$47</strong>, but that meant I had to print copies of it,
            store them, and ship them. Which would eat up profits and also make it much more difficult to help more
            people.
          </p>
          <p>
            Then I sold the Shadow Persuasion book for <strong>$27</strong> and over 800 people downloaded it at that
            price. Which was great, but then I realized: hey, this is an eBook. It doesn&apos;t cost me anything to
            sell other than a few bucks to advertise it.
          </p>

          <h4 className="text-lg md:text-xl font-bold uppercase tracking-wide pt-4">
            By Lowering The Price To $7 It Allows Me To Impact More People
          </h4>
          <p>
            I consider that a true win/win.
          </p>
          <p>
            Also, in most cases, <strong>I take a loss when selling the book at this price.</strong> It costs me just
            over $22 in advertising expense to sell one book. So why would I do that?
          </p>
          <p>
            Simple. I&apos;m making this offer with the idea that you&apos;ll be very impressed with what I&apos;m
            giving you today, and you&apos;ll want to do more business with me in the future. I&apos;m betting
            you&apos;ll enjoy the book so much, a small percentage of you will want to work with me directly.
            That&apos;s the entire deal. No tricks.
          </p>
          <p>Anyway, with all of that said, this is a limited offer.</p>
        </div>
      </section>

      {/* ═════════ 31. MONEY BACK GUARANTEE ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-[#D4A017] mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              The <span className="text-[#D4A017]">Best Money-Back Guarantee</span>{' '}In The World
            </h2>
          </div>

          <div className="border-4 border-[#D4A017] bg-black p-6 md:p-10 space-y-5 text-base md:text-lg leading-relaxed">
            <p>
              Like my grandpa used to say, &ldquo;test drive the car before you drive it off the lot.&rdquo;
            </p>
            <p>
              So here&apos;s what I&apos;ve arranged: download the eBook, read it, and more importantly apply what
              you learn in there.
            </p>
            <p>
              And if you&apos;re not blown away by what you learn, just shoot me an email and request a refund within{' '}
              <HL>30 days.</HL>
            </p>
            <p className="text-xl md:text-2xl font-bold text-[#D4A017]">
              We&apos;ll refund your $7 and let you keep the Shadow Persuasion book free of charge. Along with all
              the bonuses.
            </p>
            <p>How&apos;s that for the world&apos;s best money-back guarantee? I&apos;d say pretty good.</p>
            <p className="text-sm text-[#F4ECD8]/70 italic">
              The only thing that costs you to try this is an afternoon of reading and thirty minutes of your time.
              What you stand to gain is the ability to walk into every important conversation in your life knowing
              you&apos;ll come out the other side with what you came for.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 32. ORDER BOX ═════════ */}
      <section id="order" className="px-6 py-16 md:py-24 bg-[#F4ECD8]">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// CLAIM YOUR COPY //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight max-w-3xl mx-auto">
            Get The Field Manual + 4 Bonuses For <span className="text-[#D4A017]">Just $7</span>
          </h2>
        </div>

        <OrderBox bgVariant="dark" />

        <div className="max-w-2xl mx-auto mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Instant Access', body: 'Full PDF + all 4 bonuses delivered to your inbox in 60 seconds' },
            { title: '30-Day Guarantee', body: 'Refund + keep the book if you\'re not blown away' },
            { title: 'No Subscription', body: 'One-time $7. No hidden continuity. No surprise charges.' },
          ].map((b) => (
            <div key={b.title} className="text-center p-4 border border-[#5C3A1E]/30 bg-white">
              <p className="font-mono text-xs uppercase tracking-wider text-[#D4A017] font-bold mb-1">
                ✓ {b.title}
              </p>
              <p className="text-xs text-[#3B2E1A]">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ 33. FAQ ═════════ */}
      <DocDivider text="// QUESTIONS //" />

      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div>
          <FAQItem
            q="Who is this book for?"
            a={
              <p>
                Anyone who finds themselves losing important conversations they should be winning. Sales professionals.
                Founders raising rounds. People overdue for a raise. Parents whose teenagers have stopped listening.
                Partners stuck in a fight that keeps happening. Anyone navigating a difficult family member, a
                manipulative coworker, a custody mediation, a contractor dispute, or a reconnection with someone they
                haven&apos;t spoken to in years. If you&apos;ve read Cialdini, Voss, or Greene and still feel like
                you&apos;re losing the rooms that matter, this book is for you.
              </p>
            }
          />
          <FAQItem
            q="How is this different from other persuasion books?"
            a={
              <p>
                Every other book teaches you <strong>visible</strong> techniques. Anchoring. Mirroring. Frame control.
                The other person sees you running them and trust drops. This book teaches the 47 tactics that operate{' '}
                <em>below</em> the threshold where the other person can detect them. That&apos;s why they actually work
                in real conversations with sophisticated people.
              </p>
            }
          />
          <FAQItem
            q="Is there a hidden subscription?"
            a={
              <p>
                No. $7 one-time. No continuity. No auto-bill. No surprise charges. We do offer additional products on
                the next page after checkout, but every one of them is optional and you can skip them with one click.
              </p>
            }
          />
          <FAQItem
            q="What format is the book in?"
            a={
              <p>
                Digital PDF. You can read it on your phone, laptop, or print it. The four bonuses come as separate PDFs
                so you can keep the cheatsheets on your phone for reference. Instant download access the moment you
                order.
              </p>
            }
          />
          <FAQItem
            q="What if it doesn't work for me?"
            a={
              <p>
                Email us within 30 days and we&apos;ll refund your $7. You keep the book and all the bonuses. The only
                thing you risk is 30 minutes of your time.
              </p>
            }
          />
          <FAQItem
            q="Why is it so cheap?"
            a={
              <p>
                Because at $7 I can reach 10× more people than at $47. I&apos;d rather get the book into the hands of
                10,000 people who&apos;ll love it than 1,000 who paid full price. I lose money on each individual
                sale and make it back over time as a small percentage of readers want to go deeper.
              </p>
            }
          />
        </div>
      </section>

      {/* ═════════ 34. FINAL CTA ═════════ */}
      <section className="px-6 py-16 md:py-20 bg-black text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
            Stop Losing The Conversations <span className="text-[#D4A017]">That Actually Matter</span>
          </h2>
          <p className="text-base md:text-lg text-[#F4ECD8]/80 mb-10">
            47 tactics. 4 Parts. 4 free bonuses. $7. 30-day money-back guarantee. What are you waiting for?
          </p>

          <div className="mb-10">
            <OrderBox bgVariant="dark" />
          </div>
        </div>
      </section>

      {/* ═════════ 35. SIGNATURE + PS ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto text-base md:text-lg leading-[1.85] text-[#1A1A1A] space-y-5">
        <p>I&apos;ll talk to you in our private community as soon as you download.</p>
        <p>Until then, to your success,</p>
        <p className="text-3xl md:text-4xl italic text-[#1A1A1A]" style={{ fontFamily: 'Brush Script MT, cursive' }}>
          Nate Harlan
        </p>

        <hr className="border-[#5C3A1E]/30 my-8" />

        <div className="bg-[#EBE0C7] border-l-4 border-[#D4A017] p-6">
          <p className="font-bold text-[#1A1A1A] mb-3">
            <strong>P.S.</strong> Remember, the <em>Shadow Persuasion</em> book comes with the BEST money-back
            guarantee in the world.
          </p>
          <p>
            Download it. Read it. Implement it. Win the conversations you used to lose. And if you&apos;re not happy
            for any reason (and I mean ANY reason), just let me know and we&apos;ll refund your $7 and let you keep
            the book and all bonuses.
          </p>
          <p className="mt-4">
            <a href="/checkout/book" className="font-bold uppercase tracking-wider text-[#D4A017] hover:underline">
              [ Download eBook Now → ]
            </a>
          </p>
        </div>
      </section>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="px-6 py-10 bg-[#1A1A1A] text-[#F4ECD8]/60 text-center text-sm">
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="font-mono uppercase tracking-wider text-xs">
            CLASSIFICATION: PUBLIC ACCESS · END OF DOCUMENT · V2
          </p>
          <p>© {new Date().getFullYear()} Shadow Persuasion. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-xs">
            <Link href="/terms" className="hover:text-[#D4A017]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#D4A017]">Privacy</Link>
            <a href="mailto:support@shadowpersuasion.com" className="hover:text-[#D4A017]">Support</a>
          </div>
          <p className="text-xs italic max-w-2xl mx-auto pt-4">
            Disclaimer: Results vary based on background, experience, and effort. Testimonials are from real users but
            not typical. Nothing on this page is a guarantee of any specific outcome. This book is for educational
            purposes only.
          </p>
        </div>
      </footer>
    </main>
  );
}
