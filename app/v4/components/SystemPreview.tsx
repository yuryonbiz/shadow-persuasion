'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const conversation = [
  {
    speaker: 'OPERATOR',
    text: 'My boss just rejected my raise request. How do I reframe this?',
  },
  {
    speaker: 'SYSTEM',
    text: "Deploy the Scarcity Frame. Here's your script: 'I've been approached by [competitor] about a role that better reflects my market value. I wanted to give you the chance to match it before I make a decision. I'd prefer to stay — but I need to be realistic.' Then go silent. Let the void do the work.",
  },
  {
    speaker: 'OPERATOR',
    text: 'What if they push back?',
  },
  {
    speaker: 'SYSTEM',
    text: 'Activate the Void Pull. Go silent for 72 hours...',
  },
];

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Stamp = ({ text, color, className }: { text: string; color: string; className?: string }) => (
  <div className={`absolute rotate-12 scale-100 border-2 ${color} px-2 py-1 text-sm font-bold uppercase tracking-wider ${color} opacity-90 ${className}`}>
    {text}
  </div>
);

export const SystemPreview = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="relative bg-[#EAE3D2] py-16 sm:py-24 border-b-2 border-dashed border-gray-400">
        <div className="text-left mb-8">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
            Exhibit B
          </h2>
          <p className="font-special-elite text-3xl text-black mt-2">
            Intercepted System Communication
          </p>
        </div>

        <div className="relative bg-[#F4ECD8] p-6 sm:p-8 border-2 border-gray-400 shadow-lg">
           <div className="absolute top-2 right-2 font-mono text-xs text-gray-500">HANDLING: EYES ONLY</div>
          <h3 className="font-mono text-center text-sm uppercase tracking-widest text-black mb-6 border-b border-dashed border-gray-400 pb-4">
            Transcript of AI Console Session — Intercepted ██/██/2026
          </h3>
          
          <div className="space-y-6 font-special-elite text-lg text-gray-900">
            {conversation.map((msg, index) => (
               <motion.div
                key={index}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={messageVariants}
                transition={{ duration: 0.5, delay: index * 1.5 }}
                 className="grid grid-cols-[100px_1fr] gap-4 items-start"
               >
                 <div className="font-mono text-sm pt-1">{msg.speaker}:</div>
                 <motion.p className="leading-relaxed">
                  {inView && msg.text.split("").map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.05, delay: index * 1.5 + charIndex * 0.02 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.p>
               </motion.div>
            ))}
          </div>
          <Stamp text="AUTHENTIC — VERIFIED" color="border-red-600 text-red-600" className="-bottom-5 -right-5" />
        </div>
    </section>
  );
};
