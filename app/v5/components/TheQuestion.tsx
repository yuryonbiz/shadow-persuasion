
'use client';

import { motion } from 'framer-motion';

export default function TheQuestion() {
  return (
    <section className="flex h-[90vh] w-full flex-col items-center justify-center space-y-8">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true, amount: 0.8 }}
        className="text-4xl font-light tracking-wide"
      >
        The question isn't whether you want power.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        className="text-4xl font-light tracking-wide"
      >
        It's whether you'll admit it.
      </motion.p>
    </section>
  );
}
