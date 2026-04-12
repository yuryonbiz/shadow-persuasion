'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Upload, Zap, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { icon: Upload, number: '01', title: 'UPLOAD OR DESCRIBE', description: 'Screenshot a conversation or describe your situation to the AI coach.' },
    { icon: Zap, number: '02', title: 'GET YOUR STRATEGY', description: 'Receive instant analysis, technique recommendations, and word-for-word scripts.' },
    { icon: TrendingUp, number: '03', title: 'DEPLOY & IMPROVE', description: 'Use the scripts in real life. Track your progress. Get better with every interaction.' },
  ];

  return (
    <section ref={ref} className="py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl lg:text-4xl font-bold text-center mb-4 text-[#1A1A1A]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="text-center text-[#5C4B32] mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Three steps to becoming the most strategic communicator in any room
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4A017]/10 border-2 border-[#D4A017]/30 flex items-center justify-center">
                <step.icon className="h-7 w-7 text-[#D4A017]" />
              </div>
              <p className="text-xs font-mono text-[#D4A017] tracking-widest mb-2">{step.number}</p>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
              <p className="text-[#5C4B32] text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
