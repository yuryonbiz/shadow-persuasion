'use client';
import { Upload, Zap, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { icon: Upload, number: '01', title: 'UPLOAD OR DESCRIBE', description: 'Screenshot a conversation or describe your situation to the AI coach.' },
    { icon: Zap, number: '02', title: 'GET YOUR STRATEGY', description: 'Receive instant analysis, technique recommendations, and word-for-word scripts.' },
    { icon: TrendingUp, number: '03', title: 'DEPLOY & IMPROVE', description: 'Use the scripts in real life. Track your progress. Get better with every interaction.' },
  ];

  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 text-[#1A1A1A]">
          How It Works
        </h2>
        <p className="text-center text-[#5C4B32] mb-12 text-lg">
          Three steps to becoming the most strategic communicator in any room
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4A017]/10 border-2 border-[#D4A017]/30 flex items-center justify-center">
                <step.icon className="h-7 w-7 text-[#D4A017]" />
              </div>
              <p className="text-xs font-mono text-[#D4A017] tracking-widest mb-2">{step.number}</p>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
              <p className="text-[#5C4B32] text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
