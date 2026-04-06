'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const patterns = [
  { name: "ANCHORING", description: "Set the initial frame of reference for a negotiation.", effectiveness: 8, context: "Negotiation, Sales" },
  { name: "THE VOID PULL", description: "Use strategic silence to make the other party fill the void.", effectiveness: 9, context: "Negotiation, Conflict" },
  { name: "SCARCITY FRAME", description: "Create urgency by highlighting limited availability.", effectiveness: 7, context: "Sales, Marketing" },
  { name: "PATTERN INTERRUPTION", description: "Break someone's expected script to make them more suggestible.", effectiveness: 8, context: "Social Engineering" },
  { name: "MIRRORING", description: "Subtly mimic body language to build subconscious rapport.", effectiveness: 6, context: "Rapport Building" },
  { name: "FRAME CONTROL", description: "Define the context and meaning of the interaction.", effectiveness: 10, context: "All Interactions" },
  { name: "SOCIAL PROOF", description: "Leverage the influence of others to validate a choice.", effectiveness: 7, context: "Marketing, Persuasion" },
  { name: "EMOTIONAL HIJACKING", description: "Shift a conversation from a logical to an emotional basis.", effectiveness: 9, context: "High-Stakes Persuasion" },
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
            APPENDIX E: DARK PATTERN INDEX
            </h2>
            <p className="text-3xl mt-2">Partial Listing</p>
        </div>

        <div className="relative h-80 flex items-center justify-center">
            {/* Three overlapping files */}
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
                [{patterns.length - 3} Additional Files Classified]
            </p>
        </motion.div>
    </section>
  );
};

export default DarkPatternRolodex;
