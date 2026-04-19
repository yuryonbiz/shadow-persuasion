'use client';

/* ════════════════════════════════════════════════════════════
   /lp/upsell-playbooks — Upsell #1 (Post-Checkout)

   Shown immediately after the $7 book checkout completes.
   Offers the Situation Playbooks + Shadow Persuasion Vault bundle
   as a one-time, one-click upsell at $47 (stacked value $84).

   Decline → /lp/upsell-app (Upsell #2, the SaaS)
   Accept  → one-click charge card on file, then /lp/upsell-app
   ════════════════════════════════════════════════════════════ */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Special_Elite } from 'next/font/google';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  AlertTriangle,
  Lock,
  Zap,
  Sparkles,
  X,
  BookOpen,
  Target,
  Library,
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

/* ─────────────── Urgency countdown timer ─────────────── */
function Countdown() {
  const [time, setTime] = useState({ min: 14, sec: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        if (prev.min === 0 && prev.sec === 0) return prev;
        if (prev.sec === 0) return { min: prev.min - 1, sec: 59 };
        return { ...prev, sec: prev.sec - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono font-bold tabular-nums">
      {String(time.min).padStart(2, '0')}:{String(time.sec).padStart(2, '0')}
    </span>
  );
}

export default function UpsellPlaybooksPage() {
  return (
    <Suspense fallback={null}>
      <UpsellPlaybooksInner />
    </Suspense>
  );
}

function UpsellPlaybooksInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('pi');
  const isDirect = !paymentIntentId;
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (processing) return;
    setError(null);

    if (!paymentIntentId) {
      // Visited directly (no prior book purchase). Route them through the
      // real funnel entry instead of one-click-charging a card they haven't given us.
      router.push('/checkout/book');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/checkout/upsell-playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Charge failed. Please try again.');
      }
      // Success → move on to upsell #2 (the SaaS)
      router.push('/lp/upsell-app?pi=' + paymentIntentId + '&upsell1=accepted');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setProcessing(false);
    }
  }

  function handleDecline(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    router.push('/lp/upsell-app?pi=' + (paymentIntentId || '') + '&upsell1=declined');
  }

  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] overflow-x-hidden`}>
      {/* ═════════ GUARD BANNER (direct visits without pi) ═════════ */}
      {isDirect ? (
        <div className="bg-[#1A1A1A] text-[#F4ECD8] border-b-4 border-[#D4A017]">
          <div className="max-w-4xl mx-auto px-6 py-4 md:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
            <AlertTriangle className="h-6 w-6 text-[#D4A017] shrink-0" />
            <div className="flex-1 text-sm md:text-base leading-snug">
              <p className="font-bold text-[#D4A017] mb-1">This bundle is only available after buying the Shadow Persuasion book.</p>
              <p className="text-[#F4ECD8]/80">
                The Playbooks reference the book&apos;s 47 tactics by name. Start with the book ($7) and this offer appears automatically at checkout.
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
          ⚠  <span className="font-bold">WAIT.</span> Your order isn&apos;t quite finished. This offer expires in <Countdown />.
        </div>
      )}

      {/* ═════════ 1. HERO ═════════ */}
      <section className="px-6 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#5C3A1E] mb-4">
            // ONE-TIME OFFER · FIELD MANUAL BUYERS ONLY //
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
            Before You Close This Page:<br/>
            <span className="text-[#D4A017]">There&apos;s One Thing The Book Can&apos;t Do For You.</span>
          </h1>

          <div className="bg-[#1A1A1A] text-[#F4ECD8] p-6 md:p-8 max-w-3xl mx-auto border-4 border-[#D4A017] shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] mb-10">
            <p className="text-lg md:text-xl leading-relaxed mb-4">
              Your payment for <strong>Shadow Persuasion</strong> cleared. The book is hitting your inbox as you read this.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              Give me ninety seconds before you close this tab. There&apos;s something the regular site doesn&apos;t sell, and I only show it to new operators right now, once, at this exact moment. <HL>Not at this price. Never bundled like this again.</HL>
            </p>
          </div>

          <p className="text-xl md:text-2xl text-[#3B2E1A] max-w-3xl mx-auto leading-relaxed mb-4">
            You&apos;re about to read the book. You&apos;ll know all 47 tactics exist.
          </p>
          <p className="text-xl md:text-2xl font-bold text-[#1A1A1A] max-w-3xl mx-auto leading-relaxed">
            Here&apos;s what the book can&apos;t do for you on Wednesday morning.
          </p>
        </div>
      </section>

      {/* ═════════ 2. THE PROBLEM ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            The Book Teaches You The 47 Tactics. It Can&apos;t Tell You <HL>Which Three To Use In The Conversation You Walk Into Wednesday</HL>.
          </h2>

          <div className="space-y-5 text-base md:text-lg leading-relaxed text-[#1A1A1A]">
            <p>
              Pick whichever one is real for you. The salary review Tuesday. The custody mediation two weeks out. The thing you need to say to your partner tonight, except you don&apos;t know how to start it. A job interview Thursday. An estranged parent showing up at a wedding next month.
            </p>
            <p>
              Every one of those is a completely different conversation with completely different dynamics. <strong>Each one calls for three or four specific tactics out of the 47</strong>. The book gives you all 47. It doesn&apos;t hand you the exact three for Wednesday morning.
            </p>
            <p>
              So here&apos;s what usually happens. You read the book, you feel sharper for about five days, and then Wednesday arrives and you&apos;re flipping pages in the hallway trying to remember which one was the Assumption Audit. You walk in doing what you&apos;ve always done.
            </p>
            <p className="text-lg md:text-xl font-bold text-[#8B0000]">
              That&apos;s the gap this next offer closes.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 3. THE TWO PRODUCTS ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// TODAY ONLY //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
            I&apos;ll Add <span className="text-[#D4A017]">Two More Products</span>{' '}To Your Order<br />
            That Solve This Exact Problem
          </h2>
          <p className="text-lg md:text-xl text-[#3B2E1A] max-w-3xl mx-auto">
            Together they turn the book from something you read into something you use when it actually counts. Retail, they cost $84. Today, bundled with your order: <strong className="text-[#1A1A1A]">$47.</strong>
          </p>
        </div>

        {/* Product 1: Situation Playbooks */}
        <div className="bg-white border-4 border-black p-6 md:p-10 shadow-[10px_10px_0_0_#D4A017] mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover mockup */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-48 md:w-56 h-64 md:h-80 bg-[#F4ECD8] border-4 border-[#5C3A1E] p-5 transform -rotate-2 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#5C3A1E] text-center mb-3">
                  // THE FIELD LIBRARY //
                </p>
                <h3 className="text-xl md:text-2xl font-black uppercase text-[#1A1A1A] text-center leading-tight mb-4">
                  The Situation Playbooks
                </h3>
                <div className="w-16 h-[2px] bg-[#D4A017] mx-auto mb-3" />
                <p className="text-[10px] text-[#5C3A1E] italic text-center mb-6">
                  20 Playbooks For The Conversations That Actually Decide Your Life
                </p>
                <div className="bg-[#1A1A1A] text-[#D4A017] font-mono font-black text-3xl text-center py-2">
                  20
                </div>
                <p className="text-[9px] text-[#5C3A1E] uppercase tracking-wider text-center mt-2">PLAYBOOKS</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#5C3A1E] text-center mt-6">
                  NATE HARLAN
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#D4A017] text-black px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold">
                  Product 1 of 2
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E]">
                  Retail Value: <span className="line-through">$47</span>
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1A1A1A] mb-4">
                The Situation Playbooks
              </h3>
              <p className="text-base md:text-lg text-[#3B2E1A] leading-relaxed mb-5">
                20 deep-dive playbooks for the specific conversations that actually decide your life. Each playbook gives you the 3 book tactics that fit, a word-for-word opening line, the 2 objections you&apos;ll hit with pre-drafted responses, your exit move, and the mistake to avoid.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {[
                  'Salary Negotiation',
                  'First Date Conversation',
                  'The DTR Talk',
                  'Initiating A Breakup',
                  'Getting An Ex Back',
                  'Cheating Confrontation',
                  'Hostile Boss',
                  'Custody Mediation',
                  'Estranged Family Reconciliation',
                  'Quitting A Job',
                  'Contractor Dispute',
                  '+ 9 more',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                    <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#5C3A1E] italic">
                Pull up the playbook. Read it in 10 minutes. Fill out the Pre-Conversation Briefing. Walk in prepared.
              </p>
            </div>
          </div>
        </div>

        {/* Product 2: The Vault */}
        <div className="bg-white border-4 border-black p-6 md:p-10 shadow-[10px_10px_0_0_#D4A017]">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover mockup */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-48 md:w-56 h-64 md:h-80 bg-[#F4ECD8] border-4 border-[#5C3A1E] p-5 transform rotate-2 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#5C3A1E] text-center mb-3">
                  // THE COMPLETE VAULT //
                </p>
                <h3 className="text-xl md:text-2xl font-black uppercase text-[#1A1A1A] text-center leading-tight mb-4">
                  Shadow Persuasion<br/>Vault
                </h3>
                <div className="w-16 h-[2px] bg-[#D4A017] mx-auto mb-3" />
                <p className="text-[10px] text-[#5C3A1E] italic text-center mb-6">
                  250 Field-Tested Techniques With Full Deployment Breakdowns
                </p>
                <div className="bg-[#1A1A1A] text-[#D4A017] font-mono font-black text-3xl text-center py-2">
                  250
                </div>
                <p className="text-[9px] text-[#5C3A1E] uppercase tracking-wider text-center mt-2">TECHNIQUES</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#5C3A1E] text-center mt-6">
                  NATE HARLAN
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#D4A017] text-black px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold">
                  Product 2 of 2
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#5C3A1E]">
                  Retail Value: <span className="line-through">$37</span>
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1A1A1A] mb-4">
                The Shadow Persuasion Vault
              </h3>
              <p className="text-base md:text-lg text-[#3B2E1A] leading-relaxed mb-5">
                The book has 47 tactics. The Vault has <strong>250</strong>. Organized into 10 parts (openers, rapport, silence &amp; timing, reframing, objection handling, defense against manipulation, reading the room, closes, lock-ins, and more). Every technique has the same structure: USE WHEN, HOW IT WORKS, DEPLOY, COUNTER.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {[
                  '25 Openers & Detector Disablers',
                  '25 Rapport-Without-Rapport moves',
                  '25 Make-Them-Persuade-Themselves plays',
                  '25 Silence, Pauses, and Timing weapons',
                  '25 Reframes and Frame Control moves',
                  '25 Objection & Pushback handlers',
                  '25 Defensive Anti-Manipulation tools',
                  '25 Reading-The-Room techniques',
                  '25 Closes Without Closing',
                  '25 Post-Conversation Lock-Ins',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                    <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#5C3A1E] italic">
                The complete reference library. When the book isn&apos;t enough, this is.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ 4. HOW THEY WORK TOGETHER ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
            Here&apos;s Why These Two Products <span className="text-[#D4A017]">Work Together</span>{' '}Better Than Either One Alone
          </h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: BookOpen,
                title: 'The Book',
                body: 'Teaches you the 47 core tactics and the 4-part system. Core education. You\'ve got it.',
              },
              {
                icon: Target,
                title: 'The Playbooks',
                body: 'Maps those 47 tactics to 20 specific conversation types. Tells you exactly which to use when.',
              },
              {
                icon: Library,
                title: 'The Vault',
                body: 'Extends the 47 to 250 techniques. For the edge cases the playbooks don\'t cover, or when you want more depth.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#2A1F0E] border-2 border-[#D4A017]/40 p-6 text-center">
                <item.icon className="h-10 w-10 text-[#D4A017] mx-auto mb-3" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-[#D4A017] mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-[#F4ECD8]/85 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-base md:text-lg text-[#F4ECD8]/90 italic max-w-2xl mx-auto">
              The book gives you the theory. The Playbooks hand you the right tactic for Wednesday. The Vault is what you open when the playbooks don&apos;t cover it. Run all three and you stop walking into conversations hoping you&apos;ll figure it out.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ 5. STACKED VALUE + OFFER ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">// HERE&apos;S WHAT YOU GET //</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Your One-Time Upgrade Stack
          </h2>
        </div>

        <div className="bg-white border-4 border-black p-6 md:p-10 shadow-[10px_10px_0_0_#D4A017]">
          <div className="space-y-4 mb-8">
            {[
              { name: 'The Situation Playbooks', detail: '20 playbooks, 2-3 pages each, every major conversation covered', value: '$47' },
              { name: 'The Shadow Persuasion Vault', detail: '250 techniques, organized into 10 parts, full deployment breakdowns', value: '$37' },
            ].map((item) => (
              <div key={item.name} className="flex items-start justify-between gap-4 pb-4 border-b border-[#5C3A1E]/20 last:border-b-0">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-6 w-6 text-[#D4A017] shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-base md:text-lg text-[#1A1A1A]">{item.name}</p>
                    <p className="text-sm text-[#5C3A1E]">{item.detail}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-lg text-[#5C3A1E]">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F4ECD8] border-2 border-[#5C3A1E]/30 p-5 text-center mb-6">
            <p className="text-sm text-[#5C3A1E] uppercase tracking-wider mb-2">Total stacked value</p>
            <p className="text-3xl md:text-4xl font-black text-[#5C3A1E] line-through">$84</p>
          </div>

          <div className="bg-black text-[#F4ECD8] border-4 border-[#D4A017] p-6 md:p-8 text-center mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017] mb-3">
              Yours Today · One-Time Upgrade
            </p>
            <div className="flex items-baseline justify-center gap-3 mb-2">
              <span className="text-2xl line-through text-[#F4ECD8]/40">$84</span>
              <span className="text-6xl md:text-7xl font-black text-[#D4A017]">$47</span>
            </div>
            <p className="text-sm text-[#D4A017] font-bold uppercase tracking-wider">
              Save $37 · 44% Off
            </p>
          </div>

          {/* BIG YES BUTTON */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={processing}
            className="block w-full bg-[#D4A017] hover:bg-[#C4901A] disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono uppercase font-black text-lg md:text-2xl text-center px-6 py-5 md:py-6 tracking-wider transition-all shadow-[6px_6px_0_0_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#1A1A1A] mb-4"
          >
            {processing
              ? 'Processing…'
              : isDirect
              ? 'GET THE BOOK FIRST → $7'
              : '✓ YES. LOCK IN MY $47 UPGRADE.'}
          </button>

          {error && (
            <div className="bg-[#8B0000]/10 border border-[#8B0000] text-[#8B0000] p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <p className="text-center text-xs text-[#5C3A1E] mb-4">
            One-click. We&apos;ll charge the card you just used for the book. No re-entry needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-[#5C3A1E]">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Same secure checkout</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 30-day money-back on everything</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant PDF delivery</span>
          </div>
        </div>
      </section>

      {/* ═════════ 6. TESTIMONIAL ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-2 border-[#5C3A1E]/30 p-6 md:p-10 shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
            <Sparkles className="h-8 w-8 text-[#D4A017] mx-auto mb-4" />
            <p className="text-lg md:text-xl italic text-[#1A1A1A] text-center leading-relaxed mb-6">
              &ldquo;The Salary Playbook paid for this bundle forty times over. I walked into a review I&apos;d been dreading for six months, used the opener almost word for word, pushed back on the first counter exactly how the playbook said to, walked out with a $31K bump. Haven&apos;t touched the Vault yet. Will eventually.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C3A1E] to-[#1A1A1A] flex items-center justify-center text-[#F4ECD8] font-mono font-bold">
                J
              </div>
              <div>
                <p className="font-mono font-bold text-[#1A1A1A]">James W.</p>
                <p className="text-xs text-[#5C3A1E] uppercase tracking-wide">Senior Engineer · Austin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ 7. WHY THIS IS ONE-TIME ═════════ */}
      <section className="px-6 py-12 md:py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8 text-center">
          Why This Offer Isn&apos;t On The <HL>Regular Website</HL>
        </h2>

        <div className="space-y-5 text-base md:text-lg leading-[1.85] text-[#1A1A1A]">
          <p>
            The Situation Playbooks and the Vault are two separate products. The Playbooks usually sell for $47. The Vault usually sells for $37 standalone.
          </p>
          <p>
            I only bundle them together for people who just bought the book, for two reasons:
          </p>
          <ol className="space-y-3 pl-6 list-decimal marker:text-[#D4A017] marker:font-bold">
            <li>
              <strong>They only stack cleanly with the book.</strong> The Playbooks reference the book&apos;s 47 tactics by name. The Vault extends them. If you haven&apos;t read the book, half the value is missing.
            </li>
            <li>
              <strong>The discount only makes sense right now, at the moment of sale.</strong> I&apos;m already paying around $22 in ad spend to get you here. Tacking on $40 of bundle margin on top of the book is the only reason I can knock $37 off retail. Come back next week, the math breaks, you pay the $84.
            </li>
          </ol>
          <p>
            So this page is a one-time offer. When you leave it, the link dies. Next time you see these products on the site, the Playbooks are $47 by themselves and the Vault is $37 by itself.
          </p>
          <p className="font-bold">
            Today, bundled with your book order, they&apos;re both yours for $47.
          </p>
        </div>

        <div className="mt-10 bg-[#8B0000]/10 border-2 border-[#8B0000]/40 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-[#8B0000] mx-auto mb-3" />
          <p className="text-base md:text-lg text-[#1A1A1A]">
            When you close this page, the $47 offer is gone. You can always buy them later individually at full price, but this combined price doesn&apos;t come back.
          </p>
        </div>
      </section>

      {/* ═════════ 8. GUARANTEE ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-16 w-16 text-[#D4A017] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-6">
            Same <span className="text-[#D4A017]">Money-Back Guarantee</span>{' '}As The Book
          </h2>
          <p className="text-base md:text-lg text-[#F4ECD8]/90 leading-relaxed mb-5">
            Read the Playbooks. Run the Vault on one real conversation. If you don&apos;t close that conversation better than you would have without them, email me inside 30 days and I refund the $47. You keep the files. I don&apos;t ask why.
          </p>
          <p className="text-sm text-[#F4ECD8]/70 italic">
            The only thing you risk is 30 minutes of reading. What you stand to gain is walking into every conversation that matters knowing exactly which playbook you&apos;re running and which tactics you&apos;re about to deploy.
          </p>
        </div>
      </section>

      {/* ═════════ 9. FINAL ORDER ═════════ */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-4">
            Ready? <span className="text-[#D4A017]">Add Both To My Order.</span>
          </h2>
          <p className="text-base md:text-lg text-[#3B2E1A]">
            One click. Charged to the same card. Delivered instantly.
          </p>
        </div>

        <div className="bg-black text-[#F4ECD8] border-4 border-[#D4A017] p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017] text-center mb-3">
            ⏱  Expires In <Countdown />
          </p>
          <div className="flex items-baseline justify-center gap-3 mb-4">
            <span className="text-2xl line-through text-[#F4ECD8]/40">$84</span>
            <span className="text-6xl md:text-7xl font-black text-[#D4A017]">$47</span>
          </div>
          <p className="text-center text-sm text-[#D4A017] font-bold uppercase tracking-wider mb-6">
            Save $37 · One-Time Offer
          </p>
          <button
            type="button"
            onClick={handleAccept}
            disabled={processing}
            className="block w-full bg-[#D4A017] hover:bg-[#C4901A] disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono uppercase font-black text-lg md:text-xl text-center px-6 py-5 md:py-6 tracking-wider transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]"
          >
            {processing
              ? 'Processing…'
              : isDirect
              ? 'GET THE BOOK FIRST → $7'
              : '✓ YES. LOCK IN THE PLAYBOOKS + VAULT FOR $47.'}
          </button>
        </div>

        {/* Decline link */}
        <div className="text-center">
          <a
            href="/lp/upsell-app"
            onClick={handleDecline}
            className="inline-flex items-center gap-2 text-sm text-[#5C3A1E] hover:text-[#1A1A1A] underline"
          >
            <X className="h-4 w-4" />
            No thanks. I&apos;ll pass on this and take the book by itself.
          </a>
        </div>
      </section>

      {/* ═════════ 10. PS ═════════ */}
      <section className="px-6 py-12 md:py-16 bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-l-4 border-[#D4A017] p-6 md:p-8">
            <p className="font-bold text-[#1A1A1A] mb-3 text-base md:text-lg">
              <strong>P.S.</strong> If you&apos;re on the fence, ask yourself what one bad conversation actually costs you.
            </p>
            <p className="text-base md:text-lg text-[#1A1A1A] mb-3">
              A lost negotiation. The fight that didn&apos;t have to happen but did. The relationship you couldn&apos;t put back together because you froze at the wrong moment. A custody deal you&apos;re going to resent for the next fourteen years.
            </p>
            <p className="text-base md:text-lg text-[#1A1A1A]">
              $47 for the Playbooks + Vault is less than any single one of those costs. The files stay with you for every conversation after this one.
            </p>
            <p className="mt-4 text-[#1A1A1A] font-bold">
              Click YES. Or don&apos;t, and take the book by itself. Either way, go win Wednesday&apos;s conversation.
            </p>
            <p className="text-3xl md:text-4xl italic text-[#1A1A1A] mt-4" style={{ fontFamily: 'Brush Script MT, cursive' }}>
              Nate Harlan
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="px-6 py-8 bg-[#1A1A1A] text-[#F4ECD8]/60 text-center text-sm">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="font-mono uppercase tracking-wider text-xs">
            CLASSIFICATION: ONE-TIME OFFER · BOOK BUYERS ONLY
          </p>
          <p>© {new Date().getFullYear()} Shadow Persuasion. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
