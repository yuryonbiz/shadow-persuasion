
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

const ScenarioSimulator = () => {
  const [activeTab, setActiveTab] = useState('with');

  return (
    <section className="relative -mx-6 md:-mx-12 px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest text-amber-500/70">
            EXHIBIT C: SCENARIO SIMULATOR
          </h2>
          <p className="text-3xl md:text-4xl mt-2 text-white">
            Tactical Response Comparison
          </p>
        </div>

        <div className="relative border-2 border-amber-900/50 bg-[#222] p-6 sm:p-8 shadow-2xl rounded-lg">
          <div className="mb-6 flex justify-center border-b-2 border-dashed border-amber-900/30 pb-4">
            <div className="flex space-x-1 rounded-md bg-black/20 p-1">
              <button
                  onClick={() => setActiveTab('without')}
                  className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-300 ${activeTab === 'without' ? 'bg-[#D4A017] text-black shadow-lg' : 'text-amber-300/70 hover:bg-white/5'}`}>
                  Without Protocol
              </button>
              <button
                  onClick={() => setActiveTab('with')}
                  className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-300 ${activeTab === 'with' ? 'bg-[#D4A017] text-black shadow-lg' : 'text-amber-300/70 hover:bg-white/5'}`}>
                  With Protocol
              </button>
            </div>
          </div>

          <div className="overflow-hidden min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-lg leading-relaxed text-gray-300"
              >
                  <h3 className="font-bold text-[#D4A017] mb-4 text-center tracking-wider">{activeTab === 'with' ? scenario.with.title : scenario.without.title}</h3>
                  <p className='whitespace-pre-wrap text-center max-w-2xl mx-auto'>
                      {activeTab === 'with' ? scenario.with.response : scenario.without.response}
                   </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScenarioSimulator;
