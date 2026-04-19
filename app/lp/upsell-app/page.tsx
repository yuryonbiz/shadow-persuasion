'use client';

/* ════════════════════════════════════════════════════════════
   /lp/upsell-app — Upsell #2 (Final)

   Pitches the shadowpersuasion.com SaaS as the real-time coach
   layer on top of the books. Default plan: Monthly ($34.95).
   Annual ($195.95) shown as "save $224/yr" alternative.

   Accept → /api/checkout/upsell-app (one-click subscription)
          → /lp/thank-you
   Decline → /lp/thank-you
   ════════════════════════════════════════════════════════════ */

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Special_Elite } from 'next/font/google';
import {
  CheckCircle,
  Shield,
  Lock,
  Zap,
  Sparkles,
  X,
  Brain,
  MessageSquare,
  Users,
  Target,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

const HL = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{ background: 'rgba(212, 160, 23, 0.30)', padding: '0 4px', borderRadius: 2 }}
    className="font-semibold"
  >
    {children}
  </span>
);

export default function UpsellAppPage() {
  return (
    <Suspense fallback={null}>
      <UpsellAppInner />
    </Suspense>
  );
}

function UpsellAppInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('pi');
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (processing) return;
    setError(null);

    if (!paymentIntentId) {
      router.push('/lp/book');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/checkout/upsell-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Subscription failed. Please try again.');
      }
      router.push(`/lp/thank-you?pi=${paymentIntentId}&sub=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setProcessing(false);
    }
  }

  function handleDecline(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    router.push(`/lp/thank-you?pi=${paymentIntentId || ''}`);
  }

  const price = plan === 'monthly' ? '$34.95/mo' : '$195.95/yr';
  const btnLabel = plan === 'monthly' ? '$34.95/month' : '$195.95/year';

  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] overflow-x-hidden`}>
      {/* ═════════ URGENCY BANNER ═════════ */}
      <div className="bg-[#8B0000] text-[#F4ECD8] py-3 text-center font-mono uppercase tracking-wider text-sm md:text-base">
        ⚠  <span className="font-bold">ONE FINAL OFFER</span> — Before your order is complete.
      </div>

      {/* ═════════ 1. HERO ═════════ */}
      <section className="px-6 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#5C3A1E] mb-4">
            // THE MISSING PIECE · MEMBERS-ONLY OFFER //
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
            You Have The Manuals.<br/>
            <span className="text-[#D4A017]">Now Get The Coach.</span>
          </h1>

          <div className="bg-[#1A1A1A] text-[#F4ECD8] p-6 md:p-8 max-w-3xl mx-auto border-4 border-[#D4A017] shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] mb-10">
            <p className="text-lg md:text-xl leading-relaxed mb-4">
              Books teach you the tactics. Playbooks map them to 20 situations. The Vault extends them to 250 techniques.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              But none of them know <HL>the specific conversation you&apos;re about to have</HL>{' '}on Wednesday.
            </p>
          </div>

          <p className="text-xl md:text-2xl text-[#3B2E1A] max-w-3xl mx-auto leading-relaxed">
            You need a coach that does.
          </p>
        </div>
      </section>

      {/* ═════════ 2. THE PROBLEM ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            Here&apos;s What The Books Can&apos;t Do For You
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              'Know that your boss Angela responds better to written proposals than verbal pitches',
              'Remember that last time you tried the Cold Open with your father, he shut down',
              'Role-play your Wednesday salary conversation with you, 3 times, before you walk in',
              'Tell you which of your last 5 hard conversations went well and which ones leaked detector',
              'Build a review schedule so you don\'t forget the tactics in 30 days',
              'Match a specific situation you describe to the exact 3 techniques from 697 that fit it',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border-2 border-[#8B0000]/30 p-4">
                <X className="h-5 w-5 text-[#8B0000] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-sm md:text-base text-[#1A1A1A] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-base md:text-lg text-[#1A1A1A] max-w-2xl mx-auto italic">
            That&apos;s what the Shadow Persuasion app does. Every day. Personalized to you.
          </p>
        </div>
      </section>

      {/* ═════════ 3. WHAT IS THE APP ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// MEET THE APP //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
            <span className="text-[#D4A017]">shadowpersuasion.com</span>
          </h2>
          <p className="text-lg md:text-xl text-[#3B2E1A] max-w-3xl mx-auto">
            The AI-powered coach built on the same 697-technique knowledge base the book was derived from.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              icon: Brain,
              title: 'Describe Any Situation, Get Your 3 Tactics',
              body: 'Paste the Slack thread, describe the conversation, name the person. The AI tells you the exact 3 techniques from 697 that fit this specific situation, based on everything the book teaches. Personalized in under 10 seconds.',
            },
            {
              icon: MessageSquare,
              title: 'Role-Play Before You Walk In',
              body: 'Rehearse Wednesday\'s salary conversation with an AI playing your manager. The AI pushes back the way she would, based on the patterns you\'ve described. Walk into the real conversation having already done it 3 times.',
            },
            {
              icon: TrendingUp,
              title: 'Daily Practice, Spaced-Repetition',
              body: 'The 7-minute daily practice from Chapter 16, automated. One technique per day, timed to the spacing curve that actually builds long-term recall. You stop forgetting what you read.',
            },
            {
              icon: Users,
              title: '1,200+ Member Community',
              body: 'Private community of Shadow Persuasion readers sharing wins, debriefs, and edge cases. Access real transcripts other operators have shared. Learn from conversations you\'ll never have yourself.',
            },
            {
              icon: Target,
              title: 'Track Every Conversation',
              body: 'Log each important conversation, tag which tactics you used, flag what worked and what didn\'t. Over weeks the app starts recognizing YOUR patterns and flagging them back to you.',
            },
            {
              icon: BookOpen,
              title: 'Access To 697 Techniques (Not Just 250)',
              body: 'The book has 47. The Vault has 250. The app has all 697, cross-referenced by situation, tactic type, risk level, and domain. When the book isn\'t enough, the app is the last stop.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white border-2 border-[#5C3A1E]/40 p-6 md:p-7 shadow-[6px_6px_0_0_rgba(0,0,0,0.08)]">
              <item.icon className="h-10 w-10 text-[#D4A017] mb-4" />
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
                {item.title}
              </h3>
              <p className="text-sm md:text-base text-[#3B2E1A] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ 4. HOW IT FITS ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-10 text-center">
            Here&apos;s How It All <span className="text-[#D4A017]">Stacks Together</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { level: 'Layer 1', title: 'The Book', body: '47 tactics. The foundational knowledge.' },
              { level: 'Layer 2', title: 'Briefing + Playbooks', body: 'Prep for specific conversations.' },
              { level: 'Layer 3', title: 'The Vault', body: '250 techniques for edge cases.' },
              { level: 'Layer 4', title: 'The App', body: 'Personalized real-time coach. All 697 techniques.' },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-5 border-2 ${
                  i === 3 ? 'bg-[#D4A017] border-[#D4A017] text-black' : 'bg-[#2A1F0E] border-[#D4A017]/40 text-[#F4ECD8]'
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-wider opacity-70 mb-2">{item.level}</p>
                <h3 className={`font-bold text-base md:text-lg uppercase tracking-wider mb-2 ${
                  i === 3 ? 'text-black' : 'text-[#D4A017]'
                }`}>
                  {item.title}
                </h3>
                <p className={`text-xs md:text-sm leading-relaxed ${
                  i === 3 ? 'text-black/85' : 'text-[#F4ECD8]/85'
                }`}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-lg md:text-xl text-[#F4ECD8]/90 italic max-w-2xl mx-auto">
            The first three give you knowledge. The app is the difference between knowing and doing.
          </p>
        </div>
      </section>

      {/* ═════════ 5. PRICING ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// MEMBERSHIP //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-3">
            Start Your Membership Today
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A]">
            Cancel anytime. No long-term commitment. We&apos;ll use the card you just paid with, one click.
          </p>
        </div>

        {/* Plan selector */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setPlan('monthly')}
            className={`p-6 border-4 text-left transition-all ${
              plan === 'monthly'
                ? 'border-[#D4A017] bg-[#FFF7DC] shadow-[6px_6px_0_0_#1A1A1A]'
                : 'border-[#5C3A1E]/30 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.08)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={plan === 'monthly'}
                readOnly
                className="mt-1 h-5 w-5 accent-[#D4A017]"
              />
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E] mb-1">Monthly</p>
                <p className="text-3xl md:text-4xl font-black text-[#1A1A1A]">$34.95<span className="text-sm font-normal text-[#5C3A1E]">/mo</span></p>
                <p className="text-xs text-[#5C3A1E] mt-2">Cancel anytime. No commitment.</p>
              </div>
            </div>
          </button>

          {/* Yearly */}
          <button
            type="button"
            onClick={() => setPlan('yearly')}
            className={`p-6 border-4 text-left transition-all relative ${
              plan === 'yearly'
                ? 'border-[#D4A017] bg-[#FFF7DC] shadow-[6px_6px_0_0_#1A1A1A]'
                : 'border-[#5C3A1E]/30 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.08)]'
            }`}
          >
            <span className="absolute -top-3 -right-3 bg-[#8B0000] text-[#F4ECD8] px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-bold">
              Save $224
            </span>
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={plan === 'yearly'}
                readOnly
                className="mt-1 h-5 w-5 accent-[#D4A017]"
              />
              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E] mb-1">Annual</p>
                <p className="text-3xl md:text-4xl font-black text-[#1A1A1A]">$195.95<span className="text-sm font-normal text-[#5C3A1E]">/yr</span></p>
                <p className="text-xs text-[#5C3A1E] mt-2">~$16.33/mo · Full year access.</p>
              </div>
            </div>
          </button>
        </div>

        {/* BIG YES BUTTON */}
        <div className="bg-black border-4 border-[#D4A017] p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017] text-center mb-4">
            Selected: <strong>{price}</strong> · Charged to the card you used for the book
          </p>
          <button
            type="button"
            onClick={handleAccept}
            disabled={processing}
            className="w-full bg-[#D4A017] hover:bg-[#C4901A] disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono uppercase font-black text-lg md:text-2xl text-center px-6 py-5 md:py-6 tracking-wider transition-all shadow-[6px_6px_0_0_#F4ECD8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#F4ECD8] mb-4"
          >
            {processing ? 'Starting Membership…' : `✓ YES — START MY MEMBERSHIP (${btnLabel})`}
          </button>

          {error && (
            <div className="bg-[#8B0000]/20 border border-[#8B0000] text-[#F4ECD8] p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-[#F4ECD8]/70">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> One-click · Same card</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 30-day money-back</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ═════════ 6. TESTIMONIAL ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-2 border-[#5C3A1E]/30 p-6 md:p-10 shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
            <Sparkles className="h-8 w-8 text-[#D4A017] mx-auto mb-4" />
            <p className="text-lg md:text-xl italic text-[#1A1A1A] text-center leading-relaxed mb-6">
              &ldquo;The book and the playbooks are great. But the app is what actually changed my life. I&apos;ve run 60+ important conversations through the app over four months. The role-play mode alone is worth 10x the monthly fee. I have never walked into a high-stakes conversation unprepared again.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C3A1E] to-[#1A1A1A] flex items-center justify-center text-[#F4ECD8] font-mono font-bold">
                P
              </div>
              <div>
                <p className="font-mono font-bold text-[#1A1A1A]">Priya R.</p>
                <p className="text-xs text-[#5C3A1E] uppercase tracking-wide">Product Manager · Monthly Member 4 Months</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ 7. GUARANTEE ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-16 w-16 text-[#D4A017] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-6">
            <span className="text-[#D4A017]">30-Day Money-Back</span> — Even On The Membership
          </h2>
          <p className="text-base md:text-lg text-[#F4ECD8]/90 leading-relaxed mb-5">
            Use the app for 30 days. Run real conversations through it. If it doesn&apos;t make a visible difference, email me and I&apos;ll refund the entire first payment. Monthly or annual. No questions.
          </p>
          <p className="text-sm text-[#F4ECD8]/70 italic">
            You&apos;re not committed to anything. Just try it for a month.
          </p>
        </div>
      </section>

      {/* ═════════ 8. FINAL CTA + DECLINE ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">
            Ready To Stop Walking Into Conversations Unprepared?
          </h2>
        </div>

        <div className="bg-black text-[#F4ECD8] border-4 border-[#D4A017] p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] mb-6 text-center">
          <p className="text-lg md:text-xl mb-5">
            Selected: <strong className="text-[#D4A017]">{price}</strong>
          </p>
          <button
            type="button"
            onClick={handleAccept}
            disabled={processing}
            className="w-full bg-[#D4A017] hover:bg-[#C4901A] disabled:opacity-50 text-black font-mono uppercase font-black text-base md:text-xl text-center px-6 py-5 tracking-wider transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]"
          >
            {processing ? 'Starting Membership…' : `✓ START MEMBERSHIP (${btnLabel})`}
          </button>
        </div>

        <div className="text-center">
          <a
            href="/lp/thank-you"
            onClick={handleDecline}
            className="inline-flex items-center gap-2 text-sm text-[#5C3A1E] hover:text-[#1A1A1A] underline"
          >
            <X className="h-4 w-4" />
            No thanks — I&apos;ll stick with what I already have
          </a>
        </div>
      </section>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="px-6 py-8 bg-[#1A1A1A] text-[#F4ECD8]/60 text-center text-sm">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="font-mono uppercase tracking-wider text-xs">
            CLASSIFICATION: MEMBERS-ONLY OFFER · BOOK BUYERS
          </p>
          <p>© {new Date().getFullYear()} Shadow Persuasion. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
