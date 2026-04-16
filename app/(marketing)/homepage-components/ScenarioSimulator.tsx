
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const scenario = {
  without: {
    title: 'Standard Response',
    response:
      "I understand the budget is tight. Can we revisit this in six months? I'm committed to proving my value and hopefully we can make it work then. I appreciate you considering it.",
  },
  with: {
    title: 'Protocol-Enhanced Response',
    response:
      "I appreciate the transparency. I want to make sure we're aligned. Based on my research, the market rate for this role with my track record is in the $95-110K range. I'm not looking to leave, but I do need my compensation to reflect the value I'm delivering. What would need to happen for us to close that gap this quarter?",
  },
};

const ScenarioSimulator = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0] flex justify-center"
    >
      <div className="max-w-5xl w-full">
        <div className="text-left mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest text-amber-500/70">
            EXHIBIT C: SCENARIO SIMULATOR
          </h2>
          <p className="text-3xl md:text-4xl mt-2 text-white">
            Tactical Response Comparison
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WITHOUT card */}
          <motion.div
            className="relative border-2 border-red-800/60 bg-[#222] p-6 sm:p-8 shadow-2xl rounded-lg"
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-t-lg" />
            <h3 className="font-mono text-sm uppercase tracking-widest text-red-400 mb-1">
              Without Protocol
            </h3>
            <p className="text-xs text-red-400/50 font-mono mb-6">
              {scenario.without.title}
            </p>
            <p className="text-lg leading-relaxed text-gray-400 italic">
              &ldquo;{scenario.without.response}&rdquo;
            </p>
          </motion.div>

          {/* VS badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex">
            <motion.div
              className="w-14 h-14 rounded-full bg-[#1A1A1A] border-2 border-amber-500 flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <span className="font-mono text-amber-400 font-bold text-sm">
                VS
              </span>
            </motion.div>
          </div>

          {/* WITH card */}
          <motion.div
            className="relative border-2 border-amber-600/50 bg-[#222] p-6 sm:p-8 shadow-2xl rounded-lg"
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 rounded-t-lg" />
            <h3 className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-1">
              With Protocol
            </h3>
            <p className="text-xs text-amber-400/50 font-mono mb-6">
              {scenario.with.title}
            </p>
            <p className="text-lg leading-relaxed text-gray-200">
              &ldquo;{scenario.with.response}&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ScenarioSimulator;
