
'use client';
import { motion } from 'framer-motion';

export default function TheThreshold() {
  return (
    <section className="flex h-screen w-full flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 2 }}
        viewport={{ once: true, amount: 0.8 }}
      >
        <h2 className="text-5xl font-semibold tracking-wider">
          There is no preview.
        </h2>
        <p className="mt-4 text-2xl font-light tracking-wide">
          You enter, or you don't.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        className="mt-16 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.33 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="h-16 w-16 rounded-full bg-[#C0392B] focus:outline-none focus:ring-4 focus:ring-[#C0392B]/30"
          aria-label="Enter"
        />
        <p className="mt-4 text-sm font-light tracking-widest">Enter</p>
      </motion.div>
    </section>
  );
}
