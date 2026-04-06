
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    codename: 'VIPER',
    title: 'HIGH-TICKET SALES',
    quote:
      'I used to see conversations as a two-way street. Shadow Persuasion revealed it\'s a chessboard, and I was playing checkers. My close rate went from 20% to over 80% in three months. The AI doesn\'t just give you lines; it teaches you how to control the frame from the first word.',
  },
  {
    codename: 'SPECTRE',
    title: 'CORPORATE ACQUISITIONS',
    quote:
      'I deal with corporate acquisitions. My job is to find the breaking point. Before this, it was intuition and expensive research. Now, it\'s a science. The profiling unit gave me a full psychological workup of a target CEO from a few of his public interviews. I structured my entire offer around that insight, and they accepted a bid 30% lower than their board\'s initial asking price.',
  },
  {
    codename: 'ECHO',
    title: 'STRATEGIC FUNDRAISING',
    quote:
      'The Visual Intelligence Module is terrifyingly effective. I uploaded a photo from a fundraising dinner, and the analysis of the board members\' body language gave me the leverage I needed to secure a seven-figure donation. This feels like a superpower.',
  },
];

const Statements = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref}>
      <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">
        SWORN STATEMENTS
      </h2>
      <p className="text-3xl mt-1 mb-12">Field Operator Testimonials</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.codename}
            className="bg-[#F4ECD8] border border-gray-300 rounded-lg p-6 flex flex-col shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            {/* Quotation mark */}
            <span className="text-5xl leading-none text-amber-600/40 font-serif select-none">
              &ldquo;
            </span>

            {/* Quote */}
            <p className="text-gray-800 text-sm leading-relaxed mt-2 flex-1">
              {t.quote}
            </p>

            {/* Separator */}
            <div className="border-t border-gray-300 mt-6 pt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold">
                [{t.codename}]
              </p>
              <p className="font-mono text-xs text-gray-500 mt-1">
                {t.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Statements;
