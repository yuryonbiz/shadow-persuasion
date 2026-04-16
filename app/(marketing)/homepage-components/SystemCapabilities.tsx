'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const capabilities = [
  {
    icon: '[>_]',
    title: 'AI Strategic Coach',
    description: 'Describe any situation: a salary negotiation, a difficult breakup conversation, a sales call gone sideways. Get a tactical game plan with word-for-word scripts in under 60 seconds.',
    classified: false,
  },
  {
    icon: '[◉]',
    title: 'Conversation Analysis Engine',
    description: 'Screenshot any text conversation. The AI identifies manipulation tactics, power imbalances, and hidden intentions, then gives you the exact words to shift the dynamic in your favor.',
    classified: true,
  },
  {
    icon: '[◆]',
    title: 'Influence Technique Library',
    description: '700+ proven persuasion frameworks from behavioral science. Each one comes with practice scenarios, annotated examples, and AI coaching to help you deploy them naturally.',
    classified: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Stamp = ({ text, color, className }: { text: string; color: string; className?: string }) => (
  <div className={`absolute -rotate-6 scale-110 border-2 ${color} p-1 text-xs font-bold uppercase tracking-wider ${color} opacity-80 ${className}`}>
    {text}
  </div>
);


export const SystemCapabilities = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="relative bg-[#EDE3D0] rounded-lg px-6 py-8 md:p-12">
        <div className="text-left mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            What You Get Access To
          </h2>
          <div className="w-24 h-1 bg-green-600 mt-4"></div>
          <p className="font-mono text-sm uppercase tracking-widest text-gray-600 mt-4">
            Your Complete Strategic Communication Toolkit
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col rounded-sm border border-[#999] bg-[#F4ECD8] p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black"
            >
              {capability.classified && (
                <Stamp text="ADVANCED" color="border-blue-600 text-blue-600" className="top-4 right-4" />
              )}
              <div className="font-mono text-2xl text-black mb-4">{capability.icon}</div>
              <h3 className="font-special-elite text-xl font-bold text-black">
                {capability.title}
              </h3>
              <p className="mt-2 text-base text-gray-800 leading-relaxed font-special-elite">
                {capability.description}
              </p>
              <div className="flex-grow" />
              <div className="mt-6 flex items-center gap-2 border-t border-dashed border-gray-400 pt-4">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 border border-green-700"></div>
                <span className="font-mono text-xs uppercase text-green-800 tracking-wider">
                  Status: Available
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Use Cases Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-black mb-2 text-center">PRACTICAL APPLICATIONS</h3>
          <p className="text-center text-gray-600 text-sm mb-8 font-mono uppercase tracking-wider">121 use cases across 12 categories</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { emoji: '💼', name: 'Career & Work', uses: ['Get a raise', 'Land a promotion', 'Win workplace conflict', 'Survive office politics'] },
              { emoji: '👔', name: 'Leadership', uses: ['Get team buy-in', 'Handle underperformers', 'Earn respect as new leader', 'Drive change adoption'] },
              { emoji: '💰', name: 'Business & Sales', uses: ['Close hesitant deals', 'Stop client ghosting', 'Charge higher prices', 'Win negotiations'] },
              { emoji: '💵', name: 'Personal Finance', uses: ['Negotiate big purchases', 'Get refunds when policy says no', 'Exit contracts cleanly', 'Get exceptions made'] },
              { emoji: '❤️', name: 'Dating & Attraction', uses: ['Build tension & chemistry', 'Get out of the friend zone', 'Read mixed signals', 'Make them commit'] },
              { emoji: '👥', name: 'Relationships', uses: ['Set boundaries', 'Repair trust', 'Handle toxic people', 'Defuse conflicts'] },
              { emoji: '👨‍👩‍👧', name: 'Parenting', uses: ['Get teens to listen', 'Co-parent with difficult ex', 'Enforce boundaries with respect', 'Have hard conversations'] },
              { emoji: '🧍', name: 'Personal Power', uses: ['Stop people-pleasing', 'Build unshakeable confidence', 'Command a room', 'Overcome imposter syndrome'] },
              { emoji: '🌋', name: 'High Stakes', uses: ['Win custody situations', 'Get second chances', 'Convince someone to get help', 'Handle public failure'] },
              { emoji: '💬', name: 'Texting & Online', uses: ['Get more DM replies', 'Recover dead conversations', 'Close over text', 'Improve dating app results'] },
              { emoji: '📣', name: 'Influence & Audience', uses: ['Build a trusted audience', 'Write content that converts', 'Make your brand stand out', 'Grow social following'] },
              { emoji: '🛡️', name: 'Defend & Protect', uses: ['Spot manipulation', 'Detect liars', 'Shut down gaslighting', 'Recognize toxic people early'] },
            ].map((cat) => (
              <div key={cat.name} className="bg-[#F4ECD8] border border-[#999] p-4 hover:border-black hover:shadow-md transition-all duration-200">
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <h4 className="font-bold text-black text-sm mb-2">{cat.name}</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {cat.uses.map((u) => (
                    <li key={u} className="flex items-start gap-1">
                      <span className="text-green-700 mt-0.5 shrink-0">&#x2713;</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};