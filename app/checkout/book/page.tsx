'use client';

/* ════════════════════════════════════════════════════════════
   /checkout/book — $7 book checkout with $17 order bump

   Flow:
   1. Collect email + name
   2. Order bump checkbox: The Pre-Conversation Briefing ($17)
   3. POST /api/checkout/book → PaymentIntent client_secret
   4. Stripe Elements confirms payment
   5. On success → /lp/upsell-playbooks?pi=<id>
   ════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Special_Elite } from 'next/font/google';
import { Lock, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

const STRIPE_PK =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PK ||
  '';

const stripePromise: Promise<StripeJS | null> | null = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

function PayForm({
  paymentIntentId,
  email,
  includeBump,
  total,
}: {
  paymentIntentId: string;
  email: string;
  includeBump: boolean;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/lp/upsell-playbooks?pi=${paymentIntentId}`,
        receipt_email: email,
      },
    });

    if (confirmErr) {
      setError(confirmErr.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      router.push(`/lp/upsell-playbooks?pi=${paymentIntent.id}`);
    } else {
      setError('Payment not completed. Please try again.');
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="bg-[#8B0000]/10 border border-[#8B0000] text-[#8B0000] p-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-black hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed text-[#F4ECD8] font-mono uppercase font-bold text-lg md:text-xl px-6 py-5 md:py-6 tracking-wider transition-all shadow-[6px_6px_0_0_#D4A017] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#D4A017]"
      >
        {processing ? 'Processing…' : `Pay $${(total / 100).toFixed(2)} Now`}
        {!processing && <ArrowRight className="inline-block ml-3 h-5 w-5" />}
      </button>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-[#5C3A1E]">
        <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Secure · SSL Encrypted</span>
        <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 30-Day Guarantee</span>
        <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant Delivery</span>
      </div>
    </form>
  );
}

export default function BookCheckoutPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [includeBump, setIncludeBump] = useState(true); // default-checked bump
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initErr, setInitErr] = useState<string | null>(null);

  const bookCents = 700;
  const bumpCents = 1700;
  const total = bookCents + (includeBump ? bumpCents : 0);

  async function initCheckout(e: React.FormEvent) {
    e.preventDefault();
    setInitErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setInitErr('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), includeBump }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err) {
      setInitErr(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // When the bump toggles after checkout has been initialized, restart the PI
  // (Stripe doesn't let us mutate PaymentIntent amount server-safely in all cases.)
  useEffect(() => {
    if (clientSecret) {
      setClientSecret(null);
      setPaymentIntentId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeBump]);

  const stripeElementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: 'stripe' as const,
              variables: {
                colorPrimary: '#D4A017',
                colorBackground: '#ffffff',
                colorText: '#1A1A1A',
                fontFamily: 'Georgia, serif',
                borderRadius: '0px',
              },
            },
          }
        : undefined,
    [clientSecret]
  );

  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] min-h-screen`}>
      {/* Top bar */}
      <div className="bg-black text-[#F4ECD8] py-2.5 text-center text-xs md:text-sm font-mono uppercase tracking-wider">
        🔒  Secure Checkout · 30-Day Money-Back Guarantee
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16 grid md:grid-cols-2 gap-8 md:gap-12">
        {/* LEFT — order summary */}
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">
            // YOUR ORDER //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8">
            Complete Your Order
          </h1>

          {/* Book line */}
          <div className="bg-white border-2 border-black p-5 mb-4 shadow-[6px_6px_0_0_#D4A017]">
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 shrink-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A1F0E] to-[#0A0A0A] border-2 border-[#D4A017] flex items-center justify-center">
                <span className="text-[#D4A017] text-[9px] font-mono uppercase tracking-widest text-center leading-tight px-1">
                  Shadow<br/>Persuasion
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1A1A1A]">
                  Shadow Persuasion <span className="text-xs text-[#5C3A1E]">(eBook)</span>
                </p>
                <p className="text-xs text-[#5C3A1E] mt-1">
                  47 tactics · 4-part system · + 4 free bonuses
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm line-through text-[#5C3A1E]/60">$47</span>
                <span className="block font-black text-xl">$7</span>
              </div>
            </div>
          </div>

          {/* ORDER BUMP — the yellow checkbox */}
          <label
            className={`block cursor-pointer border-4 p-5 transition-all ${
              includeBump
                ? 'border-[#D4A017] bg-[#FFF7DC] shadow-[6px_6px_0_0_#1A1A1A]'
                : 'border-[#D4A017]/60 bg-[#FFFBEE] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={includeBump}
                onChange={(e) => setIncludeBump(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[#D4A017] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#D4A017] text-black px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold">
                    ⚡ ONE-TIME ADD-ON
                  </span>
                  <span className="text-xs text-[#5C3A1E] font-bold">
                    YES! I want this too.
                  </span>
                </div>
                <p className="font-bold text-base text-[#1A1A1A] mb-1">
                  Add: The Pre-Conversation Briefing
                </p>
                <p className="text-xs md:text-sm text-[#3B2E1A] leading-relaxed mb-2">
                  The 10-minute worksheet I fill out before every high-stakes conversation.
                  Pick your tactics, draft your opening, calm the nerves. Walk in prepared.
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#5C3A1E] line-through">normally $27</span>
                  <span className="bg-[#D4A017] text-black px-2 py-0.5 font-bold tracking-wider">
                    JUST $17 TODAY
                  </span>
                </div>
              </div>
            </div>
          </label>

          {/* Total */}
          <div className="mt-6 bg-white border-2 border-black p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#5C3A1E]">Shadow Persuasion (eBook)</span>
              <span className="font-mono font-bold">$7.00</span>
            </div>
            {includeBump && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#5C3A1E]">Pre-Conversation Briefing</span>
                <span className="font-mono font-bold">$17.00</span>
              </div>
            )}
            <div className="border-t-2 border-black mt-3 pt-3 flex justify-between items-baseline">
              <span className="font-bold uppercase tracking-wider text-[#1A1A1A]">Total</span>
              <span className="font-black text-3xl text-[#1A1A1A]">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-xs text-[#5C3A1E]">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
              <span>Instant download delivered to your inbox</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
              <span>30-day money-back guarantee — keep the files regardless</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
              <span>One-time payment. No subscription. No auto-bill.</span>
            </div>
          </div>
        </section>

        {/* RIGHT — payment form */}
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">
            // PAYMENT //
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-6">
            Secure Checkout
          </h2>

          <div className="bg-white border-2 border-[#5C3A1E]/40 p-5 md:p-6 shadow-[6px_6px_0_0_rgba(0,0,0,0.08)]">
            {!clientSecret ? (
              <form onSubmit={initCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3A1E] mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-2 border-[#5C3A1E]/30 px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#D4A017]"
                  />
                  <p className="text-xs text-[#5C3A1E] mt-1">
                    Where we&apos;ll send your download links.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3A1E] mb-1.5">
                    First Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full border-2 border-[#5C3A1E]/30 px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                {initErr && (
                  <div className="bg-[#8B0000]/10 border border-[#8B0000] text-[#8B0000] p-3 text-sm">
                    {initErr}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-[#1A1A1A] disabled:opacity-50 text-[#F4ECD8] font-mono uppercase font-bold text-base md:text-lg px-6 py-4 tracking-wider transition-all shadow-[4px_4px_0_0_#D4A017] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#D4A017]"
                >
                  {loading ? 'Loading…' : 'Continue To Payment →'}
                </button>
              </form>
            ) : stripePromise && stripeElementsOptions ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#5C3A1E]/20">
                  <span className="text-sm text-[#5C3A1E]">{email}</span>
                  <button
                    type="button"
                    onClick={() => setClientSecret(null)}
                    className="text-xs text-[#D4A017] hover:underline"
                  >
                    change
                  </button>
                </div>
                <Elements stripe={stripePromise} options={stripeElementsOptions}>
                  <PayForm
                    paymentIntentId={paymentIntentId!}
                    email={email}
                    includeBump={includeBump}
                    total={total}
                  />
                </Elements>
              </>
            ) : (
              <p className="text-sm text-[#8B0000]">
                Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
              </p>
            )}
          </div>

          <p className="mt-5 text-xs text-[#5C3A1E] text-center leading-relaxed">
            By completing your order you agree to our{' '}
            <a href="/terms" className="underline hover:text-[#D4A017]">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-[#D4A017]">Privacy Policy</a>.
            <br/>
            30-day money-back guarantee. No subscription. No hidden fees.
          </p>
        </section>
      </div>
    </main>
  );
}
