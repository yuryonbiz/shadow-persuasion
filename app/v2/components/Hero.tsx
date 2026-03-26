'use client';

import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const StatusBar = () => (
  <div className="border border-[#333] bg-black bg-opacity-50 p-2 pr-4 text-xs font-semibold uppercase tracking-widest text-[#FF8C00]">
    <div className="container mx-auto flex justify-between">
      <span>SYSTEM STATUS: ACTIVE</span>
      <span>CLEARANCE: PENDING</span>
      <span>SESSION: ENCRYPTED</span>
    </div>
  </div>
);

const TypewriterText = () => {
  const text = "You are about to access restricted influence architectures. Proceed with intent.";
  const variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.01,
      },
    }),
  };

  return (
    <motion.div
      className="mt-4 font-mono text-lg text-gray-400"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {text.split('').map((char, i) => (
        <motion.span key={i} variants={variants} custom={i}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function Hero() {
  return (
    <section className="relative min-h-screen border border-[#333] bg-[#0C0C0C]">
      <StatusBar />
      <div className="flex h-full flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-mono text-5xl font-bold uppercase tracking-[.3em] text-white">
            The Operator's Playbook
          </h1>
          <h2 className="mt-2 font-sans text-xl uppercase tracking-wider text-[#0D1F0D] max-w-3xl mx-auto">
            Psychological Warfare Frameworks for High-Stakes Environments
          </h2>
        </motion.div>
        
        <TypewriterText />

        <motion.div
          className="mt-8 flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 3 }}
        >
          <button className="border border-[#FF8C00] bg-transparent px-6 py-2 font-mono text-lg uppercase text-[#FF8C00] transition-all hover:bg-[#FF8C00] hover:text-[#0C0C0C]">
            [Initiate Access]
          </button>
          <button className="border border-[#333] bg-transparent px-6 py-2 font-mono text-lg uppercase text-gray-400 transition-all hover:border-gray-500 hover:text-white">
            [View Framework Index]
          </button>
        </motion.div>
      </div>
      <div className="absolute bottom-4 right-4 animate-pulse pl-2">
        <Terminal className="text-green-500" />
      </div>
    </section>
  );
}
