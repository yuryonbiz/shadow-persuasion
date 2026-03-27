
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const architects = [
  {
    img: 'https://i.pravatar.cc/200?img=3',
    name: 'Dr. Helena Cross',
    title: 'Psychological Operations Specialist',
    dossier: 'Former intelligence operative specializing in behavioral modification and cognitive manipulation. 15 years developing covert influence protocols for state-level negotiations.',
  },
  {
    img: 'https://i.pravatar.cc/200?img=5',
    name: 'Viktor Steinberg',
    title: 'Negotiation Architect',
    dossier: 'Built psychological frameworks for Fortune 500 mergers worth $340B+ collective value. Known for creating decision environments that predetermine outcomes.',
  },
  {
    img: 'https://i.pravatar.cc/200?img=8',
    name: 'Dr. Maya Blackthorne',
    title: 'Cognitive Systems Designer',
    dossier: 'Neuroscience PhD focused on decision-making under pressure. Designs influence architectures that bypass conscious resistance.',
  },
  {
    img: 'https://i.pravatar.cc/200?img=12',
    name: 'Alexander Kane',
    title: 'Social Dynamics Engineer',
    dossier: 'Spent 12 years studying power dynamics in closed systems. Expert in social proof manipulation and environmental design for influence.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Architects = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="relative bg-[#EDE3D0] rounded-lg p-8 md:p-12">
        <div className="absolute top-8 right-8 rotate-12 opacity-70">
            <div className="border-2 border-red-600 text-red-600 font-bold uppercase tracking-wider p-2 text-sm transform -rotate-12">
                Personnel File
            </div>
        </div>
        <div className="text-left mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">Personnel Files</h2>
            <p className="font-special-elite text-3xl text-black mt-2">Classification: RESTRICTED</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {architects.map((architect, index) => (
            <motion.div
              key={architect.name}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-[#F4ECD8] border border-gray-400 p-4 rounded-sm shadow-lg relative"
            >
                <div className="absolute top-2 right-2 font-mono text-xs text-red-700 bg-red-200 border border-red-400 px-2 py-1">CLEARANCE: UMBRAL</div>
                <div className="flex items-start gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <img src={architect.img} alt={architect.name} className="w-full h-full object-cover grayscale sepia-[.5] border-2 border-black rounded-sm -rotate-3 transition-transform hover:rotate-0" />
                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-gray-400 opacity-30 transform -rotate-45"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-400 opacity-30 transform -rotate-45"></div>
                    </div>
                    <div>
                        <h3 className="font-special-elite text-xl font-bold text-black">{architect.name}</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-gray-600 mt-1">{architect.title}</p>
                    </div>
                </div>
                <div className="mt-4 border-t border-dashed border-gray-400 pt-4">
                    <p className="font-special-elite text-base text-gray-800 leading-relaxed">{architect.dossier}</p>
                </div>
            </motion.div>
          ))}
        </div>
    </section>
  );
};
