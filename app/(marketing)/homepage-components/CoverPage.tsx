'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const titleWords = ['PROJECT:', 'SHADOW', 'PERSUASION'];

const categories = [
  {
    label: 'CAREER ADVANCEMENT',
    desc: 'Salary negotiations, promotions, leadership presence',
  },
  {
    label: 'RELATIONSHIP SUCCESS',
    desc: 'Dating, marriage, family communication',
  },
  {
    label: 'BUSINESS GROWTH',
    desc: 'Sales, networking, client relationships',
  },
];

const CoverPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center p-8 overflow-hidden"
    >
      {/* Scan-line sweep animation */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] z-20"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #C8A84E 30%, #E8D48B 50%, #C8A84E 70%, transparent 100%)',
          boxShadow: '0 0 12px 2px rgba(200,168,78,0.5)',
        }}
        initial={{ y: 0, opacity: 1 }}
        animate={isInView ? { y: '100vh', opacity: [1, 1, 0] } : {}}
        transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
      />

      {/* CLASSIFIED / DECLASSIFIED stamps */}
      <div className="absolute top-8 right-8 z-10">
        <motion.p
          className="text-red-800 text-3xl font-bold border-4 border-red-800 p-2 transform -rotate-12 origin-center"
          style={{ fontFamily: 'monospace' }}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 0.55 } : {}}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 15,
            delay: 1.4,
          }}
        >
          CLASSIFIED
        </motion.p>
        <motion.p
          className="text-[#8B6914] text-3xl font-bold border-4 border-[#8B6914] p-2 transform rotate-12 origin-center absolute top-4 -left-4"
          style={{ fontFamily: 'monospace' }}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 0.7 } : {}}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 15,
            delay: 1.7,
          }}
        >
          DECLASSIFIED
        </motion.p>
      </div>

      <div className="z-0 max-w-5xl mx-auto">
        {/* Document number */}
        <motion.p
          className="text-sm uppercase tracking-[0.3em] text-[#6B5B3E]"
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          DOC-SC-2026-001 // PUBLIC ACCESS
        </motion.p>

        {/* Staggered title */}
        <h1 className="text-6xl md:text-8xl font-bold my-4 flex flex-wrap items-center justify-center gap-x-5">
          {titleWords.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : {}
              }
              transition={{ duration: 0.6, delay: 0.4 + i * 0.2 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-[#5C4B32] max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          Advanced Strategic Communication Training for Career Success, Better
          Relationships &amp; Personal Growth
        </motion.p>

        {/* Category cards */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                className="border-2 border-[#A0884A] bg-[#F4ECD8]/60 p-5 backdrop-blur-sm"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(160,136,74,0.08)',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 1.3 + i * 0.15,
                  ease: 'easeOut',
                }}
              >
                <p className="font-bold text-[#5C3A1E] tracking-wide">
                  {cat.label}
                </p>
                <p className="text-sm text-[#7A6543] mt-1">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Classification line */}
        <motion.div
          className="mt-12 text-base text-[#6B5B3E] space-y-1 tracking-wide"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <p>CLASSIFICATION: Strategic Communication Psychology</p>
          <p>PURPOSE: Ethical Influence for Positive Outcomes</p>
        </motion.div>

        {/* Ethics checkbox */}
        <motion.div
          className="flex items-center justify-center space-x-3 mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2.0 }}
        >
          <div className="w-6 h-6 border-2 border-[#5C3A1E] flex items-center justify-center text-2xl font-bold text-[#5C3A1E]">
            &#10003;
          </div>
          <span className="text-[#5C3A1E]">
            I commit to using these techniques ethically and responsibly
          </span>
        </motion.div>

        {/* CTA button */}
        <motion.button
          className="mt-8 bg-[#0D0D0D] text-[#F4ECD8] py-3 px-8 text-lg font-bold flex items-center justify-center mx-auto hover:bg-[#1A1A1A] transition-colors duration-300 border border-[#A0884A]/30"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 2.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          BEGIN TRAINING PROGRAM <ArrowRight className="ml-2" />
        </motion.button>

        {/* Footer text */}
        <motion.div
          className="mt-6 text-sm text-[#7A6543] max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.4 }}
        >
          <p>
            Master the psychology of persuasion for career advancement, stronger
            relationships, and personal success. Ethical influence training based
            on proven psychological principles.
          </p>
        </motion.div>
      </div>

      {/* Corner glow */}
      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-radial-gradient from-[#8B6914]/20 to-transparent rounded-full opacity-30" />
    </div>
  );
};

export default CoverPage;
