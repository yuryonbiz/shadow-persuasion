'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    query: 'Is this ethical manipulation?',
    answer:
      'This system is for operators who understand that influence is a neutral tool. The ethics are determined by the user, not the framework. We provide the weapon; you choose the target.',
  },
  {
    query: 'Will this work on experienced people?',
    answer:
      'The frameworks operate on the base code of human psychology, which exists in everyone, regardless of experience. In fact, seasoned professionals often have more predictable patterns to leverage.',
  },
  {
    query: 'What\'s the difference between persuasion and coercion?',
    answer:
      'Persuasion makes them believe the idea was theirs. Coercion is a blunt instrument. We teach you to be a scalpel, not a hammer. The target willingly adopts your frame, making the change permanent.',
  },
  {
    query: 'How quickly can I see results?',
    answer:
      'Operators report noticeable shifts in their interactional dynamics within the first 72 hours. Mastery is a continuous process, but initial leverage is almost immediate.',
  },
];

const AccordionItem = ({ item }: { item: typeof faqItems[0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#333]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-mono uppercase text-white">
          QUERY: {item.query}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              <p className="font-mono text-gray-400">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function IntelFAQ() {
  return (
    <section className="my-12">
      <h2 className="mb-8 font-mono text-3xl uppercase tracking-widest text-white">
        Intel FAQ
      </h2>
      <div className="border border-[#333]">
        {faqItems.map((item, i) => (
          <AccordionItem key={i} item={item} />
        ))}
      </div>
    </section>
  );
}
