"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqItems = [
  {
    objection: "Is this ethical?",
    response: "The framework is ethically neutral, analogous to a surgical instrument. Its application determines its moral valence. We provide extensive ethical guardrails and a mandatory module on responsible deployment. The core principle is that understanding these mechanisms is the best defense against their misuse by others."
  },
  {
    objection: "Is this a form of manipulation?",
    response: "The term 'manipulation' carries a pejorative connotation that is imprecise. This framework is concerned with influence, which is a fundamental component of all human interaction. Our methodology prioritizes transparent, empathetic, and outcome-oriented communication over coercive tactics."
  },
  {
    objection: "How is this different from standard negotiation or sales training?",
    response: "Standard training focuses on tactical scripts and countermeasures. Our approach is strategic, focusing on the underlying psychological architecture of the interaction. We teach you how to design the game, not just play it better. It's the difference between being a chess piece and being the chess master."
  },
  {
    objection: "What is the evidence for the efficacy of these methods?",
    response: "The protocols are synthesized from decades of peer-reviewed research in behavioral psychology, cognitive neuroscience, and social dynamics. Each technique is cross-referenced with empirical studies. The 'Findings' section of this document provides a top-line summary of our own internal validation studies."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-24 border-b border-steel-gray bg-bone-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-libre-baskerville text-3xl font-bold text-navy-deep">
            Responses to Common Objections
          </h2>
        </div>
        <div className="divide-y divide-steel-gray border-t border-b border-steel-gray">
          {faqItems.map((item, index) => (
            <div key={index} className="py-6">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="text-lg font-libre-baskerville text-navy-deep">
                  <span className="font-bold">Objection:</span> {item.objection}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-clinical-red text-2xl"
                >
                  &#9660;
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="text-navy leading-relaxed">
                      <span className="font-bold">Response:</span> {item.response}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
