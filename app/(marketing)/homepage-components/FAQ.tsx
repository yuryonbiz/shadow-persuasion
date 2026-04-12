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
          <AccordionItem question="Is this manipulation?">
            <p>Strategic communication isn&apos;t manipulation — it&apos;s understanding how people actually make decisions and communicating more effectively. Every negotiation course, sales training, and leadership program teaches these same principles. The difference is that Shadow Persuasion gives you an AI coach that applies them to YOUR specific situations in real time. We focus on creating outcomes where both parties benefit.</p>
          </AccordionItem>
          <AccordionItem question="Will this work against experienced negotiators?">
            <p>Yes. Experienced negotiators rely on established patterns — and those patterns are cataloged in our technique library. The AI identifies which tactics are being used against you and provides counter-strategies. Members consistently report outperforming people with decades more experience.</p>
          </AccordionItem>
          <AccordionItem question="How quickly will I see results?">
            <p>Most members report a noticeable shift within the first week. The Conversation Analyzer gives you immediate insight into conversations you&apos;re already having. The Strategic Coach gives you scripts you can use today. Full mastery of the technique library typically takes 60-90 days of consistent practice.</p>
          </AccordionItem>
          <AccordionItem question="What if I'm a complete beginner?">
            <p>The system meets you where you are. Beginners start with foundational techniques and guided practice scenarios. The AI adapts its coaching to your current skill level and progressively introduces more advanced frameworks as you improve.</p>
          </AccordionItem>
          <AccordionItem question="Is $99/month worth it?">
            <p>One successful salary negotiation typically yields $5,000-$50,000+ in additional income. One better business deal can be worth multiples of that. Members consistently report that a single win in their first month more than pays for a full year of membership. And unlike a one-time course, the AI coach is available 24/7 for every new situation you face.</p>
          </AccordionItem>
          <AccordionItem question="Can I cancel anytime?">
            <p>Yes. No contracts, no cancellation fees, no questions asked. We keep members because the system delivers results, not because of fine print.</p>
          </AccordionItem>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
