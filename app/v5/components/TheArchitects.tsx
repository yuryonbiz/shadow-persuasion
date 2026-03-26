'use client';
import { motion } from 'framer-motion';

const architects = [
  { name: 'Dr. Alistair Finch', title: 'Cognitive Architect' },
  { name: 'Sofia Serrano', title: 'Behavioral Strategist' },
  { name: 'Kenji Tanaka', title: 'Systems Analyst' },
];

export default function TheArchitects() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-lg text-center">
        {architects.map((architect, i) => (
          <motion.div
            key={architect.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: i * 0.3 }}
            viewport={{ once: true, amount: 0.8 }}
          
          >
            <div className="py-8">
              <h3 className="text-2xl font-medium tracking-wider">{architect.name}</h3>
              <p className="mt-2 text-md font-light tracking-widest">{architect.title}</p>
            </div>
            {i < architects.length - 1 && (
              <div className="bg-[#111111]/20 h-px w-full" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
