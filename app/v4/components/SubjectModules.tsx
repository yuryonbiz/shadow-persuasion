'use client';

import { motion } from 'framer-motion';

const Stamp = ({ text, color, rotation }) => (
    <div
      className={`absolute top-4 right-4 border-2 p-1 font-black text-xs uppercase opacity-70`}
      style={{
        borderColor: color,
        color: color,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {text}
    </div>
);

const Redacted = () => <span className="bg-black text-black select-none">█████████</span>;

const ModuleCard = ({ number, title, description, stamp, isRedacted }) => {
  return (
    <motion.div 
      className="relative pt-8 bg-[#E8DCC8] border border-gray-400 shadow-md"
      whileHover={{ y: -8, shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="absolute -top-1 left-4 w-24 py-1 px-4 bg-[#d1c5b0] border-t border-l border-r border-gray-400">
        <span className="font-bold tracking-wider">FILE {number}</span>
      </div>

      <div className="p-6">
        {stamp && <Stamp text={stamp.text} color={stamp.color} rotation={stamp.rotation} />}
        <h3 className="text-xl font-bold uppercase tracking-wider mb-3">{title}</h3>
        <p className="text-sm leading-relaxed">
            {isRedacted ? 
              <>This module covers <Redacted /> techniques for bypassing conscious resistance. Operatives will learn to implant suggestions and <Redacted /> through subliminal channels. The focus is on non-traceable influence vectors.</> :
              description
            }
        </p>
      </div>
    </motion.div>
  );
};

export default function SubjectModules() {
  const modules = [
    { number: '01', title: 'The Frame', description: 'Master the art of contextual control. Learn to set the stage for any interaction, defining the reality your subject operates within before a single word of persuasion is spoken.' },
    { number: '02', title: 'The Mirror', description: 'Develop deep rapport through calibrated empathy and behavioral mirroring. Become a reflection of your subject’s own mind, making your influence feel like their own idea.', stamp: { text: 'SENSITIVE', color: '#C0392B', rotation: 10 } },
    { number: '03', title: 'The Lever', description: 'Identify and exploit core human drivers—fear, desire, ego, and insecurity. Learn to apply precise psychological pressure to create predictable behavioral shifts.' },
    { number: '04', title: 'The Echo', isRedacted: true },
    { number: '05', title: 'The Catalyst', description: 'Manufacture moments of decision. Learn to construct scenarios that force your subject’s hand, guiding them toward a predetermined conclusion under the illusion of free will.', stamp: { text: 'CLASSIFIED', color: '#C0392B', rotation: 12 } },
    { number: '06', title: 'The Ghost', description: 'Learn post-influence cleanup and extraction. Erase your psychological fingerprints, leaving the subject convinced their actions were entirely self-motivated.' },
  ];

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-10">
        Subject Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((mod) => (
          <ModuleCard key={mod.number} {...mod} />
        ))}
      </div>
    </section>
  );
}
