'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

interface CaseFile {
  id: string;
  title: string;
  risk: 'HIGH' | 'MODERATE' | 'LOW';
  intercepted: string;
  analysis: string;
  response: string;
  effect: string;
}

const CaseFileBrowser = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [expandedCase, setExpandedCase] = useState('CF-782');

  const caseFiles: CaseFile[] = [
    {
      id: 'CF-782',
      title: 'Responding to a flake',
      risk: 'HIGH',
      intercepted: '"Sorry, I can\'t make it tonight. Maybe another time?"',
      analysis: 'Classic deflection pattern. Testing your reaction to gauge their position in the dynamic. They want to see if you\'ll chase, validate, or maintain frame.',
      response: '"No worries. I\'ve got other plans anyway. Hit me up when you\'re free."',
      effect: 'Reverses the script. Shows abundance mentality and removes pressure while maintaining interest.'
    },
    {
      id: 'CF-901',
      title: 'The "Busy" manager deflection',
      risk: 'MODERATE',
      intercepted: '"I\'ve been really busy with work lately. Can we talk about this next week?"',
      analysis: 'Avoidance tactic using external circumstances as shield. Creates distance while maintaining plausible deniability.',
      response: '"Understood. When you have bandwidth, let\'s connect. Until then, I\'ll focus on other priorities."',
      effect: 'Acknowledges without pursuing. Creates space that paradoxically increases their motivation to engage.'
    },
    {
      id: 'CF-112',
      title: 'Post-date "Goodnight" analysis',
      risk: 'LOW',
      intercepted: '"Thanks for tonight. Goodnight."',
      analysis: 'Neutral but positive closure signal. No investment indicators, but no rejection markers either. Standard courtesy protocol.',
      response: '"Enjoyed it too. Sleep well."',
      effect: 'Mirrors their energy level. Maintains equal investment without appearing over-eager or under-interested.'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'border-red-600 text-red-400 bg-red-900';
      case 'MODERATE':
        return 'border-amber-600 text-amber-400 bg-amber-900';
      case 'LOW':
        return 'border-green-600 text-green-400 bg-green-900';
      default:
        return 'border-gray-600 text-gray-400 bg-gray-900';
    }
  };

  const toggleCase = (caseId: string) => {
    setExpandedCase(expandedCase === caseId ? '' : caseId);
  };

  return (
    <section className="w-full" style={{
      background: `
        linear-gradient(135deg, #1A1611 0%, #0F0F0D 100%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")
      `,
      backgroundBlendMode: 'overlay'
    }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div 
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-400 mb-2">
            ARCHIVED OPERATIONS
          </h2>
          <p className="text-3xl text-white font-special-elite">Case File Browser</p>
        </motion.div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {caseFiles.map((caseFile, index) => (
            <motion.div
              key={caseFile.id}
              className="border-2 border-gray-500 overflow-hidden shadow-lg"
              style={{
                background: `
                  linear-gradient(135deg, #2A251F 0%, #1F1C17 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Header */}
              <button
                onClick={() => toggleCase(caseFile.id)}
                className="w-full p-6 text-left transition-all duration-300 focus:outline-none"
                style={{
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, #2F2A23 0%, #24211B 100%),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
                  `
                  e.currentTarget.style.backgroundBlendMode = 'overlay'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg text-green-400">
                      Case #{caseFile.id}:
                    </span>
                    <span className="text-white text-lg">
                      {caseFile.title}
                    </span>
                    <span className={`px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded ${getRiskColor(caseFile.risk)}`}>
                      {caseFile.risk} RISK
                    </span>
                  </div>
                  <motion.div
                    className="text-gray-400 text-2xl"
                    animate={{ rotate: expandedCase === caseFile.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedCase === caseFile.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-600"
                  >
                    <div className="p-6 grid md:grid-cols-3 gap-6">
                      {/* Intercepted */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-sm uppercase tracking-wider text-green-400 border-b border-gray-600 pb-1">
                          INTERCEPTED
                        </h4>
                        <div className="p-4 border-l-4 border-green-500" style={{
                          background: `
                            linear-gradient(135deg, #1B1F1B 0%, #141814 100%),
                            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
                          `,
                          backgroundBlendMode: 'overlay'
                        }}>
                          <p className="text-green-300 italic font-mono">
                            {caseFile.intercepted}
                          </p>
                        </div>
                      </div>

                      {/* Analysis */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-sm uppercase tracking-wider text-amber-400 border-b border-gray-600 pb-1">
                          AI INTELLIGENCE SWEEP
                        </h4>
                        <div className="p-4 border-l-4 border-amber-500" style={{
                          background: `
                            linear-gradient(135deg, #1F1B15 0%, #181610 100%),
                            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
                          `,
                          backgroundBlendMode: 'overlay'
                        }}>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {caseFile.analysis}
                          </p>
                        </div>
                      </div>

                      {/* Response */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-sm uppercase tracking-wider text-blue-400 border-b border-gray-600 pb-1">
                          RECOMMENDED RESPONSE
                        </h4>
                        <div className="p-4 border-l-4 border-blue-500" style={{
                          background: `
                            linear-gradient(135deg, #15191F 0%, #101418 100%),
                            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
                          `,
                          backgroundBlendMode: 'overlay'
                        }}>
                          <p className="text-white font-bold mb-2">
                            {caseFile.response}
                          </p>
                          <p className="text-gray-400 text-sm italic">
                            Effect: {caseFile.effect}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="font-mono text-sm text-gray-500 uppercase tracking-wider">
            [DATABASE CONTAINS 2,847 ADDITIONAL CASE FILES]
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseFileBrowser;