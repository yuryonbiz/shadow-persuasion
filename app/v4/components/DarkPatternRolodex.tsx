'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const cardVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8,
        rotate: direction > 0 ? 10 : -10,
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      },
      exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8,
        rotate: direction < 0 ? 10 : -10,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      }),
}

const DarkPatternRolodex = () => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const patternIndex = (page % patterns.length + patterns.length) % patterns.length;


  return (
    <section className="relative py-16">
        <div className="text-left mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
            APPENDIX E: DARK PATTERN INDEX
            </h2>
            <p className="text-3xl mt-2">Partial Listing</p>
        </div>

        <div className="relative h-80 flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute w-[320px] h-64 bg-[#F4ECD8] border-2 border-gray-400 shadow-xl rounded-sm p-6 flex flex-col justify-between"
                    style={{transformStyle: 'preserve-3d'}}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -10000) {
                        paginate(1);
                      } else if (swipe > 10000) {
                        paginate(-1);
                      }
                    }}
                >
                    <div className="absolute top-2 right-2 text-xs font-mono text-gray-400">FILE: {patternIndex + 1} of {patterns.length}</div>
                   <div>
                     <h3 className="font-special-elite text-2xl font-bold text-black">{patterns[patternIndex].name}</h3>
                     <p className="text-base text-gray-700 leading-snug mt-2">{patterns[patternIndex].description}</p>
                   </div>
                   <div>
                        <div className="font-mono text-xs text-gray-500">Context: {patterns[patternIndex].context}</div>
                        <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                            <div>Effectiveness:</div>
                            <div className="flex items-center gap-0.5">
                                {Array.from({length: 10}).map((_, i) => (
                                    <div key={i} className={`h-3 w-1.5 ${i < patterns[patternIndex].effectiveness ? 'bg-black' : 'bg-gray-300'}`}></div>
                                ))}
                            </div>
                            <div>{patterns[patternIndex].effectiveness}/10</div>
                        </div>
                   </div>
                </motion.div>
            </AnimatePresence>

            <button onClick={() => paginate(-1)} className="absolute left-0 z-20 p-2 bg-white/50 rounded-full shadow-md text-black hover:bg-white">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => paginate(1)} className="absolute right-0 z-20 p-2 bg-white/50 rounded-full shadow-md text-black hover:bg-white">
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    </section>
  );
};

export default DarkPatternRolodex;
