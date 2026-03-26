'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';

const features = [
  'Unlimited AI Console access',
  'Visual Intelligence uploads',
  'All 50+ influence frameworks',
  'Negotiation simulator',
  'Script generator',
  'Monthly new tactics',
  'Private operator community',
];

export const Pricing = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section ref={ref} className="bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-[#FF8C00]">
            Access Levels
          </h2>
        </div>
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mt-16 flex flex-col rounded-xl border border-[#333] bg-[#111] p-8"
        >
          <h3 className="text-center font-mono text-xl font-semibold uppercase tracking-wider text-white">
            Full Operator Access
          </h3>
          <div className="my-8 text-center">
            <span className="text-2xl text-gray-500 line-through mr-3">$97</span>
            <span className="text-6xl font-bold text-[#FF8C00]">$47</span>
            <span className="text-lg text-gray-400">/month</span>
          </div>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          <button className="mt-10 w-full bg-[#FF8C00] px-6 py-4 font-mono text-base uppercase text-black transition-opacity hover:opacity-90">
            [ACTIVATE ACCESS]
          </button>
          <p className="mt-4 text-center text-xs text-gray-500">
            Cancel anytime. No questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
