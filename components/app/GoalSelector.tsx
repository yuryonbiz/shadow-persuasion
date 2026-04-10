'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTaxonomy, TaxonomyCategory, TaxonomyUseCase } from '@/lib/hooks/useTaxonomy';

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

export function GoalSelector({ onSelectGoal }: GoalSelectorProps) {
    const { categories, loading } = useTaxonomy();
    const [selectedCategory, setSelectedCategory] = useState<TaxonomyCategory | null>(null);

    const handleCategoryClick = (category: TaxonomyCategory) => {
        if (category.useCases.length > 0) {
            setSelectedCategory(category);
        } else {
            // No use cases, go directly
            onSelectGoal({
                id: category.id,
                title: category.name,
                description: category.description,
                icon: <span className="text-2xl">{category.emoji}</span>,
                color: 'bg-[#D4A017]',
                examples: [],
            });
        }
    };

    const handleUseCaseClick = (useCase: TaxonomyUseCase) => {
        if (!selectedCategory) return;
        onSelectGoal({
            id: selectedCategory.id,
            title: useCase.title,
            description: selectedCategory.description,
            icon: <span className="text-2xl">{selectedCategory.emoji}</span>,
            color: 'bg-[#D4A017]',
            examples: [],
        });
    };

    const handleCustomStart = () => {
        if (!selectedCategory) return;
        onSelectGoal({
            id: selectedCategory.id,
            title: selectedCategory.name,
            description: selectedCategory.description,
            icon: <span className="text-2xl">{selectedCategory.emoji}</span>,
            color: 'bg-[#D4A017]',
            examples: [],
        });
    };

    // Step 2: Use case selection within a category
    if (selectedCategory) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to categories
                    </button>
                    <h1 className="text-3xl font-bold uppercase font-mono tracking-wider text-[#D4A017] mb-2">
                        {selectedCategory.emoji} {selectedCategory.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Pick your specific situation, or start with a custom topic.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                    {selectedCategory.useCases.map((uc) => (
                        <button
                            key={uc.id}
                            onClick={() => handleUseCaseClick(uc)}
                            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 text-left hover:border-[#D4A017] hover:bg-gray-50 dark:hover:bg-[#222222] transition-all duration-200 group"
                        >
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#D4A017] transition-colors">
                                {uc.title}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Custom / general option */}
                <div className="text-center">
                    <button
                        onClick={handleCustomStart}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#D4A017] transition-colors underline underline-offset-2"
                    >
                        Start with a custom topic instead
                    </button>
                </div>
            </div>
        );
    }

    // Step 1: Category selection
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

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category)}
                            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-6 text-left hover:border-[#D4A017] hover:bg-gray-100 dark:hover:bg-[#222222] transition-all duration-200 group"
                        >
                            {/* Emoji */}
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                                {category.emoji}
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <h3 className="font-mono text-xl uppercase font-bold text-gray-900 dark:text-white group-hover:text-[#D4A017] transition-colors">
                                    {category.name}
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    {category.description}
                                </p>

                                {/* Use cases preview */}
                                {category.useCases.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-mono uppercase text-gray-500">Situations:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {category.useCases.slice(0, 3).map((uc) => (
                                                <span
                                                    key={uc.id}
                                                    className="text-xs bg-gray-200 dark:bg-[#333333] text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                                >
                                                    {uc.title}
                                                </span>
                                            ))}
                                            {category.useCases.length > 3 && (
                                                <span className="text-xs text-gray-400 px-1 py-1">
                                                    +{category.useCases.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
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
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
                <p>Each session is personalized to your specific situation and provides actionable strategies.</p>
            </div>
        </div>
    );
}