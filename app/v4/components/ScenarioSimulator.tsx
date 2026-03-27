'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const scenario = {
  without: {
    title: 'Standard Response',
    response: "I understand the budget is tight. Can we revisit this in six months? I'm committed to proving my value and hopefully we can make it work then. I appreciate you considering it.",
  },
  with: {
    title: 'Protocol-Enhanced Response',
    response: "I've been approached by a competitor with an offer that reflects my current market value. I value my role here and wanted to give you the opportunity to match that before I proceed. I'd much prefer to continue driving results with our team.",
  },
};

const Stamp = ({ text, className }: { text: string; className?: string }) => (
  <div className={`absolute border-2 border-red-600 p-1 text-xs font-bold uppercase tracking-wider text-red-600 opacity-80 ${className}`}>
    {text}
  </div>
);

const ScenarioSimulator = () => {
  const [activeTab, setActiveTab] = useState('with');

  return (
    <section className="relative py-16">
      <div className="text-left mb-12">
        <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
          EXHIBIT C: SCENARIO SIMULATOR
        </h2>
        <p className="text-3xl mt-2">
          Tactical Response Comparison
        </p>
      </div>

      <div className="relative border-2 border-gray-400 bg-[#F4ECD8] p-6 sm:p-8 shadow-lg">
        <Stamp text="COMPARATIVE ANALYSIS — VERIFIED" className="-top-4 left-4 -rotate-6" />
        
        <div className="mb-6 flex justify-center border-b-2 border-dashed border-gray-400 pb-4">
          <div className="flex space-x-4 rounded-md bg-gray-200 p-1">
            <button 
                onClick={() => setActiveTab('without')} 
                className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors ${activeTab === 'without' ? 'bg-black text-white' : 'text-black'}`}>
                Without Protocol
            </button>
            <button 
                onClick={() => setActiveTab('with')} 
                className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors ${activeTab === 'with' ? 'bg-black text-white' : 'text-black'}`}>
                With Protocol
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-lg leading-relaxed text-gray-800"
            >
                <h3 className="font-bold text-black mb-4 text-center">{activeTab === 'with' ? scenario.with.title : scenario.without.title}</h3>
                <p className='whitespace-pre-wrap'>
                    {activeTab === 'with' ? scenario.with.response : scenario.without.response}
                 </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ScenarioSimulator;
