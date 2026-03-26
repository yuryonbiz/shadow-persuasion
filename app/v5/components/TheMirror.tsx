'use client';
import { motion } from 'framer-motion';

export default function TheMirror() {
  return (
    <section className="flex min-h-[70vh] items-center justify-start px-12 py-24 md:px-24">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true, amount: 0.5 }}
        className="max-w-lg"
      >
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em]">
          Shadow Persuasion
        </h3>
        <p className="font-light leading-loose tracking-wider text-xl">
          You've always been good at reading people. You've noticed patterns
          others miss. What you lack isn't intuition — it's architecture. A
          system for what you already sense.
        </p>
      </motion.div>
    </section>
  );
}
