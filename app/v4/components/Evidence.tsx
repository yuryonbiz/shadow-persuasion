'use client';
import { motion } from 'framer-motion';

const StatItem = ({ label, value, annotation }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-dotted border-gray-400">
    <span>{label}</span>
    <div className="flex items-baseline">
      <span className="font-bold text-lg">{value}</span>
      {annotation && (
        <span className="ml-4 text-sm text-[#2C5F8A] italic transform -rotate-2">
          {annotation.text} 
          {annotation.circled && <span className="inline-block p-1 border-2 border-red-600 rounded-full ml-1 leading-none">circled</span>}
        </span>
      )}
    </div>
  </div>
);

const CoffeeStain = () => (
    <div className="absolute -top-8 -left-8 w-40 h-40">
      <div className="absolute inset-0 border-2 border-[#a58d6f] rounded-full opacity-25" />
      <div className="absolute inset-2 border border-[#a58d6f] rounded-full opacity-20" />
    </div>
);

export default function Evidence() {
  return (
    <section className="py-12">
      <motion.div 
        className="relative max-w-2xl mx-auto p-8 bg-[#E8DCC8] border-2 border-black overflow-hidden"
        initial={{ rotate: 0 }}
        whileInView={{ rotate: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <CoffeeStain />
        <div className="z-10 relative">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-2">
              EXHIBIT A: OPERATIONAL EFFECTIVENESS DATA
            </h2>
            <p className='text-xs mb-6 text-gray-600'>CONFIDENTIAL - DO NOT DISTRIBUTE</p>
            
            <div className="space-y-4">
              <StatItem 
                label="Target Compliance Rate:" 
                value="92.7%" 
                annotation={{ text: '↑ 47% from Q2', circled: true }} 
              />
              <StatItem 
                label="Mean Time to Influence:" 
                value="14.3 Days" 
                annotation={{ text: 'Significant reduction' }}
              />
              <StatItem 
                label="Psychological Footprint:" 
                value="< 0.8%" 
                annotation={{ text: 'Undetectable' }}
              />
              <StatItem 
                label="Message Resonance Score:" 
                value="8.9/10" 
              />
              <StatItem 
                label="Operator Burnout Rate:" 
                value="4.2%" 
                annotation={{ text: 'Monitor closely', circled: false }}
              />
            </div>
        </div>
      </motion.div>
    </section>
  );
}
