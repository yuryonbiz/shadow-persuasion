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
  AlertTriangle,
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
  const isDirect = !paymentIntentId;
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (processing) return;
    setError(null);

    if (!paymentIntentId) {
      // Direct visitor — no saved card to one-click charge. Route them
      // through the book funnel so they can complete the proper flow and
      // see this offer again at the end with the book-buyer rate.
      router.push('/checkout/book');
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
      {/* ═════════ GUARD BANNER (direct visits without pi) ═════════ */}
      {isDirect ? (
        <div className="bg-[#1A1A1A] text-[#F4ECD8] border-b-4 border-[#D4A017]">
          <div className="max-w-4xl mx-auto px-6 py-4 md:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
            <AlertTriangle className="h-6 w-6 text-[#D4A017] shrink-0" />
            <div className="flex-1 text-sm md:text-base leading-snug">
              <p className="font-bold text-[#D4A017] mb-1">The $34.95/mo rate below is the book-buyer price.</p>
              <p className="text-[#F4ECD8]/80">
                Retail on the main site is $99/mo. Start with the $7 book to unlock this rate (and the full funnel with the Playbooks + Vault upsell in between).
              </p>
            </div>
            <a
              href="/checkout/book"
              className="shrink-0 bg-[#D4A017] text-black font-mono uppercase font-bold text-xs md:text-sm px-5 py-3 tracking-wider hover:bg-[#C4901A] transition-colors whitespace-nowrap"
            >
              Get The Book First · $7 →
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-[#8B0000] text-[#F4ECD8] py-3 text-center font-mono uppercase tracking-wider text-sm md:text-base">
          ⚠  <span className="font-bold">ONE FINAL OFFER.</span> Before your order is complete.
        </div>
      )}

      {/* ═════════ 1. HERO ═════════ */}
      <section className="px-6 pt-10 pb-12 md:pt-14 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#5C3A1E] mb-5 text-center">
            // ONE-TIME OFFER · BOOK BUYERS ONLY //
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-5 text-center">
            You Have The Book.<br/>
            <span className="text-[#D4A017]">Now Make It Actually Usable When Real Conversations Hit.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#3B2E1A] max-w-3xl mx-auto leading-snug mb-8 text-center">
            Introducing the Shadow Persuasion app. The AI coach that picks the <HL>right 3 tactics for your specific conversation</HL>, writes your opening in your own voice, and lets you rehearse it before it&apos;s real.
          </p>

          <div className="bg-[#1A1A1A] text-[#F4ECD8] p-6 md:p-8 max-w-3xl mx-auto border-4 border-[#D4A017] shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4A017] mb-4">
              // THE AWKWARD TRUTH ABOUT READING A 117-PAGE BOOK //
            </p>
            <p className="text-lg md:text-xl leading-relaxed mb-4">
              By Wednesday morning when your manager pulls you into her office, the 3 tactics that fit this exact situation aren&apos;t going to be at the top of your head. You&apos;ll reach for what you always reach for. The book becomes reference.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              Reference doesn&apos;t win conversations. Deployment does.
            </p>
          </div>

          <div className="bg-white border-4 border-black p-6 md:p-7 max-w-3xl mx-auto shadow-[8px_8px_0_0_#D4A017] mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#5C3A1E] mb-4">
              // WHAT THE APP DOES, STEP BY STEP //
            </p>
            <p className="text-base md:text-lg text-[#1A1A1A] leading-relaxed mb-4">
              Paste the Slack thread. Screenshot the text from your ex. Or just describe what&apos;s going on with your contractor in two sentences.
            </p>
            <p className="text-base md:text-lg text-[#1A1A1A] leading-relaxed mb-4">
              Sixty seconds later the app hands you four things:
            </p>
            <ul className="space-y-2.5 text-base md:text-lg text-[#1A1A1A] mb-4">
              <li className="flex items-start gap-3">
                <span className="font-mono font-black text-[#D4A017] mt-0.5">01</span>
                <span>The exact 3 tactics that fit (out of 700+), ranked by relevance to your specific situation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono font-black text-[#D4A017] mt-0.5">02</span>
                <span>Your opening line, written word-for-word, in a voice that already sounds like how you actually talk.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono font-black text-[#D4A017] mt-0.5">03</span>
                <span>A role-play session where you rehearse against an AI playing the other person. It pushes back the way they will.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono font-black text-[#D4A017] mt-0.5">04</span>
                <span>A debrief after the real conversation happens, telling you what landed and what didn&apos;t, so next time is sharper.</span>
              </li>
            </ul>
            <p className="text-sm md:text-base text-[#5C3A1E] italic">
              Everything above runs on the same 700-technique knowledge base the book was pulled from.
            </p>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-base md:text-lg text-[#3B2E1A]">
              Retail on the main site: <span className="text-gray-500 line-through">$99/mo</span>. For book buyers on this page: <strong className="text-[#1A1A1A]">$34.95/mo, or $195.95/yr.</strong>
            </p>
            <p className="text-xs md:text-sm text-[#5C3A1E] mt-2">
              30-day money-back guarantee. Cancel anytime. Same card you just paid with.
            </p>
          </div>
        </div>
      </section>


      {/* ═════════ 2. THE PROBLEM (books can't) ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3 text-center">
            // WHY THE BOOK ALONE ISN&apos;T ENOUGH //
          </p>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            Six Things The Book <HL>Can&apos;t Do For You</HL>.<br/>
            The App Does All Of Them.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Read the screenshot of the text your ex sent last night and spot the four manipulation moves running through it',
              'Rewrite your draft message to your boss so it sounds sharper without sounding fake',
              'Rehearse Wednesday\'s salary talk with you three times against an AI that pushes back the way she will',
              'Remember that your father shuts down to questions but opens up to stories, and factor that into every script',
              'Look at your last ten hard conversations and tell you which ones you won, which ones leaked, and why',
              'Drop a 7-minute practice mission into your inbox every day and grade how you handled it',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border-2 border-[#8B0000]/30 p-4">
                <X className="h-5 w-5 text-[#8B0000] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-sm md:text-base text-[#1A1A1A] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-base md:text-lg text-[#1A1A1A] max-w-2xl mx-auto">
            Every single one of those is a module inside the app.
          </p>
        </div>
      </section>

      {/* ═════════ 3. WHAT IS THE APP ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// WHAT YOU GET //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
            10 Operational Modules. <span className="text-[#D4A017]">One Coach.</span>
          </h2>
          <p className="text-lg md:text-xl text-[#3B2E1A] max-w-3xl mx-auto">
            Every capability below is live inside the app the moment your membership starts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              icon: Brain,
              title: 'AI Strategic Coach',
              body: 'Describe any situation in 2 sentences. Get a full tactical game plan with word-for-word scripts in under 60 seconds. Runs 24/7. Built on 700+ techniques from the knowledge base the book was derived from.',
            },
            {
              icon: MessageSquare,
              title: 'Conversation Analysis Engine',
              body: 'Screenshot any text thread or paste any email. The AI identifies the manipulation tactics being run on you, maps the power imbalance, surfaces hidden intentions, and hands you the counter-script for each.',
            },
            {
              icon: Target,
              title: 'Training Arena (Role-Play)',
              body: 'Rehearse the real conversation against an AI that plays the other person. It pushes back the way they will. You get real-time coaching as you respond. Post-session debrief tells you what you missed.',
            },
            {
              icon: Users,
              title: 'Voice Profile',
              body: 'The app learns your natural writing style over your first 10 uses. Every script it generates afterward sounds like you wrote it. Not like a persuasion robot. This is the single biggest reason people stick with it.',
            },
            {
              icon: BookOpen,
              title: 'People Profiles',
              body: 'Build a profile for each person who matters: your manager, your ex, your contractor, your teenager, your cofounder. Track every interaction, log what worked. The app builds per-person strategies that get sharper every month.',
            },
            {
              icon: TrendingUp,
              title: 'Field Ops + Persuasion Score',
              body: 'Daily missions push you to deploy one specific tactic in a real conversation. Submit a field report. The AI grades your execution. Progress tracked as XP and skill levels so you actually see yourself getting better.',
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

        <p className="mt-10 text-center text-sm md:text-base text-[#5C3A1E] italic max-w-3xl mx-auto">
          Plus the Message Optimizer, the Quick-Fire Mode, the full 700+ technique library, and a private operator community. All included in the same membership.
        </p>
      </section>

      {/* ═════════ 4. HOW IT FITS ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017]/80 mb-3 text-center">
            // YOUR FULL STACK AFTER TODAY //
          </p>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-10 text-center">
            Four Layers. <span className="text-[#D4A017]">One Operator.</span>{' '}You.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { level: 'Layer 1', title: 'The Book', body: '47 foundational tactics. The theory.' },
              { level: 'Layer 2', title: 'Briefing + Playbooks', body: '20 situation scripts plus prep worksheet. The prep.' },
              { level: 'Layer 3', title: 'The Vault', body: '250 techniques indexed for edge cases. The reference.' },
              { level: 'Layer 4', title: 'The App', body: 'All 700+ techniques, live, picking themselves for your real conversations.' },
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
            The first three are what you read. The app is what sits next to you on Wednesday at 2pm.
          </p>
        </div>
      </section>

      {/* ═════════ 5. PRICING ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// LOCK IN THE BOOK-BUYER RATE //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-3">
            Pick Your Plan.
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A] max-w-xl mx-auto">
            One click charges the same card you just used for the book. Cancel anytime with one email. 30-day money-back on the first payment.
          </p>
          <p className="text-sm text-[#3B2E1A] mt-4 max-w-xl mx-auto italic">
            Heads up: most operators pick annual. The daily practice takes about a year to actually rewire how you prep. Which is why the yearly plan is priced so you get four months free compared to paying monthly.
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
                <p className="text-xs text-[#5C3A1E] mt-2">No commitment. Cancel when you want.</p>
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
                <p className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E] mb-1">Annual · Most picked</p>
                <p className="text-3xl md:text-4xl font-black text-[#1A1A1A]">$195.95<span className="text-sm font-normal text-[#5C3A1E]">/yr</span></p>
                <p className="text-xs text-[#5C3A1E] mt-2">Works out to $16.33/mo. Four months free vs paying monthly.</p>
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
            {processing
              ? 'Starting Membership…'
              : isDirect
              ? 'GET THE BOOK FIRST → $7'
              : `✓ YES. UNLOCK THE COACH (${btnLabel}).`}
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
              &ldquo;I used to over-prep for two days before any pricing call with a vendor. Now I paste the Slack thread into the app the night before, get three tactics back, role-play once. Done in twenty minutes. I&apos;ve done it before twenty-three vendor calls this quarter. My calendar got its life back.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C3A1E] to-[#1A1A1A] flex items-center justify-center text-[#F4ECD8] font-mono font-bold">
                P
              </div>
              <div>
                <p className="font-mono font-bold text-[#1A1A1A]">Priya R.</p>
                <p className="text-xs text-[#5C3A1E] uppercase tracking-wide">Senior PM · Monthly Member</p>
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
            <span className="text-[#D4A017]">30-Day Money-Back.</span> Even On The Membership.
          </h2>
          <p className="text-base md:text-lg text-[#F4ECD8]/90 leading-relaxed mb-5">
            Run five real conversations through the app in 30 days. If you can&apos;t point to at least one that went better because of it, email me the word &ldquo;refund&rdquo; and I send back the full first payment. Monthly or annual.
          </p>
          <p className="text-sm text-[#F4ECD8]/70 italic">
            You&apos;re not committed to anything. Try it for a month.
          </p>
        </div>
      </section>

      {/* ═════════ 8. FINAL CTA + DECLINE ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-3">
            Wednesday Is Still Coming.
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A]">
            Walk in ready, or walk in the way you always have.
          </p>
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
            {processing
              ? 'Starting Membership…'
              : isDirect
              ? 'GET THE BOOK FIRST → $7'
              : `✓ START MEMBERSHIP (${btnLabel}).`}
          </button>
        </div>

        <div className="text-center">
          <a
            href="/lp/thank-you"
            onClick={handleDecline}
            className="inline-flex items-center gap-2 text-sm text-[#5C3A1E] hover:text-[#1A1A1A] underline"
          >
            <X className="h-4 w-4" />
            No thanks. I&apos;ll stick with what I already have.
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
