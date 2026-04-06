'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

const DossierAnalysis = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [selectedOption, setSelectedOption] = useState<string>('');

  const counterMoves = [
    {
      id: 'A',
      title: 'Confident Detachment',
      description: 'Acknowledge and mirror their energy while demonstrating your own security.',
      script: '"I get it. Take all the time you need. I\'m good either way."'
    },
    {
      id: 'B',
      title: 'Neutral Acknowledgment',
      description: 'Simple validation without emotional investment or counter-pressure.',
      script: '"Understood. Let me know when you\'re ready to reconnect."'
    },
    {
      id: 'C',
      title: 'Re-Engagement Later',
      description: 'Strategic withdrawal with implicit timeline for re-connection.',
      script: '"No problem. I\'ll check in with you in a couple weeks."'
    }
  ];

  return (
    <section className="bg-[#0D0D0D] w-full relative overflow-hidden">
      {/* Subtle red vignette glow */}
      <div className="absolute inset-0 bg-gradient-radial from-red-900/20 via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 relative">
        <motion.div 
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-400 mb-2">
            PSYCHOLOGICAL WARFARE DIVISION
          </h2>
          <p className="text-3xl text-white font-special-elite">Full Message Breakdown</p>
        </motion.div>

        {/* Status Bar */}
        <motion.div 
          className="flex items-center justify-between bg-gray-800 border-2 border-gray-600 p-4 mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-3 h-3 rounded-full bg-red-500"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono text-sm text-red-400 uppercase tracking-wider">
              DOSSIER: EMOTIONAL_WITHDRAWAL_V1
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500">
            {new Date().toLocaleString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            })} UTC
          </div>
        </motion.div>

        {/* Intercepted Quote */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="bg-gray-800 border-2 border-gray-600 p-8 max-w-4xl mx-auto relative">
            <div className="absolute top-2 right-2 font-mono text-xs text-gray-500">
              CLASSIFICATION: EYES ONLY
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
              INTERCEPTED COMMUNICATION
            </h3>
            <p className="text-2xl md:text-3xl text-gray-200 font-special-elite leading-relaxed">
              "I just need some{' '}
              <span className="bg-red-600 text-white px-2 py-1 relative">
                space
                <motion.div
                  className="absolute inset-0 bg-red-500"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
              {' '}right now"
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Analysis */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Intent Analysis */}
            <div className="bg-gray-800 border-2 border-gray-600 p-6">
              <h4 className="font-mono text-sm uppercase tracking-wider text-amber-400 mb-4 border-b border-gray-600 pb-2">
                INTENT ANALYSIS
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Confidence Level:</span>
                  <span className="text-amber-400 font-bold">82%</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded">
                  <motion.div 
                    className="bg-amber-500 h-2 rounded"
                    initial={{ width: 0 }}
                    animate={inView ? { width: "82%" } : {}}
                    transition={{ duration: 1.5, delay: 1 }}
                  />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mt-4">
                  Primary driver: Overwhelming emotional state requiring external regulation. 
                  Secondary factor: Testing your reaction to boundary assertion.
                </p>
              </div>
            </div>

            {/* Hidden Meaning */}
            <div className="bg-gray-800 border-2 border-gray-600 p-6">
              <h4 className="font-mono text-sm uppercase tracking-wider text-blue-400 mb-4 border-b border-gray-600 pb-2">
                HIDDEN MEANING
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Translation: "I'm feeling suffocated by the intensity and need to regain control of my emotional state. 
                This isn't necessarily about you—it's about my capacity to handle connection right now."
              </p>
            </div>

            {/* Critical Risk Alert */}
            <div className="bg-red-900/20 border-2 border-red-600 p-6">
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-2xl">⚠</div>
                <div>
                  <h4 className="font-mono text-sm uppercase tracking-wider text-red-400 mb-2">
                    CRITICAL RISK
                  </h4>
                  <p className="text-red-200 text-sm leading-relaxed">
                    High probability of emotional spiral if pressure is applied. 
                    Recommend immediate de-escalation protocols.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Counter Moves */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-gray-800 border-2 border-gray-600 p-6">
              <h4 className="font-mono text-sm uppercase tracking-wider text-green-400 mb-6 border-b border-gray-600 pb-2">
                ENGINEERED COUNTER-MOVES
              </h4>
              
              <div className="space-y-4">
                {counterMoves.map((option) => (
                  <motion.button
                    key={option.id}
                    className={`w-full text-left p-4 border-2 transition-all ${
                      selectedOption === option.id 
                        ? 'border-green-500 bg-green-900/20' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedOption(selectedOption === option.id ? '' : option.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-lg text-green-400 font-bold">
                        {option.id}:
                      </span>
                      <div className="flex-1">
                        <h5 className="text-white font-bold mb-1">
                          {option.title}
                        </h5>
                        <p className="text-gray-300 text-sm mb-2">
                          {option.description}
                        </p>
                        {selectedOption === option.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-gray-900 p-3 rounded border-l-4 border-green-500"
                          >
                            <p className="text-green-300 italic text-sm font-mono">
                              {option.script}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <button className="bg-red-600 hover:bg-red-700 text-white font-mono uppercase px-8 py-4 text-lg tracking-wider border-2 border-red-500 transition-colors">
            ACCESS FULL PSYCHOLOGICAL WARFARE MODULE
          </button>
        </motion.div>
      </div>
      
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default DossierAnalysis;