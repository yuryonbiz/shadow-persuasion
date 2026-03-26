'use client';

import { motion } from 'framer-motion';

const frameworks = [
  {
    module: 'MOD-001',
    title: 'Psychological Leverage',
    description: 'Identify and exploit cognitive biases to gain the upper hand.',
  },
  {
    module: 'MOD-002',
    title: 'Frame Control',
    description: 'Define the narrative and control the context of any interaction.',
  },
  {
    module: 'MOD-003',
    title: 'Covert Influence Patterns',
    description: 'Embed commands and suggestions in seemingly innocuous language.',
  },
  {
    module: 'MOD-004',
    title: 'Negotiation Architecture',
    description: 'Structure deals and debates to guarantee favorable outcomes.',
  },
  {
    module: 'MOD-005',
    title: 'Emotional Exploitation',
    description: 'Leverage emotional states to bypass logical reasoning.',
  },
  {
    module: 'MOD-006',
    title: 'Social Proof Engineering',
    description: 'Manufacture and amplify consensus to guide herd behavior.',
  },
];

export default function FrameworkGrid() {
  return (
    <section className="my-12">
      <h2 className="mb-8 font-mono text-3xl uppercase tracking-widest text-white">
        Framework Grid
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((framework, i) => (
          <motion.div
            key={framework.module}
            className="flex flex-col justify-between border border-[#333] p-4 transition-all hover:border-[#FF8C00] hover:bg-[#1A2E1A]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-gray-400">
                  {framework.module}
                </span>
                <div className="flex items-center">
                  <span className="mr-2 font-mono text-xs text-green-400">
                    ACTIVE
                  </span>
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                </div>
              </div>
              <h3 className="my-4 font-sans text-2xl font-bold uppercase text-white">
                {framework.title}
              </h3>
            </div>
            <p className="font-mono text-sm text-gray-500">
              {framework.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
