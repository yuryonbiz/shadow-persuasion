'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const conversation = [
  {
    speaker: 'user',
    text: 'My boss just rejected my raise request. How do I reframe this?',
  },
  {
    speaker: 'ai',
    text: "Deploy the Scarcity Frame. Here's your script: 'I've been approached by [competitor] about a role that better reflects my market value. I wanted to give you the chance to match it before I make a decision. I'd prefer to stay — but I need to be realistic.' Then go silent. Let the void do the work.",
  },
  {
    speaker: 'user',
    text: 'What if they push back?',
  },
  {
    speaker: 'ai',
    text: 'Activate the Void Pull. Go silent for 72 hours...',
  },
];

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const ConsolePreview = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.3,
      });

  return (
    <section ref={ref} className="bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-[#FF8C00]">
            Live System Preview
          </h2>
        </div>
        <div className="mt-16 rounded-lg border border-[#333] bg-[#111] p-6 font-mono text-sm">
          <div className="flex items-center gap-2 border-b border-b-[#333] pb-4 mb-4">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <p className="ml-auto text-xs text-gray-500">SESSION: 8A4B9X-ACTIVE</p>
          </div>
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <motion.div
                key={index}
                variants={messageVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                transition={{ duration: 0.5, delay: index * 0.8 }}
              >
                {msg.speaker === 'user' ? (
                  <div className="flex gap-2">
                    <span className="text-gray-500">{'>'}</span>
                    <p className="text-gray-300">{msg.text}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span className="text-[#FF8C00]">AI:</span>
                    <p className="text-white">{msg.text}</p>
                  </div>
                )}
              </motion.div>
            ))}
             <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity : 0}}
                transition={{ delay: conversation.length * 0.8 + 0.5, repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                className="flex gap-2"
              >
                  <span className="text-gray-500">{'>'}</span>
                  <div className="h-5 w-2 bg-green-500"></div>
              </motion.div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">
            This is a real interaction from the Shadow Persuasion AI Console
        </p>
      </div>
    </section>
  );
};
