'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useCallback } from 'react';

const DEFAULT_INPUT = "She said she's 'not ready for anything serious right now'";

const LiveAnalysisDemo = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [showResults, setShowResults] = useState(true); // pre-populated
  const [inputText, setInputText] = useState(DEFAULT_INPUT);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setShowResults(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      setAnimationKey((k) => k + 1);
    }, 3000);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const analysisCards = [
    {
      title: "INTERPRETATION",
      content: 'The "Shield" Response. Not a rejection of you, but a rejection of the current pace or perceived pressure.',
      delay: 0.3,
    },
    {
      title: "EMOTIONAL TONE",
      contentType: "bars" as const,
      delay: 0.6,
    },
    {
      title: "SUGGESTED STRATEGY",
      content: "Non-Reactive Reframe: Mirror their pace while maintaining your own frame...",
      delay: 0.9,
    },
    {
      title: "RECOMMENDED RESPONSE",
      contentType: "response" as const,
      delay: 1.2,
    },
  ];

  const renderCardContent = (card: typeof analysisCards[number]) => {
    if (card.contentType === 'bars') {
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Hesitation</span>
            <span className="text-green-400">74%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <motion.div
              key={`hes-${animationKey}`}
              className="bg-green-500 h-2 rounded"
              initial={{ width: 0 }}
              animate={showResults ? { width: '74%' } : { width: 0 }}
              transition={{ duration: 1, delay: card.delay }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span>Defensiveness</span>
            <span className="text-red-400">22%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <motion.div
              key={`def-${animationKey}`}
              className="bg-red-500 h-2 rounded"
              initial={{ width: 0 }}
              animate={showResults ? { width: '22%' } : { width: 0 }}
              transition={{ duration: 1, delay: card.delay + 0.2 }}
            />
          </div>
        </div>
      );
    }

    if (card.contentType === 'response') {
      return (
        <div className="space-y-2">
          <p className="text-red-300 italic">&quot;I respect that. I&apos;m just enjoying where things are at right now anyway. Let&apos;s keep it casual.&quot;</p>
          <button
            onClick={() => copyToClipboard("I respect that. I'm just enjoying where things are at right now anyway. Let's keep it casual.")}
            className="bg-gray-600 hover:bg-gray-500 px-2 py-1 text-xs rounded transition-colors"
          >
            COPY
          </button>
        </div>
      );
    }

    // String content with typing animation
    const text = card.content as string;
    return (
      <motion.span
        key={`text-${animationKey}`}
        initial={{ opacity: 0 }}
        animate={showResults ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3, delay: card.delay }}
      >
        {text}
      </motion.span>
    );
  };

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
                  <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  <span className="ml-2">ANALYZING...</span>
                </div>
              ) : (
                'START INTELLIGENCE SWEEP'
              )}
            </button>
          </motion.div>

          {/* Right side - Browser frame mockup with analysis results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Browser chrome */}
            <div className="rounded-t-lg bg-[#2a2a2a] border border-white/10 border-b-0">
              <div className="flex items-center gap-2 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-[#1a1a1a] rounded-md px-3 py-1 text-xs text-gray-500 font-mono text-center truncate">
                    app.shadowpersuasion.com/analyze
                  </div>
                </div>
              </div>
            </div>

            {/* Browser content area */}
            <div className="bg-[#111] border border-white/10 border-t-0 rounded-b-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {analysisCards.map((card) => (
                  <motion.div
                    key={card.title}
                    className="bg-gray-800/80 border border-gray-700 rounded p-4 h-40 overflow-hidden"
                    initial={{ opacity: 1 }}
                    animate={showResults ? { opacity: 1 } : { opacity: 0.15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-mono text-xs uppercase tracking-wider text-green-400 mb-3 border-b border-gray-700 pb-1">
                      {card.title}
                    </h3>
                    <div className="text-gray-300 text-sm">
                      {renderCardContent(card)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveAnalysisDemo;
