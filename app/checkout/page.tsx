'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { CheckCircle, Shield, Clock, Zap, ArrowLeft, Lock, Star } from 'lucide-react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = {
  weekly: { name: 'Weekly', price: '$9.95', period: '/week', daily: '$1.42/day', badge: 'Most Flexible', badgeColor: 'bg-gray-200 text-gray-700' },
  monthly: { name: 'Monthly', price: '$34.95', period: '/month', daily: '$1.17/day', badge: 'Most Popular', badgeColor: 'bg-[#D4A017] text-[#0A0A0A]' },
  yearly: { name: 'Yearly', price: '$195.95', period: '/year', daily: '$0.54/day', badge: 'Best Value', badgeColor: 'bg-green-700 text-white', savings: '$223.45' },
};

type PlanKey = keyof typeof PLANS;

const FEATURES = [
  { name: 'AI Strategic Coach', benefit: 'Get tactical advice for any conversation, 24/7' },
  { name: 'Conversation Analyzer', benefit: 'Upload screenshots, decode what they really mean' },
  { name: '1,000+ Influence Techniques', benefit: 'From proprietary psychology research' },
  { name: 'Training Arena', benefit: 'Practice with AI role-play before the real thing' },
  { name: 'Message Optimizer', benefit: 'Rewrite any message for maximum impact' },
  { name: 'People Profiles', benefit: 'Build strategy playbooks for key relationships' },
  { name: 'Daily Field Missions', benefit: 'Practice techniques in real conversations' },
  { name: 'Persuasion Score', benefit: 'Track your progress with XP and rankings' },
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
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>((searchParams.get('plan') as PlanKey) || 'monthly');
  const [checkoutKey, setCheckoutKey] = useState(0);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/stripe/create-embedded-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: selectedPlan }),
    });
    const data = await res.json();
    if (data.error) {
      console.error('Checkout error:', data);
      throw new Error(data.error);
    }
    return data.clientSecret;
  }, [selectedPlan, checkoutKey]);

  const handlePlanChange = (plan: PlanKey) => {
    setSelectedPlan(plan);
    setCheckoutKey(k => k + 1);
  };

  const plan = PLANS[selectedPlan];

  return (
    <div className="min-h-screen bg-[#F4ECD8]">
      {/* Minimal header — no navigation, distraction-free */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div />
          <img src="/logo.png" alt="Shadow Persuasion" className="h-8" />
          <div className="flex items-center gap-1 text-xs text-[#6B5B3E]">
            <Lock className="h-3 w-3" /> Secure Checkout
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex items-center justify-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#D4A017]"><span className="w-5 h-5 rounded-full bg-[#D4A017] text-[#0A0A0A] flex items-center justify-center font-bold">1</span> Choose Plan</span>
          <span className="w-8 h-px bg-[#D4A017]" />
          <span className="flex items-center gap-1.5 text-[#D4A017] font-bold"><span className="w-5 h-5 rounded-full bg-[#D4A017] text-[#0A0A0A] flex items-center justify-center font-bold">2</span> Payment</span>
          <span className="w-8 h-px bg-gray-400" />
          <span className="flex items-center gap-1.5 text-gray-400"><span className="w-5 h-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</span> Start Training</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8">
          {/* Left column — Order summary */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-6">Complete Your Order</h1>

            {/* Plan selector */}
            <div className="bg-white border border-gray-300 rounded-xl p-5 mb-5">
              <p className="font-mono text-xs text-[#6B5B3E] uppercase tracking-wider mb-3">Select Your Plan</p>
              <div className="space-y-2">
                {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => handlePlanChange(key)}
                    className={`w-full flex items-center justify-between py-3.5 px-4 rounded-lg border-2 text-left transition-all ${
                      selectedPlan === key
                        ? key === 'monthly' ? 'border-[#D4A017] bg-[#D4A017]/5 shadow-md' : 'border-[#D4A017] bg-[#D4A017]/5'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === key ? 'border-[#D4A017]' : 'border-gray-300'}`}>
                        {selectedPlan === key && <div className="w-2 h-2 rounded-full bg-[#D4A017]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A1A1A]">{p.name}</span>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                          {key === 'monthly' && <span className="text-[10px] text-[#D4A017] font-mono">RECOMMENDED</span>}
                        </div>
                        <span className="text-xs text-[#6B5B3E]">{p.daily}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#1A1A1A]">{p.price}</span>
                      <span className="text-sm text-[#6B5B3E]">{p.period}</span>
                      {key === 'yearly' && (
                        <p className="text-xs text-green-700 font-bold">Save {PLANS.yearly.savings}/yr</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* What you get — benefit-focused */}
            <div className="bg-white border border-gray-300 rounded-xl p-5 mb-5">
              <p className="font-mono text-xs text-[#6B5B3E] uppercase tracking-wider mb-3">Everything Included</p>
              <ul className="space-y-2.5">
                {FEATURES.map(f => (
                  <li key={f.name} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-[#1A1A1A]">{f.name}</span>
                      <span className="text-sm text-[#6B5B3E]"> — {f.benefit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social proof */}
            <div className="bg-white border border-gray-300 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="flex text-[#D4A017]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <div>
                  <p className="text-sm text-[#3B2E1A] italic">&ldquo;I used the exact script Shadow Persuasion gave me and got a $28K raise. The anchoring technique changed everything.&rdquo;</p>
                  <p className="text-xs text-[#6B5B3E] mt-1 font-bold">Mark T., Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <Shield className="h-5 w-5 text-[#D4A017] mx-auto mb-1" />
                <p className="text-xs text-[#3B2E1A] font-bold">30-Day Guarantee</p>
                <p className="text-[10px] text-[#6B5B3E]">Full refund, no questions</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <Clock className="h-5 w-5 text-[#D4A017] mx-auto mb-1" />
                <p className="text-xs text-[#3B2E1A] font-bold">Cancel Anytime</p>
                <p className="text-[10px] text-[#6B5B3E]">No contracts or fees</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <Zap className="h-5 w-5 text-[#D4A017] mx-auto mb-1" />
                <p className="text-xs text-[#3B2E1A] font-bold">Instant Access</p>
                <p className="text-[10px] text-[#6B5B3E]">Start in 60 seconds</p>
              </div>
            </div>
          </div>

          {/* Right column — Stripe Embedded Checkout */}
          <div>
            {/* Order summary above form */}
            <div className="bg-[#1A1A1A] text-white rounded-t-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-400 uppercase">Your Plan</p>
                <p className="font-bold text-lg">Shadow Persuasion — {plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#D4A017]">{plan.price}</p>
                <p className="text-xs text-gray-400">{plan.period}</p>
              </div>
            </div>

            {/* Stripe form */}
            <div className="bg-white border border-gray-300 border-t-0 rounded-b-xl p-1 min-h-[350px]">
              <EmbeddedCheckoutProvider key={checkoutKey} stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>

            {/* Security badge below form */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#6B5B3E]">
              <Lock className="h-3 w-3" />
              <span>Powered by Stripe — 256-bit encryption — PCI Level 1 compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
