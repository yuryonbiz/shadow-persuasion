'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const Stamp = ({ text, color, rotation }) => {
  return (
    <div
      className="border-2 px-2 py-1 font-black text-lg uppercase inline-block"
      style={{
        borderColor: color,
        color: color,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {text}
    </div>
  );
};

const CoffeeStain = () => (
  <div className="absolute -bottom-4 -right-4 w-32 h-32">
    <div className="absolute inset-0 border-2 border-[#a58d6f] rounded-full opacity-20" />
    <div className="absolute inset-2 border-2 border-[#a58d6f] rounded-full opacity-15" />
    <div className="absolute inset-4 border border-[#a58d6f] rounded-full opacity-10" />
  </div>
);

export default function Hero() {
  const [accepted, setAccepted] = useState(false);

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center p-6 pt-4 border-4 border-[#1A1A1A] bg-[#E8DCC8] overflow-hidden">
      <CoffeeStain />
      <div className="absolute top-4 right-6 z-20 opacity-60">
        <Stamp text="CLASSIFIED" color="#C0392B" rotation={-12} />
      </div>
      <div className="absolute top-8 right-10 z-30">
        <Stamp text="DECLASSIFIED" color="#2C5F8A" rotation={18} />
      </div>

      <div className="z-10">
        <p className="text-sm tracking-widest text-[#2C5F8A]">
          DOC-SP-2026-001 // EYES ONLY
        </p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-black my-4 tracking-wider"
        >
          PROJECT: SHADOW PERSUASION
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-xl mx-auto text-lg"
        >
          A Comprehensive Field Manual for Psychological Influence Operations
        </motion.p>
        
        <div className="mt-12 space-y-2 text-xs text-[#2C5F8A] uppercase tracking-wider">
          <p>Distribution: Limited</p>
          <p>Handling: Need-to-know basis</p>
        </div>

        <div className="mt-8">
          <label className="flex items-center justify-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
              className="appearance-none w-5 h-5 border-2 border-[#1A1A1A] bg-transparent checked:bg-[#1A1A1A] checked:relative checked:after:content-['✓'] checked:after:text-[#F4ECD8] checked:after:absolute checked:after:text-sm checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
            />
            <span>I accept responsibility for the contents of this document</span>
          </label>
            
          <motion.button
            disabled={!accepted}
            className="mt-6 px-8 py-3 border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F4ECD8] uppercase tracking-widest transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-transparent enabled:hover:text-[#1A1A1A]"
            whileTap={{ scale: 0.95 }}
          >
            Proceed to Document →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
