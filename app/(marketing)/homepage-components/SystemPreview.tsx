'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const conversation = [
  {
    speaker: 'MEMBER',
    text: 'My boss just rejected my raise request. How do I reframe this?',
  },
  {
    speaker: 'COACH',
    text: "Here's your strategy. First, don't react emotionally. That's what they expect. Use Frame Control: reposition the conversation from \"asking for a raise\" to \"discussing your market value.\" Try this: \"I've been looking at what my role pays elsewhere, and I want to make sure we're aligned. Can we talk about how my compensation reflects the value I'm delivering?\" Then pause. Let them respond first.",
  },
  {
    speaker: 'MEMBER',
    text: 'What if they push back?',
  },
  {
    speaker: 'COACH',
    text: 'Use Strategic Silence. After making your case, don\'t fill the silence. Let them sit with it. If they bring up budget constraints, respond with: "I understand. What would need to happen for us to revisit this in 90 days?" This keeps the door open and puts the ball in their court.',
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
    <section ref={ref} className="relative bg-[#EAE3D2] py-16 sm:py-24 px-6 sm:px-8 border-b-2 border-dashed border-gray-400">
      <div className="max-w-5xl mx-auto">
        <div className="text-left mb-8">
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
            Sample Session
          </h2>
          <p className="font-special-elite text-3xl text-black mt-2">
            Sample Coaching Session
          </p>
        </div>

        <div className="relative bg-[#F4ECD8] p-6 sm:p-8 border-2 border-gray-400 shadow-lg">
           <div className="absolute top-2 right-2 font-mono text-xs text-gray-500"></div>
          <h3 className="font-mono text-center text-sm uppercase tracking-widest text-black mb-6 border-b border-dashed border-gray-400 pb-4">
            Transcript of AI Console Session: Intercepted ██/██/2026
          </h3>
          
          <div className="space-y-6 font-special-elite text-lg text-gray-900">
            {conversation.map((msg, index) => (
               <motion.div
                key={index}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={messageVariants}
                transition={{ duration: 0.5, delay: index * 1.5 }}
                 className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-1 md:gap-4 items-start"
               >
                 <div className="font-mono text-sm font-bold md:font-normal pt-1">{msg.speaker}:</div>
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
          {/* stamp removed */}
        </div>
      </div>
    </section>
  );
};
