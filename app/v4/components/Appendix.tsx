'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Redacted = () => <span className="bg-black text-black select-none">██████████████████</span>;

const FAQItem = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-400">
      <button 
        className="w-full flex justify-between items-center text-left py-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold">{question}</span>
        <motion.span 
            animate={{ rotate: isOpen ? 90 : 0 }}
            className="text-lg"
        >
            →
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-4 text-sm leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Appendix() {
  return (
    <section className="py-12">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-2">
        APPENDIX C: FREQUENTLY ASKED QUESTIONS
      </h2>
      <p className="text-xs mb-6 text-gray-600">(SANITIZED FOR RELEASE)</p>
      
      <div className="max-w-3xl mx-auto">
        <FAQItem question="Is this legal?">
          <p>All operations are conducted within a legal framework approved by our internal ethics committee and are compliant with <Redacted />. The legality of influence is often a matter of jurisdiction and interpretation.</p>
        </FAQItem>
        <FAQItem question="What kind of results can I expect?">
          <p>Results vary based on the operator's skill and the complexity of the target. However, our internal data shows a success rate of over 90% in achieving primary objectives within the projected timeframe. Specific metrics are detailed in Exhibit A.</p>
        </FAQItem>
        <FAQItem question="Who is this for?">
          <p>This program is designed for individuals in high-stakes professions where influence is a critical component of success: founders, negotiators, sales leaders, and political operators. Access is subject to a rigorous screening process.</p>
        </FAQItem>
        <FAQItem question="What happens if an operation is compromised?">
          <p>We have extensive protocols for plausible deniability and operator extraction. In the event of a compromise, the primary objective is to sanitize the environment and <Redacted />. To date, we have a 100% clean extraction record.</p>
        </FAQItem>
      </div>
    </section>
  );
}
