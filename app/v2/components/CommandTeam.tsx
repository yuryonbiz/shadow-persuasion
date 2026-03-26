'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const team = [
  {
    img: 11,
    codename: 'Alpha',
    role: 'Lead Strategist',
    clearance: 'Level 5',
    dossier: 'Master of psychological architecture and frame control. Designed the core frameworks.',
  },
  {
    img: 13,
    codename: 'Bravo',
    role: 'Chief Operator',
    clearance: 'Level 5',
    dossier: 'Specializes in high-stakes negotiation and covert influence. Field-tested every protocol.',
  },
  {
    img: 15,
    codename: 'Charlie',
    role: 'Intel Analyst',
    clearance: 'Level 4',
    dossier: 'Expert in behavioral pattern recognition and predictive modeling. Runs all backend metrics.',
  },
  {
    img: 17,
    codename: 'Delta',
    role: 'Red Team Lead',
    clearance: 'Level 4',
    dossier: 'Dedicated to finding and exploiting weaknesses in psychological systems.',
  },
];

export default function CommandTeam() {
  return (
    <section className="my-12">
      <h2 className="mb-8 font-mono text-3xl uppercase tracking-widest text-white">
        Command Team
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member, i) => (
          <motion.div
            key={member.codename}
            className="border border-[#333] p-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="relative mx-auto mb-4 h-32 w-32 grayscale filter">
              <Image
                src={`https://i.pravatar.cc/300?img=${member.img}`}
                alt={member.codename}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
              <div className="absolute inset-0 rounded-full bg-green-900 opacity-40"></div>
            </div>
            <h3 className="font-mono text-xl font-bold uppercase text-white">
              {member.codename}
            </h3>
            <p className="font-mono text-sm text-[#FF8C00]">
              ROLE: {member.role}
            </p>
            <p className="font-mono text-xs text-red-700">
              CLEARANCE: {member.clearance}
            </p>
            <p className="mt-4 text-xs text-gray-400">{member.dossier}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
