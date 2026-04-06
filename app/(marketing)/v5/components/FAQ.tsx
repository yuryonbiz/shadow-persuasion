'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Redacted = ({ children }) => <span className="bg-black text-black inline-block px-1">{children}</span>;

const AccordionItem = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b-2 border-gray-300 py-4">
      <button className="w-full flex justify-between items-center text-left text-xl font-bold" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-lg leading-relaxed"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-8 text-center">Appendix C: Frequently Asked Questions (Sanitized for Release)</h2>
      <div>
        <AccordionItem question="Is this just manipulation?">
          <p>This is a tool for influence. Like any tool, its morality is determined by the operator. We provide the means to achieve desired outcomes; your objectives determine the label. The principles are derived from <Redacted>advanced neuro-linguistic programming</Redacted> and behavioral psychology, focusing on alignment rather than deception.</p>
        </AccordionItem>
        <AccordionItem question="Will this work on experienced negotiators?">
          <p>Yes. The system is designed to bypass conscious resistance and target subconscious triggers. Experienced negotiators rely on established patterns and tactics, all of which are cataloged in our Dark Psychology Engine. The AI provides counter-maneuvers that are often <Redacted>outside the standard playbook</Redacted>, giving you an asymmetric advantage.</p>
        </AccordionItem>
        <AccordionItem question="What separates persuasion from coercion?">
         <p>Coercion involves threats and the removal of choice. Effective persuasion, as taught by this system, is the art of making your desired outcome feel like the other party's best option—an idea they arrived at themselves. We focus on <Redacted>frame control and value alignment</Redacted>, not force.</p>
        </AccordionItem>
        <AccordionItem question="How quickly will I see results?">
          <p>Operators typically report a noticeable shift in their interactional success within the first 72 hours. The system is designed for immediate application. Mastery, however, is an ongoing process of refinement, supported by the AI's continuous feedback loop.</p>
        </AccordionItem>
        <AccordionItem question="Is this legal?">
          <p>The tools and principles themselves are legal. Their application depends on the laws and regulations of your operational jurisdiction. It is the operator's responsibility to ensure their actions are compliant with all applicable laws. Shadow Persuasion is a tool for influence, not a license for <Redacted>unlawful activity</Redacted>.</p>
        </AccordionItem>
        <AccordionItem question="What's included in the $47/month?">
          <p>Your monthly access fee grants you a license for the full suite: the AI Operator Console, Visual Intelligence Module, Dark Psychology Engine, Negotiation Warfare System, Persuasion Script Library, and Psychological Profiling Unit. You also receive continuous updates to the core AI models and access to a restricted operator community for <Redacted>field report sharing</Redacted>.</p>
        </AccordionItem>
      </div>
    </section>
  );
};

export default FAQ;
