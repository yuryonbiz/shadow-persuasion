
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const modules = [
    {
        id: 'MODULE-001',
        title: 'Conversation Analyzer',
        description: 'Upload screenshots of any conversation. Get instant analysis of power dynamics, manipulation detection, and strategic response scripts.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-002',
        title: 'Strategic Coach',
        description: 'AI coaching chat for any situation. Describe what you\'re facing: salary talks, a tough breakup, a client negotiation. Get tactical guidance immediately.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-003',
        title: 'Quick-Fire Mode',
        description: 'Need a response RIGHT NOW? Get 3 strategic approaches with follow-up scenarios in under 30 seconds.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-004',
        title: 'Message Optimizer',
        description: 'Paste your draft message. Get psychologically optimized rewrites that land the way you intend.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-005',
        title: 'People Profiles',
        description: 'Build communication profiles for key people in your life: your boss, partner, clients. Track interactions and get personalized strategies.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-006',
        title: 'Training Arena',
        description: 'Practice any scenario with AI role-play. Get real-time coaching annotations and post-session debriefs.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-007',
        title: 'Field Ops',
        description: 'Daily missions to practice techniques in real conversations. Submit field reports and get AI grading on your execution.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-008',
        title: 'Technique Library',
        description: '700+ influence techniques with summaries, practice scenarios, annotated examples, and technique stacking for multi-step strategies.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-009',
        title: 'Persuasion Score',
        description: 'Gamified progress tracking with XP, streaks, skill breakdowns, and level progression.',
        classification: 'ACTIVE',
    },
    {
        id: 'MODULE-010',
        title: 'Voice Profile',
        description: 'The AI learns YOUR writing style and adapts all scripts and responses to sound like you, not a robot.',
        classification: 'ACTIVE',
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ClassificationStamp = ({ text }: { text: string }) => {
    const color = 'border-green-600 text-green-700';
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
        <section ref={ref} className="relative bg-[#EDE3D0] rounded-lg p-8 md:p-12">
            <div className="text-left mb-12">
                <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">Appendix A</h2>
                <p className="font-special-elite text-3xl text-black mt-2">Everything Inside Your Membership</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((module, index) => (
                    <motion.div
                        key={module.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative flex flex-col rounded-sm border border-gray-400 bg-[#F4ECD8] p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black"
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
        </section>
    );
};
