'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, Shield, Clock, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = {
  weekly: { name: 'Weekly', price: '$9.95', period: '/week', amount: 9.95, badge: 'Most Flexible' },
  monthly: { name: 'Monthly', price: '$34.95', period: '/month', amount: 34.95, badge: 'Most Popular' },
  yearly: { name: 'Yearly', price: '$195.95', period: '/year', amount: 195.95, badge: 'Best Value', savings: '$223.45' },
};

type PlanKey = keyof typeof PLANS;

const FEATURES = [
  'AI Strategic Coach (24/7)',
  'Conversation Analyzer',
  '1,000+ Influence Techniques',
  'Training Arena (AI Role-Play)',
  'Message Optimizer & Quick-Fire',
  'People Profiles & Strategies',
  'Daily Field Missions',
  'Persuasion Score & Rankings',
  'Voice Profile',
];

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full" /></div>}>
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>((searchParams.get('plan') as PlanKey) || 'monthly');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchClientSecret = useCallback(async () => {
    if (!user) return '';
    const token = await user.getIdToken();
    const res = await fetch('/api/stripe/create-embedded-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: selectedPlan, userId: user.uid, email: user.email }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.clientSecret;
  }, [user, selectedPlan]);

  const plan = PLANS[selectedPlan];

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F4ECD8]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/pricing" className="flex items-center gap-2 text-sm text-[#6B5B3E] hover:text-[#D4A017] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to plans
          </Link>
          <img src="/logo.png" alt="Shadow Persuasion" className="h-10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* Left column — Order summary */}
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-6">Complete Your Order</h1>

            {/* Plan selector */}
            <div className="bg-white border border-gray-300 rounded-xl p-5 mb-6">
              <p className="font-mono text-xs text-[#6B5B3E] uppercase tracking-wider mb-3">Select Plan</p>
              <div className="flex gap-2">
                {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`flex-1 py-3 px-3 rounded-lg border-2 text-center transition-all ${
                      selectedPlan === key
                        ? 'border-[#D4A017] bg-[#D4A017]/10'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <p className={`text-xs font-mono uppercase ${selectedPlan === key ? 'text-[#D4A017]' : 'text-gray-500'}`}>{p.badge}</p>
                    <p className="text-lg font-bold text-[#1A1A1A] mt-1">{p.price}<span className="text-sm font-normal text-gray-500">{p.period}</span></p>
                  </button>
                ))}
              </div>
              {selectedPlan === 'yearly' && (
                <p className="text-center text-sm text-green-700 font-bold mt-2">You save {PLANS.yearly.savings} per year vs monthly</p>
              )}
            </div>

            {/* What you get */}
            <div className="bg-white border border-gray-300 rounded-xl p-5 mb-6">
              <p className="font-mono text-xs text-[#6B5B3E] uppercase tracking-wider mb-3">What&apos;s Included</p>
              <ul className="space-y-2">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#3B2E1A]">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 text-xs text-[#6B5B3E]">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> 30-day money-back guarantee</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Cancel anytime</span>
              <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Instant access after payment</span>
            </div>
          </div>

          {/* Right column — Stripe Embedded Checkout */}
          <div className="bg-white border border-gray-300 rounded-xl p-1 min-h-[400px]">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
