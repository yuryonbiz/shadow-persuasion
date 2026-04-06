'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

const LiveAnalysisDemo = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [inputText, setInputText] = useState("She said she's 'not ready for anything serious right now'");

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate analysis completion
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const analysisCards = [
    {
      title: "INTERPRETATION",
      content: 'The "Shield" Response. Not a rejection of you, but a rejection of the current pace or perceived pressure.',
      delay: 0.5
    },
    {
      title: "EMOTIONAL TONE",
      content: (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Hesitation</span>
            <span className="text-green-400">74%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <motion.div 
              className="bg-green-500 h-2 rounded"
              initial={{ width: 0 }}
              animate={{ width: "74%" }}
              transition={{ duration: 1, delay: 1 }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span>Defensiveness</span>
            <span className="text-red-400">22%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <motion.div 
              className="bg-red-500 h-2 rounded"
              initial={{ width: 0 }}
              animate={{ width: "22%" }}
              transition={{ duration: 1, delay: 1.2 }}
            />
          </div>
        </div>
      ),
      delay: 1
    },
    {
      title: "SUGGESTED STRATEGY",
      content: "Non-Reactive Reframe: Mirror their pace while maintaining your own frame...",
      delay: 1.5
    },
    {
      title: "RECOMMENDED RESPONSE",
      content: (
        <div className="space-y-2">
          <p className="text-red-300 italic">"I respect that. I'm just enjoying where things are at right now anyway. Let's keep it casual."</p>
          <button 
            onClick={() => copyToClipboard("I respect that. I'm just enjoying where things are at right now anyway. Let's keep it casual.")}
            className="bg-gray-600 hover:bg-gray-500 px-2 py-1 text-xs rounded transition-colors"
          >
            COPY
          </button>
        </div>
      ),
      delay: 2
    }
  ];

  return (
    <section className="bg-[#0D0D0D] w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div 
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-400 mb-2">
            LIVE DEMONSTRATION
          </h2>
          <p className="text-3xl text-white font-special-elite">See It In Action</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Input and controls */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <label className="block font-mono text-sm text-gray-400 mb-2 uppercase tracking-wider">
                INTERCEPTED COMMUNICATION
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-gray-800 border-2 border-gray-600 text-white p-4 font-mono text-sm h-32 resize-none focus:border-green-500 focus:outline-none"
                placeholder="Enter message for analysis..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-mono text-sm text-green-400 uppercase tracking-wider">
                  READY_FOR_DECRYPTION
                </span>
              </div>

              <div className="font-mono text-xs text-gray-500">
                INBOUND: ACTIVE | PARSING: 1.2MS | ENGINE: V.4.0
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase px-6 py-4 text-lg tracking-wider border-2 border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                  <span className="ml-2">ANALYZING...</span>
                </div>
              ) : (
                "START INTELLIGENCE SWEEP"
              )}
            </button>
          </motion.div>

          {/* Right side - Analysis results */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {analysisCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="bg-gray-800 border-2 border-gray-600 p-4 h-40 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={analysisComplete ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.9 }}
                transition={{ duration: 0.5, delay: analysisComplete ? card.delay : 0 }}
              >
                <h3 className="font-mono text-xs uppercase tracking-wider text-green-400 mb-3 border-b border-gray-600 pb-1">
                  {card.title}
                </h3>
                <div className="text-gray-300 text-sm">
                  {analysisComplete && typeof card.content === 'string' ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.05 }}
                    >
                      {card.content.split('').map((char, charIndex) => (
                        <motion.span
                          key={charIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.05, delay: card.delay + charIndex * 0.02 }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={analysisComplete ? { opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: card.delay }}
                    >
                      {card.content}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveAnalysisDemo;