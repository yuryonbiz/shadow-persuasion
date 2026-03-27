'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const levels = [
  { 
    name: 'RECRUIT', 
    description: 'Basic influence awareness, pattern recognition fundamentals',
    classification: 'CLEARANCE: LEVEL 1',
    fileNum: 'PRS-001'
  },
  { 
    name: 'INITIATE', 
    description: 'Core frameworks mastered, AI console access granted',
    classification: 'CLEARANCE: LEVEL 2', 
    fileNum: 'PRS-002'
  },
  { 
    name: 'OPERATOR', 
    description: 'Advanced deployment, real-time scenario handling',
    classification: 'CLEARANCE: LEVEL 3',
    fileNum: 'PRS-003'
  },
  { 
    name: 'SHADOW OPERATIVE', 
    description: 'Multi-layered influence architecture, target profiling',
    classification: 'CLEARANCE: LEVEL 4',
    fileNum: 'PRS-004'
  },
  { 
    name: 'ARCHITECT', 
    description: 'System design, framework creation, teaching capability',
    classification: 'CLEARANCE: LEVEL 5',
    fileNum: 'PRS-005'
  },
];

const Stamp = ({ text, className }: { text: string; className?: string }) => (
    <div className={`absolute border-2 border-red-600 p-1 text-xs font-bold uppercase tracking-wider text-red-600 opacity-80 ${className}`}>
      {text}
    </div>
);

const ProgressionPath = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section ref={ref} className="relative py-16">
      <div className="text-left mb-16">
        <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
          APPENDIX D: OPERATOR PROGRESSION PATH
        </h2>
        <p className="text-3xl mt-2">Career Trajectory</p>
        <Stamp text="PROGRESSION: CLASSIFIED" className="top-0 right-0 rotate-6" />
      </div>

      {/* Vertical ladder/dossier design */}
      <div className="relative max-w-2xl mx-auto">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        <motion.div 
          className="absolute left-8 top-0 w-0.5 bg-amber-500"
          initial={{ height: 0 }}
          animate={inView ? { height: '100%' } : {}}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        
        <div className="space-y-8">
          {levels.map((level, index) => (
            <motion.div
              key={level.name}
              className="relative flex items-start gap-6"
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Level indicator */}
              <motion.div
                className="relative z-10 flex-shrink-0"
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
              >
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-[#F4ECD8]"></div>
              </motion.div>

              {/* Personnel file card */}
              <motion.div
                className="flex-1 bg-[#EDE3D0] border-2 border-gray-400 p-6 relative shadow-md"
                initial={{ opacity: 0, rotateX: -15 }}
                animate={inView ? { opacity: 1, rotateX: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
              >
                {/* File tab */}
                <div className="absolute -top-3 left-4 bg-gray-400 text-white px-3 py-1 text-xs font-mono font-bold">
                  {level.fileNum}
                </div>
                
                {/* Classification stamp */}
                <div className="absolute top-2 right-2 border border-red-600 text-red-600 px-2 py-1 text-xs font-mono font-bold">
                  {level.classification}
                </div>

                {/* Content */}
                <div className="mt-2">
                  <h3 className="font-special-elite text-xl font-bold uppercase tracking-wide text-black mb-2">
                    {level.name}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {level.description}
                  </p>
                </div>

                {/* Distressed paper effect */}
                <div className="absolute inset-0 border-2 border-gray-300 opacity-30 pointer-events-none" style={{
                  clipPath: 'polygon(0% 0%, 98% 0%, 100% 95%, 2% 100%)'
                }}></div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgressionPath;
