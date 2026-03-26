'use client';

import { motion } from 'framer-motion';

const timelinePhases = [
  {
    phase: '01',
    title: 'Reconnaissance',
    description: 'Gather intelligence and identify key psychological vulnerabilities.',
  },
  {
    phase: '02',
    title: 'Calibration',
    description: 'Establish a baseline of behavior and emotional response.',
  },
  {
    phase: '03',
    title: 'Frame Deployment',
    description: 'Introduce the desired narrative and anchor it as the default context.',
  },
  {
    phase: '04',
    title: 'Leverage Application',
    description: 'Systematically apply influence techniques to shift perspectives.',
  },
  {
    phase: '05',
    title: 'Extraction',
    description: 'Secure the desired outcome and disengage from the interaction.',
  },
  {
    phase: '06',
    title: 'Control Consolidation',
    description: 'Reinforce the new frame and ensure long-term behavioral change.',
  },
];

export default function TacticalTimeline() {
  return (
    <section className="my-12">
      <h2 className="mb-8 font-mono text-3xl uppercase tracking-widest text-white">
        Tactical Timeline
      </h2>
      <div className="relative border-l-2 border-[#1A2E1A]">
        {timelinePhases.map((item, index) => (
          <motion.div
            key={item.phase}
            className="mb-8 ml-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div
              className={`absolute -left-4 mt-1.5 h-8 w-8 rounded-full border-2 ${
                index === 2
                  ? 'border-[#FF8C00] bg-[#1A2E1A]'
                  : 'border-[#333] bg-[#0C0C0C]'
              } flex items-center justify-center`}
            >
              <span className="font-mono text-xs">{item.phase}</span>
            </div>
            <h3 className="mb-1 text-xl font-semibold uppercase text-white">
              {item.title}
            </h3>
            <p className="text-sm font-light text-gray-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
