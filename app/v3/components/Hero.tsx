"use client";

import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="text-center py-24 sm:py-32 border-b border-steel-gray">
      <div className="mb-4">
        <p className="text-clinical-red font-mono text-sm tracking-widest uppercase">
          Department of Applied Psychological Influence
        </p>
      </div>
      <h1 className="font-libre-baskerville text-5xl sm:text-6xl md:text-7xl font-bold text-navy-deep tracking-tight">
        The Science of <br />Moving Minds
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-navy leading-8">
        A systematic framework for understanding and deploying psychological influence in high-stakes professional environments.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-x-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#1A1A2E] text-[#FAF8F5] px-8 py-3 text-lg font-semibold rounded-lg shadow-md hover:bg-[#16213E] transition-all duration-300"
        >
          Access the Research
        </motion.button>
        <motion.a
          href="#"
          whileHover={{ x: 4 }}
          className="text-navy group flex items-center gap-x-2 text-lg"
        >
          Read the methodology <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </motion.a>
      </div>
      <div className="mt-16 max-w-2xl mx-auto border-t border-steel-gray pt-6">
        <div className="flex justify-between text-sm text-steel-gray-light font-mono">
          <span>Published: March 26, 2026</span>
          <span>Edition: III.I</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
