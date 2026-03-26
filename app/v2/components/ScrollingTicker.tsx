'use client';

import { motion } from 'framer-motion';

const tickerItems = [
  "FRAME CONTROL PROTOCOL UPDATED",
  "NEW: VOID PULL TECHNIQUE v3.2",
  "NEGOTIATION WIN RATE: 94.7%",
  "ACTIVE OPERATORS: 20,847",
  "THREAT INDEX: LOW",
  "COVERT INFLUENCE PATTERNS: ACTIVE",
];

export default function ScrollingTicker() {
  const duplicatedItems = [...tickerItems, ...tickerItems];

  const tickerVariants = {
    animate: {
      x: ['-100%', '0%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 30,
          ease: 'linear',
        },
      },
    },
  };

  return (
    <div className="relative my-12 h-12 overflow-hidden border-y-2 border-[#1A2E1A] bg-black">
      <motion.div
        className="flex h-full items-center"
        variants={tickerVariants}
        animate="animate"
      >
        <div className="flex w-max shrink-0 items-center">
          {duplicatedItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="mx-8 font-mono text-sm uppercase text-[#FF8C00]">
                {item}
              </span>
              <span className="text-[#1A2E1A]">//</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
