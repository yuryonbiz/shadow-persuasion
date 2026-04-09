'use client';

import { Target, Briefcase, Heart, Zap, Shield, TrendingUp, Star } from 'lucide-react';

interface Goal {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    examples: string[];
}

interface GoalSelectorProps {
    onSelectGoal: (goal: Goal) => void;
}

// Goal IDs aligned with ONBOARDING_GOALS in app/app/page.tsx
export function GoalSelector({ onSelectGoal }: GoalSelectorProps) {
    const goals: Goal[] = [
        {
            id: 'career',
            title: 'Dominate at Work',
            description: 'Promotions, raises, workplace politics, getting taken seriously',
            icon: <Briefcase className="h-6 w-6" />,
            color: 'bg-green-500',
            examples: ['Salary negotiations', 'Office politics', 'Career advancement']
        },
        {
            id: 'dating',
            title: 'Attract & Connect',
            description: 'Dating, attraction, chemistry, building romantic connections',
            icon: <Heart className="h-6 w-6" />,
            color: 'bg-pink-500',
            examples: ['First dates', 'Building attraction', 'Deepening connections']
        },
        {
            id: 'business',
            title: 'Close & Persuade',
            description: 'Sales, clients, deals, getting people to say yes',
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'bg-amber-500',
            examples: ['Client persuasion', 'Sales conversations', 'Deal closing']
        },
        {
            id: 'social',
            title: 'Command Any Room',
            description: 'Social power, first impressions, respect, leadership presence',
            icon: <Star className="h-6 w-6" />,
            color: 'bg-blue-500',
            examples: ['Leadership presence', 'First impressions', 'Social influence']
        },
        {
            id: 'defense',
            title: 'Neutralize Toxic People',
            description: 'Handle manipulators, set boundaries, psychological defense',
            icon: <Shield className="h-6 w-6" />,
            color: 'bg-red-500',
            examples: ['Difficult people', 'Setting boundaries', 'Counter-manipulation']
        },
        {
            id: 'confidence',
            title: 'Build Unshakable Confidence',
            description: 'Stop seeking approval, own your presence, inner power',
            icon: <Zap className="h-6 w-6" />,
            color: 'bg-purple-500',
            examples: ['Self-assurance', 'Personal power', 'Presence']
        },
        {
            id: 'all',
            title: 'General Communication',
            description: 'Master it all — every tool, every technique, every edge',
            icon: <Target className="h-6 w-6" />,
            color: 'bg-[#D4A017]',
            examples: ['Daily conversations', 'Persuasion skills', 'Full arsenal']
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold uppercase font-mono tracking-wider text-[#D4A017] mb-4">
                    Strategic Communication Coach
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    Select your objective to receive tailored strategies, techniques, and exact scripts 
                    for maximum influence and success.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                    <button
                        key={goal.id}
                        onClick={() => onSelectGoal(goal)}
                        className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-6 text-left hover:border-[#D4A017] hover:bg-gray-100 dark:hover:bg-[#222222] transition-all duration-200 group"
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 ${goal.color} rounded-lg flex items-center justify-center text-gray-900 dark:text-white mb-4 group-hover:scale-110 transition-transform`}>
                            {goal.icon}
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            <h3 className="font-mono text-xl uppercase font-bold text-gray-900 dark:text-white group-hover:text-[#D4A017] transition-colors">
                                {goal.title}
                            </h3>
                            
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                {goal.description}
                            </p>
                            
                            {/* Examples */}
                            <div className="space-y-1">
                                <p className="text-xs font-mono uppercase text-gray-500">Examples:</p>
                                <div className="flex flex-wrap gap-1">
                                    {goal.examples.map((example, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-gray-200 dark:bg-[#333333] text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                        >
                                            {example}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="mt-4 text-[#D4A017] opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
                <p>Each session is personalized to your specific situation and provides actionable strategies.</p>
            </div>
        </div>
    );
}