'use client';

/* ════════════════════════════════════════════════════════════
   /lp/thank-you — Terminal page after the funnel.

   Shows download links for whatever was purchased (looked up via
   the original book payment_intent_id) plus next-steps / community
   access if they took the SaaS upsell.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Special_Elite } from 'next/font/google';
import {
  CheckCircle,
  Download,
  Mail,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

type OrderInfo = {
  email: string;
  items: string[];
  hasSubscription: boolean;
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouInner />
    </Suspense>
  );
}

function ThankYouInner() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('pi');
  const hasSub = searchParams.get('sub') === '1';
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentIntentId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/by-pi?pi=${encodeURIComponent(paymentIntentId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.items) {
          setOrder({ email: data.email, items: data.items, hasSubscription: hasSub });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [paymentIntentId, hasSub]);

  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] min-h-screen`}>
      {/* Top bar */}
      <div className="bg-black text-[#F4ECD8] py-2.5 text-center text-xs md:text-sm font-mono uppercase tracking-wider">
        ✓ Order Complete
      </div>

      {/* ═════════ HERO ═════════ */}
      <section className="px-6 pt-12 pb-10 md:pt-16 md:pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="h-14 w-14 text-[#D4A017] mx-auto mb-4" />
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#5C3A1E] mb-4">
            // ORDER #{(paymentIntentId || 'UNKNOWN').slice(-8).toUpperCase()} //
          </p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
            Paid. Downloaded. <span className="text-[#D4A017]">Now The Real Part.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#3B2E1A] leading-relaxed max-w-2xl mx-auto">
            Grab your files below. I emailed them to you too, in case your laptop dies tomorrow.
            {order?.email && (
              <>
                {' '}Sent to <strong className="text-[#1A1A1A]">{order.email}</strong>.
              </>
            )}
          </p>
        </div>
      </section>

      {/* ═════════ DOWNLOADS ═════════ */}
      <section className="px-6 py-8 md:py-12 max-w-3xl mx-auto">
        <div className="bg-white border-4 border-black p-6 md:p-10 shadow-[10px_10px_0_0_#D4A017]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#5C3A1E]/20">
            <Download className="h-6 w-6 text-[#D4A017]" />
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#1A1A1A]">
              Your Downloads
            </h2>
          </div>

          {loading ? (
            <p className="text-center text-[#5C3A1E] italic py-6">
              Loading your order...
            </p>
          ) : !order?.items?.length ? (
            <div className="text-center py-6">
              <p className="text-[#5C3A1E] mb-3">
                We couldn&apos;t locate your order from the URL. Check your email for the download links.
              </p>
              <p className="text-xs text-[#5C3A1E] italic">
                If you don&apos;t see it within 5 minutes (check spam), email{' '}
                <a href="mailto:support@shadowpersuasion.com" className="underline">
                  support@shadowpersuasion.com
                </a>{' '}
                and we&apos;ll resend.
              </p>
            </div>
          ) : (
            <DownloadList items={order.items} />
          )}
        </div>
      </section>

      {/* ═════════ EMAIL REMINDER ═════════ */}
      <section className="px-6 py-8 md:py-12 max-w-3xl mx-auto">
        <div className="bg-[#EBE0C7] border-l-4 border-[#D4A017] p-5 md:p-6 flex items-start gap-4">
          <Mail className="h-6 w-6 text-[#5C3A1E] shrink-0 mt-1" />
          <div>
            <p className="font-bold text-[#1A1A1A] mb-1">Check your inbox.</p>
            <p className="text-sm text-[#3B2E1A]">
              We just emailed you everything above.
              {order?.email && (
                <>
                  {' '}Sent to <strong>{order.email}</strong>.
                </>
              )}{' '}
              If it doesn&apos;t arrive in 5 minutes, check spam. If it&apos;s still not there, reply to this order&apos;s receipt and we&apos;ll resend manually.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ MEMBERSHIP WELCOME (if subscribed) ═════════ */}
      {hasSub && (
        <section className="px-6 py-10 md:py-16 bg-[#1A1A1A] text-[#F4ECD8]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A017] mb-3">
                // MEMBERSHIP ACTIVE //
              </p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4">
                Your Membership Is Live
              </h2>
              <p className="text-base md:text-lg text-[#F4ECD8]/90">
                You&apos;re into the full app. 697 techniques. Real-time coaching. Role-play reps. And the private community where we trade notes on what&apos;s actually working.
              </p>
            </div>

            <div className="bg-[#D4A017] border-4 border-[#F4ECD8] p-6 md:p-8 text-center">
              <p className="text-black font-mono text-xs uppercase tracking-widest mb-3">
                First stop: set up your account
              </p>
              <p className="text-black text-sm md:text-base mb-6">
                Sign up with the same email you used at checkout. Your membership will link automatically.
              </p>
              <a
                href={`/login?tab=signup${order?.email ? `&email=${encodeURIComponent(order.email)}` : ''}`}
                className="inline-flex items-center gap-2 bg-black text-[#D4A017] font-mono uppercase font-bold text-base md:text-lg px-8 py-4 tracking-wider hover:bg-[#1A1A1A] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]"
              >
                Activate My Account
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ═════════ NEXT STEPS ═════════ */}
      <section className="px-6 py-10 md:py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-6 text-center">
          Three Things, Starting Tonight
        </h2>
        <div className="space-y-3">
          {[
            hasSub
              ? 'Activate your app account with the same email you used at checkout. Then paste a real conversation you have coming up into the coach. That\'s the whole onboarding.'
              : 'Save the files to your laptop, not just your phone. Phone downloads go to die. Then hit reply to the receipt email and tell me the one conversation you bought this for. I read every reply.',
            'Read Chapter 1 tonight. If by the last page you don\'t have at least one "oh, that\'s what he was doing to me" moment, email me and I refund the whole order.',
            'After your first real high-stakes conversation, email me what happened. I read every email and I write back.',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border-2 border-[#5C3A1E]/30 p-4 md:p-5">
              <span className="font-mono text-xl font-black text-[#D4A017] leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm md:text-base text-[#1A1A1A] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ GUARANTEE REMINDER ═════════ */}
      <section className="px-6 py-8 md:py-12 max-w-3xl mx-auto">
        <div className="bg-white border-2 border-[#5C3A1E]/30 p-5 md:p-6 flex items-start gap-4">
          <Shield className="h-6 w-6 text-[#D4A017] shrink-0 mt-1" />
          <div>
            <p className="font-bold text-[#1A1A1A] mb-1">30-day money-back guarantee on everything.</p>
            <p className="text-sm text-[#3B2E1A]">
              Read the book, use the playbooks, run the app. If you don&apos;t feel it&apos;s worth more than you paid, email{' '}
              <a href="mailto:support@shadowpersuasion.com" className="underline">
                support@shadowpersuasion.com
              </a>{' '}
              within 30 days. Full refund. You keep the files either way.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════ SIGN OFF ═════════ */}
      <section className="px-6 py-10 md:py-16 max-w-3xl mx-auto">
        <p className="text-base md:text-lg text-[#1A1A1A] mb-4">
          Thanks for trusting me with this. Now go use it. Email me after your first real conversation. I want to hear what happened.
        </p>
        <p className="text-3xl md:text-4xl italic text-[#1A1A1A]" style={{ fontFamily: 'Brush Script MT, cursive' }}>
          Nate Harlan
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-[#1A1A1A] text-[#F4ECD8]/60 text-center text-sm">
        <div className="max-w-3xl mx-auto space-y-2">
          <p>© {new Date().getFullYear()} Shadow Persuasion. All rights reserved.</p>
          <p className="text-xs">
            Order reference: {paymentIntentId || 'n/a'}
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ─────────────── Downloads list (looks up per-product files) ─────────────── */
function DownloadList({ items }: { items: string[] }) {
  // Map product slugs → human-readable list of files, using public paths
  // matching what lib/pricing.ts defines on the server
  const CATALOG: Record<string, { name: string; path: string }[]> = {
    book: [
      { name: 'Shadow Persuasion (The Book)', path: '/downloads/shadow-persuasion-book.docx' },
      { name: 'Bonus #1: The Manipulation Tactics Decoder', path: '/downloads/bonus-1-manipulation-decoder.docx' },
      { name: 'Bonus #2: The Power Dynamics Cheatsheet', path: '/downloads/bonus-2-power-dynamics-cheatsheet.docx' },
      { name: 'Bonus #3: 48 Salary Negotiation Scripts', path: '/downloads/bonus-3-salary-scripts.docx' },
      { name: 'Bonus #4: The Reactance Detector Cheatsheet', path: '/downloads/bonus-4-reactance-detector.docx' },
    ],
    briefing: [
      { name: 'The Pre-Conversation Briefing', path: '/downloads/pre-conversation-briefing.docx' },
    ],
    playbooks: [
      { name: 'The Situation Playbooks', path: '/downloads/situation-playbooks.docx' },
    ],
    vault: [
      { name: 'The Shadow Persuasion Vault', path: '/downloads/shadow-persuasion-vault.docx' },
    ],
  };

  const files = items.flatMap((slug) => CATALOG[slug] ?? []);

  if (files.length === 0) {
    return (
      <p className="text-center text-[#5C3A1E] italic py-4">
        Check your email for download links.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((f) => (
        <div
          key={f.path}
          className="flex items-center justify-between gap-4 p-4 bg-[#F4ECD8] border border-[#5C3A1E]/30"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#D4A017] shrink-0" />
            <p className="font-bold text-sm md:text-base text-[#1A1A1A]">{f.name}</p>
          </div>
          <a
            href={f.path}
            download
            className="bg-[#D4A017] hover:bg-[#C4901A] text-black font-mono uppercase font-bold text-xs md:text-sm px-4 md:px-5 py-2.5 tracking-wider transition-all shadow-[3px_3px_0_0_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#1A1A1A] shrink-0"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
