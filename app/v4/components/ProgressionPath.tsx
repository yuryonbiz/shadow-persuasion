'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const levels = [
  { name: 'RECRUIT', description: 'Basic influence awareness, pattern recognition fundamentals' },
  { name: 'INITIATE', description: 'Core frameworks mastered, AI console access granted' },
  { name: 'OPERATOR', description: 'Advanced deployment, real-time scenario handling' },
  { name: 'SHADOW OPERATIVE', description: 'Multi-layered influence architecture, target profiling' },
  { name: 'ARCHITECT', description: 'System design, framework creation, teaching capability' },
];

const Stamp = ({ text, className }: { text: string; className?: string }) => (
    <div className={`absolute border-2 border-red-600 p-1 text-xs font-bold uppercase tracking-wider text-red-600 opacity-80 ${className}`}>
      {text}
    </div>
);

const ProgressionPath = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <section ref={ref} className="relative py-16">
      <div className="text-left mb-16">
        <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
          APPENDIX D: OPERATOR PROGRESSION PATH
        </h2>
        <p className="text-3xl mt-2">Career Trajectory</p>
        <Stamp text="PROGRESSION: CLASSIFIED" className="top-0 right-0 rotate-6" />
      </div>

      <div className="hidden md:block">
        <div className="relative w-full">
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-gray-300" 
            style={{transform: 'translateY(-50%)'}}
            initial={{width: '0%'}}
            animate={inView ? {width: '100%'} : {}}
            transition={{duration: 2, ease: 'easeInOut'}}
          />
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-amber-500" 
            style={{transform: 'translateY(-50%)'}}
            initial={{width: '0%'}}
            animate={inView ? {width: '100%'} : {}}
            transition={{duration: 2, ease: 'easeInOut'}}
          />
          <div className="relative flex justify-between overflow-visible">
            {levels.map((level, index) => (
              <div key={level.name} className="flex flex-col items-center z-10">
                  <motion.div
                    initial={{scale: 0}}
                    animate={inView ? {scale: 1} : {}}
                    transition={{duration: 0.5, delay: index * 0.4}}
                  >
                    <div className={`w-8 h-8 rounded-full border-4 border-amber-500 bg-[#F4ECD8] flex items-center justify-center`}>
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>
                  </motion.div>
                  <div className="text-center mt-4 w-32">
                      <motion.h3 
                        className="font-mono text-sm uppercase tracking-widest text-black"
                        initial={{opacity: 0}}
                        animate={inView ? {opacity: 1} : {}}
                        transition={{duration: 0.5, delay: index * 0.4 + 0.5}}
                      >
                        {level.name}
                      </motion.h3>
                      <motion.p 
                        className="text-xs text-gray-600 mt-1"
                        initial={{opacity: 0}}
                        animate={inView ? {opacity: 1} : {}}
                        transition={{duration: 0.5, delay: index * 0.4 + 0.7}}
                      >
                        {level.description}
                      </motion.p>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-8">
         {levels.map((level, index) => (
            <motion.div 
                key={level.name}
                className="flex items-center gap-4"
                initial={{opacity: 0, x: -20}}
                animate={inView ? {opacity: 1, x: 0} : {}}
                transition={{duration: 0.5, delay: index * 0.3}}
            >
                <div className="w-6 h-6 rounded-full bg-amber-500 flex-shrink-0"></div>
                <div>
                    <h3 className="font-mono text-sm uppercase tracking-widest text-black">{level.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{level.description}</p>
                </div>
            </motion.div>
         ))}
      </div>

    </section>
  );
};

export default ProgressionPath;
