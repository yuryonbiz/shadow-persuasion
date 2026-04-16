'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const titleWords = ['PROJECT:', 'SHADOW', 'PERSUASION'];

const categories = [
  {
    label: 'CAREER ADVANCEMENT',
    desc: '"I got a $34K raise using one conversation framework"',
  },
  {
    label: 'RELATIONSHIP SUCCESS',
    desc: '"I finally understood what people actually mean vs. what they say"',
  },
  {
    label: 'BUSINESS GROWTH',
    desc: '"Closed my first six-figure deal after 3 weeks of training"',
  },
];

const CoverPage = () => {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 py-8 overflow-hidden"
    >
      {/* Logo — above title, centered */}
      <div className="z-10 mb-4">
        <img src="/logo.png" alt="Shadow Persuasion" className="w-48 md:w-80 mx-auto" />
      </div>

      {/* CLASSIFIED / DECLASSIFIED stamps — hidden on small mobile */}
      <div className="absolute top-8 right-8 z-10 hidden sm:block">
        <p
          className="text-red-700 text-3xl font-bold border-4 border-red-700 p-2 transform -rotate-12 origin-center scale-110 opacity-60"
          style={{ fontFamily: 'monospace' }}
        >
          CLASSIFIED
        </p>
        <p
          className="text-green-700 text-3xl font-bold border-4 border-green-700 p-2 transform rotate-12 origin-center absolute top-4 -left-4 scale-125 opacity-70"
          style={{ fontFamily: 'monospace' }}
        >
          DECLASSIFIED
        </p>
      </div>

      <div className="z-0 max-w-5xl mx-auto">
        {/* Document number */}
        <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.3em] text-[#6B5B3E]">
          DOC-SP-2026 // AUTHORIZED ACCESS
        </p>

        {/* Staggered title — PROJECT: on one line, SHADOW PERSUASION below */}
        <h1 className="text-center my-4">
          <span className="block text-2xl sm:text-3xl md:text-5xl font-bold tracking-widest text-[#1A1A1A]">
            PROJECT:
          </span>
          <span className="block text-4xl sm:text-6xl md:text-8xl font-bold tracking-wider text-[#1A1A1A]">
            SHADOW PERSUASION
          </span>
        </h1>

        {/* Subtitle — black text */}
        <p className="text-lg sm:text-xl md:text-2xl text-[#1A1A1A] max-w-3xl mx-auto px-2">
          You&apos;re Leaving Money, Relationships, and Respect on the Table. Because Nobody Taught You How Influence Actually Works
        </p>

        {/* Category cards */}
        <div className="mt-10 max-w-4xl mx-auto px-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            {categories.map((cat, i) => (
              <div
                key={cat.label}
                className="border-2 border-[#A0884A] bg-[#F4ECD8]/60 p-5 backdrop-blur-sm"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(160,136,74,0.08)',
                }}
              >
                <p className="font-bold text-[#5C3A1E] tracking-wide">
                  {cat.label}
                </p>
                <p className="text-sm text-[#7A6543] mt-1">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Classification line */}
        <div className="mt-12 text-base text-[#6B5B3E] space-y-1 tracking-wide">
          <p>CLASSIFICATION: AI-Powered Influence Psychology Training</p>
          <p>STATUS: Now Accepting New Members</p>
        </div>

        {/* CTA button */}
        <motion.button
          className="mt-8 bg-[#0D0D0D] text-[#F4ECD8] py-3 px-8 text-lg font-bold flex items-center justify-center mx-auto hover:bg-[#1A1A1A] transition-colors duration-300 border border-[#A0884A]/30"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          START YOUR TRAINING: $99/MONTH <ArrowRight className="ml-2" />
        </motion.button>

        {/* Footer text */}
        <div className="mt-6 text-sm text-[#7A6543] max-w-2xl mx-auto">
          <p>
            Used by sales professionals, founders, executives, and anyone tired of being outmaneuvered in conversations that matter. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Corner glow */}
      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-radial-gradient from-[#8B6914]/20 to-transparent rounded-full opacity-30" />
    </div>
  );
};

export default CoverPage;
