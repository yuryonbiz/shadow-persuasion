'use client';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section className="text-center py-16 border-t-2 border-dashed border-gray-400">
      <h2 className="text-xl font-bold uppercase tracking-wider">
        End of Document
      </h2>
      
      <div className="max-w-xl mx-auto my-8">
        <p className="leading-relaxed">
            To request access to the UNREDACTED version of this document and begin your own operational training, submit form SP-2026-ACCESS for review.
        </p>
      </div>

      <motion.button
        className="px-8 py-3 border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F4ECD8] uppercase tracking-widest hover:bg-transparent hover:text-[#1A1A1A] transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        [Submit Access Request]
      </motion.button>

      <div className="mt-16 text-xs text-gray-500 space-y-1">
        <p>This document is the property of Shadow Persuasion. Unauthorized reproduction is prohibited.</p>
        <p>DOC-SP-2026-001 // Page 12 of 12</p>
      </div>
    </section>
  );
}
