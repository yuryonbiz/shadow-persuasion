'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Redacted = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-[#0D0D0D] text-[#0D0D0D] inline-block px-1 rounded hover:text-[#D4A017] transition-colors duration-300 cursor-default">{children}</span>
);

const AccordionItem = ({ question, children }: { question: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#D4A017]/20">
      <button
        className="w-full flex justify-between items-center text-left py-5 px-4 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg md:text-xl font-bold text-[#1a1207] group-hover:text-[#D4A017] transition-colors duration-200">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#D4A017] flex-shrink-0 ml-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 text-base md:text-lg leading-relaxed text-[#3a3024]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  return (
    <section className="bg-[#F4ECD8] py-20 px-6 md:px-12 w-full">
      <div className="max-w-3xl mx-auto">
        {/* Dossier header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[#D4A017] mb-2">
            APPENDIX C // DECLASSIFIED
          </p>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#0D0D0D]">
            Frequently Asked Questions
          </h2>
          <div className="w-16 h-0.5 bg-[#D4A017] mt-4 mx-auto" />
        </div>

        {/* Accordion container styled as dossier */}
        <div className="bg-[#efe5cc] border border-[#D4A017]/30 rounded-lg shadow-sm overflow-hidden">
          <AccordionItem question="Is this just manipulation?">
            <p>This is a tool for influence. Like any tool, its morality is determined by the operator. We provide the means to achieve desired outcomes; your objectives determine the label. The principles are derived from <Redacted>advanced neuro-linguistic programming</Redacted> and behavioral psychology, focusing on alignment rather than deception.</p>
          </AccordionItem>
          <AccordionItem question="Will this work on experienced negotiators?">
            <p>Yes. The system is designed to bypass conscious resistance and target subconscious triggers. Experienced negotiators rely on established patterns and tactics, all of which are cataloged in our Dark Psychology Engine. The AI provides counter-maneuvers that are often <Redacted>outside the standard playbook</Redacted>, giving you an asymmetric advantage.</p>
          </AccordionItem>
          <AccordionItem question="What separates persuasion from coercion?">
            <p>Coercion involves threats and the removal of choice. Effective persuasion, as taught by this system, is the art of making your desired outcome feel like the other party&apos;s best option — an idea they arrived at themselves. We focus on <Redacted>frame control and value alignment</Redacted>, not force.</p>
          </AccordionItem>
          <AccordionItem question="How quickly will I see results?">
            <p>Operators typically report a noticeable shift in their interactional success within the first 72 hours. The system is designed for immediate application. Mastery, however, is an ongoing process of refinement, supported by the AI&apos;s continuous feedback loop.</p>
          </AccordionItem>
          <AccordionItem question="Is this legal?">
            <p>The tools and principles themselves are legal. Their application depends on the laws and regulations of your operational jurisdiction. It is the operator&apos;s responsibility to ensure their actions are compliant with all applicable laws. Shadow Persuasion is a tool for influence, not a license for <Redacted>unlawful activity</Redacted>.</p>
          </AccordionItem>
          <AccordionItem question="What's included in the $99/month?">
            <p>Your monthly access fee grants you a license for the full suite: the AI Operator Console, Visual Intelligence Module, Dark Psychology Engine, Negotiation Warfare System, Persuasion Script Library, and Psychological Profiling Unit. You also receive continuous updates to the core AI models and access to a restricted operator community for <Redacted>field report sharing</Redacted>.</p>
          </AccordionItem>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
