'use client';

import { motion } from 'framer-motion';

const Redacted = ({ children, width = 'w-24' }) => (
  <motion.span
    className={`${width} inline-block bg-black text-black select-none`}
    whileHover={{ opacity: 0.85, transition: { duration: 0.05, repeat: 3, repeatType: 'reverse' } }}
  >
    {children}
  </motion.span>
);

const Highlight = ({ children }) => (
  <span className="bg-yellow-200/[.3] p-1 -m-1">{children}</span>
);

const MarginNote = ({ children }) => (
  <div className="absolute -left-28 top-0 w-24 text-sm text-[#2C5F8A] italic transform -rotate-3">
    {children}
  </div>
);

export default function ExecutiveSummary() {
  return (
    <section className="relative p-8 pt-12 border border-gray-400 bg-transparent">
      <div className="absolute top-2 right-4 text-xs">
        <p>PAGE 1 of 12</p>
        <p>LEVEL: TOP SECRET // SCI</p>
      </div>
      
      <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 mt-4">Executive Summary</h2>

      <div className="relative space-y-4 leading-relaxed">
        <MarginNote>Is this confirmed?</MarginNote>
        <p>
          Project: Shadow Persuasion is a program focused on the study and application of 
          advanced psychological techniques for the purpose of <Highlight>influence and behavioral modification</Highlight>. 
          The primary subjects of this program are high-value individuals in corporate and political arenas. 
          Our operatives have successfully infiltrated <Redacted width="w-32">several Fortune 500 companies</Redacted> and political campaigns, 
          yielding significant intelligence and measurable outcomes.
        </p>
        <p>
          Initial field tests, designated Operation <Redacted width="w-20">Mockingbird</Redacted>, confirmed the effectiveness 
          of the core methodologies. Subsequent phases have focused on refining these techniques and expanding the network of 
          operatives. The program utilizes a combination of <Redacted>neuro-linguistic programming</Redacted>, cognitive biases, and 
          subliminal messaging, delivered through both digital and interpersonal vectors. The ethical implications are still 
          under review by the <Redacted width="w-48">Oversight Committee</Redacted>, but operational effectiveness is undeniable.
        </p>
      </div>
    </section>
  );
}
