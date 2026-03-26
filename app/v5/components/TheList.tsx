
'use client';
import { motion } from 'framer-motion';

const disciplines = [
  'Frame Control',
  'Psychological Leverage',
  'Covert Influence',
  'Negotiation Architecture',
  'Emotional Calibration',
  'The Void Pull',
];

const listVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.5,
      duration: 1.5,
    },
  }),
};

export default function TheList() {
  return (
    <section className="flex flex-col items-center justify-center py-32 text-center">
      <ul className="space-y-12">
        {disciplines.map((item, i) => (
          <motion.li
            key={item}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 'all' }}
            variants={listVariants}
            className="text-3xl font-light tracking-wider"
          >
            <span className="mr-6 font-thin">{`0${i + 1}`}</span>
            {item}
          </motion.li>
        ))}
      </ul>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: disciplines.length * 0.5 }}
        viewport={{ once: true, amount: 'all' }}
        className="mt-20 text-lg font-light tracking-widest"
      >
        Six disciplines. One system.
      </motion.p>
    </section>
  );
}
