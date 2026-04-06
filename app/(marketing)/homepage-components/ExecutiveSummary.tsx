'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  BookOpen,
  Brain,
  Layers,
  Activity,
} from 'lucide-react';

const Redacted = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-black text-black inline-block px-1 transition-opacity duration-150 hover:opacity-80 cursor-pointer">
    {children}
  </span>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span style={{ background: 'rgba(200, 168, 78, 0.25)' }}>{children}</span>
);

const stats = [
  {
    icon: BookOpen,
    value: '50+',
    label: 'Influence Techniques Catalogued',
  },
  {
    icon: Brain,
    value: '12',
    label: 'Psychology Frameworks Integrated',
  },
  {
    icon: Layers,
    value: '5',
    label: 'Operational Modules',
  },
  {
    icon: Activity,
    value: 'Live',
    label: 'Real-Time Strategic Analysis',
  },
];

const paragraphs = [
  (
    <>
      Project SHADOW PERSUASION is a comprehensive strategic communication
      training system designed to empower individuals with advanced psychological
      influence techniques for{' '}
      <Highlight>positive personal and professional outcomes</Highlight>. This
      document outlines an AI-powered platform that provides students with the
      communication skills traditionally reserved for executives, negotiators,
      and influence professionals.
    </>
  ),
  (
    <>
      The core of the system is the Strategic Communication Console, an
      intelligent interface that provides real-time coaching and analysis. Users
      can <Redacted>upload conversation screenshots</Redacted> for psychological
      analysis, practice scenarios in risk-free environments, and receive
      personalized guidance for their specific goals. The system leverages proven
      psychology principles from{' '}
      <Highlight>
        behavioral science, negotiation theory, and interpersonal communication
        research
      </Highlight>
      .
    </>
  ),
  (
    <>
      The objective is to democratize advanced communication skills for
      legitimate purposes: career advancement, relationship building, business
      success, and personal growth. Beta testing shows participants achieve{' '}
      <Highlight>
        measurable improvements in salary negotiations, relationship
        satisfaction, and professional influence
      </Highlight>{' '}
      within 90 days. The system is designed for ethical application, with
      built-in guidance to ensure win-win outcomes in all interactions.
    </>
  ),
];

const ExecutiveSummary = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef}>
      {/* Header bar */}
      <div className="border-b-2 border-t-2 border-[#5C3A1E] py-1 mb-12 text-sm text-center text-[#6B5B3E] tracking-wide">
        <p>PAGE 1 of 12 | CLASSIFICATION: PUBLIC ACCESS | DATE: MARCH 2026</p>
      </div>

      <div className="relative">
        <motion.h2
          className="text-4xl font-bold uppercase tracking-wider mb-10 text-center text-[#2A1F0E]"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Executive Summary
        </motion.h2>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* Left column — text */}
          <div className="flex-1 space-y-6 text-lg leading-relaxed text-[#3B2E1A]">
            {paragraphs.map((content, i) => (
              <AnimatedParagraph key={i} index={i}>
                {content}
              </AnimatedParagraph>
            ))}
          </div>

          {/* Right column — Intelligence Brief */}
          <motion.div
            className="lg:w-[340px] flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="border-2 border-[#A0884A] bg-[#F4ECD8]/50 p-6 sticky top-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#5C3A1E] border-b border-[#A0884A]/50 pb-3 mb-5">
                Intelligence Brief
              </h3>

              <div className="space-y-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="flex items-start gap-3 p-3 border border-[#A0884A]/30 bg-[#F4ECD8]/40"
                      initial={{ opacity: 0, y: 12 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.45,
                        delay: 0.5 + i * 0.12,
                      }}
                    >
                      <div className="mt-0.5 text-[#8B6914]">
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#5C3A1E] leading-tight">
                          {stat.value}
                        </p>
                        <p className="text-sm text-[#7A6543] leading-snug">
                          {stat.label}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-[#A0884A]/40 text-xs text-[#7A6543] italic">
                Ethical influence creates win-win outcomes for all parties
                involved.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/** Scroll-triggered paragraph reveal */
function AnimatedParagraph({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12 }}
    >
      {children}
    </motion.p>
  );
}

export default ExecutiveSummary;
