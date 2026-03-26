
'use client';
import { motion } from 'framer-motion';

export default function TheSpace() {
  return (
    <section className="flex h-[60vh] items-center justify-center">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true, amount: 0.8 }}
        className="text-sm font-light tracking-wide text-[#111111]/70"
      >
        This is where most brands would try to convince you.
      </motion.p>
    </section>
  );
}
