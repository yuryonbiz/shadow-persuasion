
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const levels = [
  {
    name: 'BEGINNER',
    description: 'Learn the fundamentals of strategic communication and influence awareness',
    classification: 'CLEARANCE: LEVEL 1',
    fileNum: 'PRS-001',
  },
  {
    name: 'PRACTITIONER',
    description: 'Core frameworks mastered. Consistent application in real conversations.',
    classification: 'CLEARANCE: LEVEL 2',
    fileNum: 'PRS-002',
  },
  {
    name: 'STRATEGIST',
    description: 'Advanced technique deployment. Real-time scenario handling.',
    classification: 'CLEARANCE: LEVEL 3',
    fileNum: 'PRS-003',
  },
  {
    name: 'SPECIALIST',
    description: 'Multi-technique stacking. Personalized influence strategies.',
    classification: 'CLEARANCE: LEVEL 4',
    fileNum: 'PRS-004',
  },
  {
    name: 'MASTER',
    description: 'Full command of all frameworks. Teaching-level understanding.',
    classification: 'CLEARANCE: LEVEL 5',
    fileNum: 'PRS-005',
  },
];

const ProgressionPath = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref} className="relative py-16">
      <div className="text-left mb-16">
        <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
          APPENDIX D: OPERATOR PROGRESSION PATH
        </h2>
        <p className="text-3xl mt-2">Career Trajectory</p>
      </div>

      {/* Alternating timeline grid */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] gap-x-6 gap-y-10 max-w-6xl mx-auto">
        {/* Center line */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-300"
          style={{ gridColumn: '2' }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 bg-amber-500 origin-top"
          initial={{ height: 0 }}
          animate={inView ? { height: '100%' } : {}}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {levels.map((level, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div
              key={level.name}
              className="contents"
            >
              {/* Left cell */}
              {isLeft ? (
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: -50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card level={level} />
                </motion.div>
              ) : (
                <div />
              )}

              {/* Center dot */}
              <div className="flex items-center justify-center relative z-10">
                <motion.div
                  className="w-4 h-4 rounded-full bg-amber-500 border-4 border-[#F4ECD8]"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                />
              </div>

              {/* Right cell */}
              {!isLeft ? (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: 50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card level={level} />
                </motion.div>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const Card = ({
  level,
}: {
  level: { name: string; description: string; classification: string; fileNum: string };
}) => (
  <div className="w-full max-w-sm bg-[#EDE3D0] border-2 border-gray-400 p-6 relative shadow-md">
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
      <p className="text-gray-700 text-sm leading-relaxed">{level.description}</p>
    </div>

    {/* Distressed paper effect */}
    <div
      className="absolute inset-0 border-2 border-gray-300 opacity-30 pointer-events-none"
      style={{
        clipPath: 'polygon(0% 0%, 98% 0%, 100% 95%, 2% 100%)',
      }}
    />
  </div>
);

export default ProgressionPath;
