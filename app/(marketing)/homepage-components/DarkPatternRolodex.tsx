'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

const TechniqueCard = ({ pattern, index, total }: { pattern: typeof patterns[number]; index: number; total: number }) => (
  <div className="bg-[#F4ECD8] border-2 border-gray-400 shadow-xl rounded-sm p-5 flex flex-col justify-between h-full">
    <div className="absolute top-2 right-2 text-xs font-mono text-gray-400">
      {index + 1}/{total}
    </div>
    <div>
      <h3 className="font-special-elite text-xl font-bold text-black">{pattern.name}</h3>
      <p className="text-sm text-gray-700 leading-snug mt-2">{pattern.description}</p>
    </div>
    <div className="mt-3">
      <div className="font-mono text-xs text-gray-500">{pattern.context}</div>
      <div className="flex items-center gap-2 mt-2 font-mono text-xs">
        <div>Effectiveness:</div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-3 w-1.5 ${i < pattern.effectiveness ? 'bg-black' : 'bg-gray-300'}`} />
          ))}
        </div>
        <div>{pattern.effectiveness}/10</div>
      </div>
    </div>
  </div>
);

const DarkPatternRolodex = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const mid = (patterns.length - 1) / 2;

  return (
    <section className="relative py-16">
        <div className="text-left mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
            APPENDIX E: TECHNIQUE PREVIEW
            </h2>
            <p className="text-3xl mt-2">Sample Techniques from the Library</p>
        </div>

        {/* Mobile: swipeable horizontal scroll */}
        <div
          className="flex lg:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style>{`.tech-scroll::-webkit-scrollbar { display: none; }`}</style>
          {patterns.map((pattern, index) => (
            <div
              key={index}
              className="relative min-w-[260px] w-[260px] h-[220px] flex-shrink-0 snap-center"
            >
              <TechniqueCard pattern={pattern} index={index} total={patterns.length} />
            </div>
          ))}
        </div>

        {/* Desktop: fanned-out overlapping cards */}
        <div className="relative hidden lg:block h-[420px] max-w-6xl mx-auto">
          {patterns.map((pattern, index) => {
            const offset = index - mid;
            const xSpread = offset * 120;
            const yDip = Math.abs(offset) * 12;
            const rotation = offset * 3;
            const isHovered = hoveredCard === index;
            const zBase = index + 10;

            return (
              <motion.div
                key={index}
                className="absolute left-1/2 top-8 w-[260px] h-[250px] cursor-pointer"
                style={{
                  zIndex: isHovered ? 50 : zBase,
                  x: `calc(-50% + ${xSpread}px)`,
                  y: yDip,
                  rotate: rotation,
                }}
                whileHover={{
                  y: -20,
                  scale: 1.08,
                  rotate: 0,
                  transition: { duration: 0.2 },
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <TechniqueCard pattern={pattern} index={index} total={patterns.length} />
              </motion.div>
            );
          })}
        </div>

        {/* File info */}
        <div className="text-center mt-8">
            <p className="font-mono text-sm text-gray-500 uppercase tracking-wider">
                [700+ Techniques Available Inside the Full Library]
            </p>
        </div>
    </section>
  );
};

export default DarkPatternRolodex;
