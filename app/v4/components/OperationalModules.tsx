'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const modules = [
    {
        id: 'MODULE-001',
        title: 'Negotiation Warfare',
        description: 'AI-powered negotiation coaching with real-time script generation.',
        classification: 'RESTRICTED',
    },
    {
        id: 'MODULE-002',
        title: 'Frame Control Lab',
        description: 'Practice frame control techniques with AI-simulated scenarios.',
        classification: 'SENSITIVE',
    },
    {
        id: 'MODULE-003',
        title: 'Persuasion Scripts',
        description: 'Library of proven scripts for sales, dating, leadership, conflict.',
        classification: 'RESTRICTED',
    },
    {
        id: 'MODULE-004',
        title: 'Body Language Decoder',
        description: 'Upload photos for AI analysis of micro-expressions and power signals.',
        classification: 'SENSITIVE',
    },
    {
        id: 'MODULE-005',
        title: 'Psychological Profiling',
        description: 'Build detailed profiles of targets using behavioral data.',
        classification: 'RESTRICTED',
    },
    {
        id: 'MODULE-006',
        title: 'Dark Pattern Library',
        description: '50+ influence patterns with AI deployment guidance.',
        classification: 'SENSITIVE',
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ClassificationStamp = ({ text }: { text: string }) => {
    const color = text === 'RESTRICTED' ? 'border-yellow-600 text-yellow-700' : 'border-orange-600 text-orange-700';
    return (
        <div className={`absolute bottom-2 right-2 -rotate-6 border ${color} px-1 text-xs font-mono tracking-wider opacity-80`}>
            {text}
        </div>
    );
};

export const OperationalModules = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section ref={ref} className="relative py-16 sm:py-24 border-b-2 border-dashed border-gray-400">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                <div className="text-left mb-12">
                    <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">Appendix A</h2>
                    <p className="font-special-elite text-3xl text-black mt-2">Operational Module Index</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {modules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            variants={cardVariants}
                            initial="hidden"
                            animate={inView ? 'visible' : 'hidden'}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative flex flex-col rounded-sm border border-gray-400 bg-[#EDE3D0] p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black"
                        >
                            <div className="flex items-center justify-between border-b-2 border-dashed border-gray-400 pb-2">
                                <div className="font-mono text-xs text-gray-600 bg-gray-300 px-2 py-1 rounded-t-md border-t border-l border-r border-gray-400">{module.id}</div>
                                <div className="font-mono text-xs uppercase text-green-800 tracking-wider font-bold">Full Access</div>
                            </div>
                            <div className="pt-4 flex-grow">
                                <h3 className="font-special-elite text-xl font-bold text-black">{module.title}</h3>
                                <p className="mt-2 font-special-elite text-base text-gray-800 leading-relaxed">{module.description}</p>
                            </div>
                            <ClassificationStamp text={module.classification} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
