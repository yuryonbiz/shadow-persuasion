
'use client';

import { motion } from 'framer-motion';

export default function Opening() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
      className="flex h-screen w-full items-center justify-center"
    >
      <h1 className="text-5xl font-light tracking-wider">
        You already know why you're here.
      </h1>
    </motion.section>
  );
}
