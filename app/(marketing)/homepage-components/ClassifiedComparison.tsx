'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  { name: "Basic Influence Guide", civilian: true, operator: true },
  { name: "AI Operator Console", civilian: false, operator: true },
  { name: "Visual Intelligence", civilian: false, operator: true },
  { name: "50+ Dark Patterns", civilian: false, operator: true },
  { name: "Negotiation Simulator", civilian: false, operator: true },
  { name: "Script Generator", civilian: false, operator: true },
  { name: "Psychological Profiling", civilian: false, operator: true },
  { name: "Private Community", civilian: false, operator: true },
];

const Checkmark = ({ gold }: { gold?: boolean }) => (
  <span className={`font-bold text-lg ${gold ? 'text-[#D4A017]' : 'text-gray-500'}`}>&#10003;</span>
);
const Redacted = () => <span className="bg-gray-600 text-gray-600 select-none text-sm font-mono">DENIED</span>;

const ClassifiedComparison = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref} className="bg-[#0D0D0D] w-full py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">
            DOCUMENT COMPARISON
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-white">Access Levels</p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] items-end gap-0 mb-0">
          <div />
          <div className="text-center py-3 border-b border-white/10">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-500">Civilian</p>
            <p className="text-white font-mono text-lg mt-1">FREE</p>
          </div>
          <div className="text-center py-3 border-b-2 border-[#D4A017] bg-[#D4A017]/5 rounded-t-lg">
            <p className="font-mono text-xs uppercase tracking-wider text-[#D4A017]">Operator</p>
            <p className="text-[#D4A017] font-bold font-mono text-lg mt-1">$99/MO</p>
          </div>
        </div>

        {/* Feature rows */}
        {features.map((f, i) => (
          <motion.div
            key={f.name}
            className="grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] items-center border-b border-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <p className="text-gray-300 py-4 text-sm md:text-base">{f.name}</p>
            <div className="text-center py-4">
              {f.civilian ? <Checkmark /> : <Redacted />}
            </div>
            <div className="text-center py-4 bg-[#D4A017]/5">
              {f.operator ? <Checkmark gold /> : <Redacted />}
            </div>
          </motion.div>
        ))}

        {/* CTA row */}
        <motion.div
          className="grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] items-center mt-0"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: features.length * 0.08 + 0.2 }}
        >
          <div />
          <div />
          <div className="py-4 bg-[#D4A017]/5 flex justify-center rounded-b-lg">
            <button className="bg-[#D4A017] hover:bg-[#b88913] text-black font-bold font-mono uppercase px-4 py-2.5 text-sm tracking-wider rounded transition-colors duration-300">
              Get Access
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClassifiedComparison;
