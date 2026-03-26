'use client';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      viewport={{ once: true, amount: 0.5 }}
      className="py-16 text-center"
    >
      <p className="text-sm font-light tracking-widest text-[#111111]/60">
        Shadow Persuasion · 2026
      </p>
    </motion.footer>
  );
}
