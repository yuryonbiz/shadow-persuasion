'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';

const FileCard = ({ file, title, description, classification, style = {} }) => (
  <div className="bg-[#E8DCC8] p-6 shadow-md relative border-l-4 border-gray-400" style={style}>
    <div className="absolute -top-4 left-4 bg-gray-300 px-3 py-1 text-sm font-bold border-t-2 border-x-2 border-gray-400 rounded-t-md">{file}</div>
    <p className="text-red-700 font-bold absolute top-4 right-4 text-sm">{classification}</p>
    <h3 className="text-2xl font-bold mt-4">{title}</h3>
    <p className="text-gray-700 mt-2 h-12">{description}</p>
  </div>
);

const SubjectFiles = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [showAll, setShowAll] = useState(false);
  
  const files = [
    { file: 'FILE-001', title: 'AI Operator Console', description: 'Real-time conversational analysis and tactical guidance for any interaction.', classification: 'RESTRICTED' },
    { file: 'FILE-002', title: 'Visual Intelligence Module', description: 'Analyze body language and micro-expressions from uploaded images.', classification: 'SENSITIVE' },
    { file: 'FILE-003', title: 'Dark Psychology Engine', description: 'Leverages a proprietary dataset of high-stakes human influence scenarios.', classification: 'RESTRICTED' },
    { file: 'FILE-004', title: 'Negotiation Warfare System', description: 'Game-theory models to secure favorable outcomes in any negotiation.', classification: 'SENSITIVE' },
    { file: 'FILE-005', title: 'Persuasion Script Library', description: 'Pre-built and AI-generated scripts to handle common objections and scenarios.', classification: 'SENSITIVE' },
    { file: 'FILE-006', title: 'Psychological Profiling Unit', description: 'Generate detailed personality and vulnerability profiles from limited data inputs.', classification: 'RESTRICTED' },
  ];

  return (
    <section ref={ref}>
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-12 text-center">Subject Files</h2>
      
      {!showAll ? (
        <div className="relative">
          {/* Stacked/fanned out files - first 3 */}
          <div className="relative h-80 flex justify-center items-end">
            {files.slice(0, 3).map((file, index) => (
              <motion.div
                key={file.file}
                className="absolute"
                style={{
                  transform: `translateX(${(index - 1) * 40}px) rotate(${(index - 1) * 3}deg)`,
                  zIndex: 3 - index,
                }}
                initial={{ opacity: 0, y: 50, rotate: 0 }}
                animate={inView ? { 
                  opacity: 1, 
                  y: 0, 
                  rotate: (index - 1) * 3 
                } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <FileCard {...file} style={{ width: '320px' }} />
              </motion.div>
            ))}
          </div>
          
          {/* View All Files button */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button
              onClick={() => setShowAll(true)}
              className="bg-[#1A1A1A] text-white font-special-elite px-8 py-4 uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300 border-2 border-gray-400"
            >
              View All Files ({files.length - 3} More)
            </button>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {files.map((file, index) => (
            <motion.div
              key={file.file}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FileCard {...file} />
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {showAll && (
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={() => setShowAll(false)}
            className="bg-gray-600 text-white font-special-elite px-8 py-3 uppercase tracking-wider hover:bg-gray-700 transition-colors duration-300 border-2 border-gray-400"
          >
            Collapse Files
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default SubjectFiles;
