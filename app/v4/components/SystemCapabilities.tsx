
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const capabilities = [
  {
    icon: '[>_]',
    title: 'AI Operator Console',
    description: 'Real-time AI guidance for negotiations, conversations, and high-stakes encounters. Feed it context. Get tactical responses.',
    classified: false,
  },
  {
    icon: '[◉]',
    title: 'Visual Intelligence',
    description: 'Upload screenshots, body language photos, or conversation logs. AI decodes what others miss — micro-expressions, power dynamics, hidden intent.',
    classified: true,
  },
  {
    icon: '[◆]',
    title: 'Dark Psychology Engine',
    description: '50+ influence frameworks. Pattern interruption, frame control, anchoring, the void pull. Learn the system. Deploy the tactics.',
    classified: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Stamp = ({ text, color, className }: { text: string; color: string; className?: string }) => (
  <div className={`absolute -rotate-6 scale-110 border-2 ${color} p-1 text-xs font-bold uppercase tracking-wider ${color} opacity-80 ${className}`}>
    {text}
  </div>
);


export const SystemCapabilities = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="relative bg-[#EDE3D0] rounded-lg p-8 md:p-12">
        <div className="absolute top-8 right-8 -rotate-12 opacity-70">
            <div className="border-2 border-green-600 text-green-600 font-bold uppercase tracking-wider p-2 text-sm">
                Verified
            </div>
        </div>
        <div className="text-left mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            System Capabilities
          </h2>
          <div className="w-24 h-1 bg-red-600 mt-4"></div>
          <p className="font-mono text-sm uppercase tracking-widest text-gray-600 mt-4">
            Declassified Overview
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col rounded-sm border border-[#999] bg-[#F4ECD8] p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black"
            >
              {capability.classified && (
                <Stamp text="CLASSIFIED" color="border-red-600 text-red-600" className="top-4 right-4" />
              )}
              <div className="font-mono text-2xl text-black mb-4">{capability.icon}</div>
              <h3 className="font-special-elite text-xl font-bold text-black">
                {capability.title}
              </h3>
              <p className="mt-2 text-base text-gray-800 leading-relaxed font-special-elite">
                {capability.description}
              </p>
              <div className="flex-grow" />
              <div className="mt-6 flex items-center gap-2 border-t border-dashed border-gray-400 pt-4">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 border border-green-700"></div>
                <span className="font-mono text-xs uppercase text-green-800 tracking-wider">
                  Status: Operational
                </span>
              </div>
            </motion.div>
          ))}
        </div>
    </section>
  );
};
