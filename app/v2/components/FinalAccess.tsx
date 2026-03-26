'use client';

import { motion } from 'framer-motion';

export default function FinalAccess() {
  return (
    <section className="my-12 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-mono text-4xl font-bold uppercase tracking-widest text-[#8B0000]">
          Authorization Required
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          This system is designed for operators who understand that power is not
          given — it is engineered.
        </p>
        <button className="mt-8 border-2 border-[#FF8C00] bg-transparent px-8 py-3 font-mono text-xl uppercase text-[#FF8C00] transition-all hover:bg-[#FF8C00] hover:text-[#0C0C0C]">
          [Request Access]
        </button>
        <p className="mt-4 font-mono text-xs text-gray-600">
          All sessions are monitored and encrypted. Unauthorized access will be
          logged.
        </p>
      </motion.div>
    </section>
  );
}
