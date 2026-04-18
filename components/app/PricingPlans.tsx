'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

type PlanKey = 'weekly' | 'monthly' | 'yearly';

interface PricingPlansProps {
  onSelect: (plan: PlanKey) => void;
  loading?: boolean;
  currentPlan?: string;
}

const FEATURES = [
  'AI Strategic Coach (24/7)',
  'Conversation Analyzer',
  '1,000+ Influence Techniques',
  'Training Arena (AI Role-Play)',
  'Message Optimizer',
  'People Profiles',
  'Daily Field Missions',
  'Persuasion Score & Progress',
  'Voice Profile',
];

const PLANS: Record<PlanKey, {
  name: string;
  price: number;
  period: string;
  badge: string;
  badgeColor: string;
}> = {
  weekly: {
    name: 'Weekly',
    price: 9.95,
    period: '/week',
    badge: 'Most Flexible',
    badgeColor: 'bg-[#1A1A1A] text-[#F4ECD8]',
  },
  monthly: {
    name: 'Monthly',
    price: 34.95,
    period: '/month',
    badge: 'Most Popular',
    badgeColor: 'bg-[#D4A017] text-[#1A1A1A]',
  },
  yearly: {
    name: 'Yearly',
    price: 195.95,
    period: '/year',
    badge: 'Best Value',
    badgeColor: 'bg-[#1A1A1A] text-[#D4A017]',
  },
};

const yearlySavings = (PLANS.monthly.price * 12 - PLANS.yearly.price).toFixed(2);

export function PricingPlans({ onSelect, loading, currentPlan }: PricingPlansProps) {
  const [highlighted, setHighlighted] = useState<PlanKey>('monthly');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#6B5B3E] dark:text-[#A0884A] mb-2">
          SELECT YOUR CLEARANCE LEVEL
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-[#F4ECD8]">
          Choose Your Plan
        </h2>
      </div>

      {/* Plan selector tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex border-2 border-[#D4A017]/40 rounded-lg overflow-hidden">
          {(Object.keys(PLANS) as PlanKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setHighlighted(key)}
              className={`
                px-5 py-2.5 text-sm font-mono uppercase tracking-wider transition-all duration-200
                ${highlighted === key
                  ? 'bg-[#D4A017] text-[#1A1A1A] font-bold'
                  : 'bg-transparent text-[#6B5B3E] dark:text-[#A0884A] hover:bg-[#D4A017]/10'
                }
              `}
            >
              {PLANS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 items-end">
        {(Object.keys(PLANS) as PlanKey[]).map((key) => {
          const plan = PLANS[key];
          const isPopular = key === 'monthly';
          const isHighlighted = key === highlighted;
          const isCurrent = currentPlan === key;

          return (
            <div
              key={key}
              className={`
                relative flex flex-col rounded-xl transition-all duration-300
                ${isPopular
                  ? 'md:-mt-4 md:mb-0 border-2 border-[#D4A017] shadow-ember'
                  : 'border border-[#A0884A]/30 dark:border-[#333333]'
                }
                ${isHighlighted && !isPopular
                  ? 'border-[#D4A017] shadow-lg scale-[1.02]'
                  : ''
                }
                ${isPopular && isHighlighted
                  ? 'scale-[1.03] shadow-crimson-lg'
                  : ''
                }
                bg-[#F4ECD8] dark:bg-[#1A1A1A]
              `}
            >
              {/* RECOMMENDED stamp for Monthly */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-[#D4A017] text-[#1A1A1A] font-mono text-[10px] uppercase tracking-widest font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md">
                    RECOMMENDED
                  </span>
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrent && (
                <div className="absolute -top-3.5 right-4 z-10">
                  <span className="bg-[#1A1A1A] dark:bg-[#F4ECD8] text-[#F4ECD8] dark:text-[#1A1A1A] font-mono text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className={`p-6 ${isPopular ? 'pt-8' : 'pt-6'} flex flex-col flex-1`}>
                {/* Badge */}
                <div className="mb-4">
                  <span className={`inline-block font-mono text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Plan name */}
                <h3 className={`text-xl font-bold text-[#1A1A1A] dark:text-[#F4ECD8] mb-1 ${isPopular ? 'text-2xl' : ''}`}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-1">
                  <span className={`font-bold text-[#1A1A1A] dark:text-[#F4ECD8] ${isPopular ? 'text-5xl' : 'text-4xl'}`}>
                    ${plan.price}
                  </span>
                  <span className="text-base text-[#6B5B3E] dark:text-[#A0884A] ml-1">
                    {plan.period}
                  </span>
                </div>

                {/* Yearly savings callout */}
                {key === 'yearly' && (
                  <p className="text-sm font-mono font-bold text-green-700 dark:text-green-400 mb-3">
                    Save ${yearlySavings} vs. monthly
                  </p>
                )}

                {/* Weekly micro-cost framing */}
                {key === 'weekly' && (
                  <p className="text-sm text-[#6B5B3E] dark:text-[#A0884A] mb-3">
                    No commitment. Pay as you go.
                  </p>
                )}

                {/* Monthly per-day cost */}
                {key === 'monthly' && (
                  <p className="text-sm text-[#6B5B3E] dark:text-[#A0884A] mb-3">
                    Less than $1.17/day
                  </p>
                )}

                {/* Divider */}
                <div className="border-t border-[#A0884A]/20 dark:border-[#333333] my-4" />

                {/* Features list */}
                <ul className="space-y-3 mb-6 flex-1">
                  {FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          isPopular
                            ? 'text-[#D4A017]'
                            : 'text-[#A0884A] dark:text-[#D4A017]/60'
                        }`}
                      />
                      <span className="text-sm text-[#1A1A1A]/80 dark:text-[#F4ECD8]/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => onSelect(key)}
                  disabled={loading || isCurrent}
                  className={`
                    w-full py-3.5 px-6 font-mono uppercase text-sm tracking-wider font-bold rounded-lg
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isPopular
                      ? 'bg-[#D4A017] hover:bg-[#C49A3A] text-[#1A1A1A] shadow-md hover:shadow-lg'
                      : 'bg-[#1A1A1A] hover:bg-[#333333] text-[#F4ECD8] dark:bg-[#F4ECD8] dark:hover:bg-[#EDE3D0] dark:text-[#1A1A1A]'
                    }
                  `}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    'Start Training'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="mt-10 text-center space-y-2">
        <p className="font-mono text-sm text-[#6B5B3E] dark:text-[#A0884A] tracking-wide">
          30-day money-back guarantee
        </p>
        <p className="text-xs text-[#6B5B3E]/70 dark:text-[#A0884A]/60">
          Cancel anytime. No contracts. No cancellation fees.
        </p>
      </div>
    </div>
  );
}
