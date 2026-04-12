'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ConversationRow {
  original: string;
  breakdown: string;
  response: string;
  patterns: string[];
}

const ConversationBreakdown = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const conversations: ConversationRow[] = [
    {
      original: '"I\'m just not looking for anything serious right now"',
      breakdown: 'Protective response that signals interest but fear of vulnerability. They\'re attracted but guarding against emotional risk.',
      response: '"That\'s perfect. I\'m focused on my own goals anyway. Let\'s just see where this goes naturally."',
      patterns: ['PROTECTIVE SHIELD', 'INTEREST SIGNAL']
    },
    {
      original: '"We don\'t have the budget for a raise right now"',
      breakdown: 'Deflection tactic using organizational constraints as a shield. Often means "I haven\'t been given a compelling enough reason to fight for your raise."',
      response: '"I understand. What specific milestones would need to be hit for us to revisit compensation in Q3?"',
      patterns: ['BUDGET SHIELD', 'DEFLECTION']
    },
    {
      original: '"We\'re still evaluating other vendors"',
      breakdown: 'Leverage play to maintain negotiating power. May be genuine, but often used to pressure price concessions.',
      response: '"Of course. While you evaluate, I\'ll send over the ROI analysis from our last three clients in your space. Happy to connect you directly with them."',
      patterns: ['LEVERAGE PLAY', 'PRICE PRESSURE']
    },
    {
      original: '"I need some time to think about us"',
      breakdown: 'Processing pause — usually about feeling overwhelmed, not losing interest.',
      response: '"Take all the time you need. I\'m confident in what we have when you\'re ready."',
      patterns: ['PROCESSING PAUSE', 'SPACE REQUEST']
    }
  ];

  const getPatternColor = (pattern: string) => {
    const colors: Record<string, string> = {
      'PROTECTIVE SHIELD': 'bg-red-900 text-red-200 border-red-700',
      'INTEREST SIGNAL': 'bg-orange-900 text-orange-200 border-orange-700',
      'BUDGET SHIELD': 'bg-yellow-900 text-yellow-200 border-yellow-700',
      'DEFLECTION': 'bg-purple-900 text-purple-200 border-purple-700',
      'LEVERAGE PLAY': 'bg-blue-900 text-blue-200 border-blue-700',
      'PRICE PRESSURE': 'bg-indigo-900 text-indigo-200 border-indigo-700',
      'PROCESSING PAUSE': 'bg-pink-900 text-pink-200 border-pink-700',
      'SPACE REQUEST': 'bg-teal-900 text-teal-200 border-teal-700'
    };
    return colors[pattern] || 'bg-gray-900 text-gray-200 border-gray-700';
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">
            EVIDENCE EXHIBIT C-1
          </h2>
          <p className="text-3xl text-black font-special-elite">Real Conversation Breakdown</p>
        </motion.div>

        {/* Table Header - Desktop */}
        <div className="hidden lg:block">
          <motion.div 
            className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-6 mb-6 bg-[#EDE3D0] border-2 border-gray-400 p-4"
            style={{
              background: `
                linear-gradient(135deg, #EDE3D0 0%, #E8DCC8 100%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
              `,
              backgroundBlendMode: 'overlay'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">
              ORIGINAL MESSAGE
            </div>
            <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">
              AI BREAKDOWN
            </div>
            <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">
              RECOMMENDED RESPONSE
            </div>
            <div className="font-mono text-sm uppercase tracking-wider text-gray-700 font-bold">
              PATTERNS
            </div>
          </motion.div>

          {/* Table Rows - Desktop */}
          <div className="space-y-2">
            {conversations.map((conv, index) => (
              <motion.div
                key={index}
                className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-6 border-2 border-gray-400 p-4 hover:bg-[#EDE3D0] transition-colors"
                style={{
                  background: `
                    linear-gradient(135deg, #F4ECD8 0%, #F0E6D2 100%),
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
                  `,
                  backgroundBlendMode: 'overlay'
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="text-sm">
                  <p className="italic text-gray-800 font-special-elite">
                    {conv.original}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-700 leading-relaxed">
                    {conv.breakdown}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-black font-bold leading-relaxed">
                    {conv.response}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {conv.patterns.map((pattern, pIndex) => (
                    <span
                      key={pIndex}
                      className={`px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded ${getPatternColor(pattern)}`}
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
          {conversations.map((conv, index) => (
            <motion.div
              key={index}
              className="border-2 border-gray-400 p-6 space-y-4"
              style={{
                background: `
                  linear-gradient(135deg, #F4ECD8 0%, #F0E6D2 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-gray-600 mb-2">
                  ORIGINAL MESSAGE
                </h4>
                <p className="italic text-gray-800 font-special-elite mb-3">
                  {conv.original}
                </p>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-gray-600 mb-2">
                  AI BREAKDOWN
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {conv.breakdown}
                </p>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-gray-600 mb-2">
                  RECOMMENDED RESPONSE
                </h4>
                <p className="text-black font-bold text-sm leading-relaxed mb-3">
                  {conv.response}
                </p>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-gray-600 mb-2">
                  PATTERNS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {conv.patterns.map((pattern, pIndex) => (
                    <span
                      key={pIndex}
                      className={`px-2 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded ${getPatternColor(pattern)}`}
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* File Footer */}
        <motion.div 
          className="text-center mt-8 p-4 border-2 border-gray-400"
          style={{
            background: `
              linear-gradient(135deg, #EDE3D0 0%, #E8DCC8 100%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
            `,
            backgroundBlendMode: 'overlay'
          }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex justify-between items-center text-xs font-mono text-gray-600">
            <span>CLASSIFICATION: SAMPLE ANALYSES</span>
            <span>FILE: CONV_BREAKDOWN_C1.DOC</span>
            <span>PAGE 1 OF 247</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConversationBreakdown;