'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const patterns = [
  { name: "ANCHORING", description: "Set the reference point in any negotiation to frame what's reasonable.", effectiveness: 8, context: "Negotiation, Sales" },
  { name: "STRATEGIC SILENCE", description: "Use well-timed pauses to create space for the other party to fill.", effectiveness: 9, context: "Negotiation, Conflict Resolution" },
  { name: "SCARCITY FRAMING", description: "Communicate genuine urgency or limited availability.", effectiveness: 7, context: "Sales, Business" },
  { name: "PATTERN INTERRUPT", description: "Break someone's expected script to open them to a new perspective.", effectiveness: 8, context: "Conversations, Presentations" },
  { name: "MIRRORING", description: "Match body language and communication style to build natural rapport.", effectiveness: 6, context: "Rapport Building" },
  { name: "FRAME CONTROL", description: "Define the context and meaning of any interaction.", effectiveness: 10, context: "All Interactions" },
  { name: "SOCIAL PROOF", description: "Leverage credible third-party validation to support your position.", effectiveness: 7, context: "Sales, Persuasion" },
  { name: "EMOTIONAL REFRAMING", description: "Shift the emotional context of a conversation to create alignment.", effectiveness: 9, context: "High-Stakes Conversations" },
];

const DarkPatternRolodex = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [selectedFile, setSelectedFile] = useState(0);

  // Get three files to display
  const displayFiles = [patterns[0], patterns[1], patterns[2]];

  return (
    <section className="relative py-16" ref={ref}>
        <div className="text-left mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
            APPENDIX E: TECHNIQUE PREVIEW
            </h2>
            <p className="text-3xl mt-2">Sample Techniques from the Library</p>
        </div>

        {/* Mobile: swipeable horizontal scroll */}
        <div
          className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`[style*="scrollbar-width: none"]::-webkit-scrollbar { display: none; }`}</style>
          {patterns.map((pattern, index) => (
            <motion.div
              key={index}
              className="min-w-[280px] w-[280px] flex-shrink-0 snap-center bg-[#F4ECD8] border-2 border-gray-400 shadow-xl rounded-sm p-6 flex flex-col justify-between"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-xs font-mono text-gray-400 mb-2">
                FILE: {index + 1} of {patterns.length}
              </div>
              <div>
                <h3 className="font-special-elite text-2xl font-bold text-black">
                  {pattern.name}
                </h3>
                <p className="text-base text-gray-700 leading-snug mt-2">
                  {pattern.description}
                </p>
              </div>
              <div className="mt-4">
                <div className="font-mono text-xs text-gray-500">
                  Context: {pattern.context}
                </div>
                <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                  <div>Effectiveness:</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({length: 10}).map((_, i) => (
                      <div key={i} className={`h-3 w-1.5 ${i < pattern.effectiveness ? 'bg-black' : 'bg-gray-300'}`}></div>
                    ))}
                  </div>
                  <div>{pattern.effectiveness}/10</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: overlapping cards */}
        <div className="relative h-80 hidden md:flex items-center justify-center">
            {displayFiles.map((pattern, index) => (
                <motion.div
                    key={index}
                    className={`absolute w-[320px] h-64 bg-[#F4ECD8] border-2 border-gray-400 shadow-xl rounded-sm p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedFile === index ? 'z-30' : index === 1 ? 'z-20' : 'z-10'
                    }`}
                    style={{
                        transform: `
                            translateX(${(index - 1) * 25}px)
                            translateY(${index * 8}px)
                            rotate(${(index - 1) * 2}deg)
                        `,
                        boxShadow: selectedFile === index
                            ? '0 20px 40px rgba(0,0,0,0.3)'
                            : '0 10px 20px rgba(0,0,0,0.15)'
                    }}
                    initial={{ opacity: 0, y: 50, rotate: 0 }}
                    animate={inView ? {
                        opacity: 1,
                        y: index * 8,
                        rotate: (index - 1) * 2,
                        x: (index - 1) * 25
                    } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    onClick={() => setSelectedFile(index)}
                    whileHover={{
                        scale: 1.05,
                        y: index * 8 - 5,
                        transition: { duration: 0.2 }
                    }}
                >
                    <div className="absolute top-2 right-2 text-xs font-mono text-gray-400">
                        FILE: {index + 1} of {patterns.length}
                    </div>
                    <div>
                        <h3 className="font-special-elite text-2xl font-bold text-black">
                            {pattern.name}
                        </h3>
                        <p className="text-base text-gray-700 leading-snug mt-2">
                            {pattern.description}
                        </p>
                    </div>
                    <div>
                        <div className="font-mono text-xs text-gray-500">
                            Context: {pattern.context}
                        </div>
                        <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                            <div>Effectiveness:</div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({length: 10}).map((_, i) => (
                                    <div key={i} className={`h-3 w-1.5 ${i < pattern.effectiveness ? 'bg-black' : 'bg-gray-300'}`}></div>
                                ))}
                            </div>
                            <div>{pattern.effectiveness}/10</div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* File info */}
        <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
        >
            <p className="font-mono text-sm text-gray-500 uppercase tracking-wider">
                [50+ Techniques Available Inside the Full Library]
            </p>
        </motion.div>
    </section>
  );
};

export default DarkPatternRolodex;
