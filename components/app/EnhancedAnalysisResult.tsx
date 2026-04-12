'use client';

import { Copy, TrendingUp, AlertTriangle, Target, Zap, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface EnhancedAnalysis {
    powerDynamics: {
        yourPower: number;
        theirPower: number;
        dynamicsDescription: string;
    };
    communicationStyle: {
        sensoryPreference: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Mixed';
        emotionalState: string;
        receptivity: number;
    };
    responseOptions: {
        type: string;
        message: string;
        description: string;
        powerImpact: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        psychologyPrinciple: string;
    }[];
    overallAnalysis: string;
    successProbability: number;
    techniques_identified: string[];
}

interface EnhancedAnalysisResultProps {
    analysis: EnhancedAnalysis | null;
    imagePreview: string;
}

export function EnhancedAnalysisResult({ analysis, imagePreview }: EnhancedAnalysisResultProps) {
    const [selectedResponse, setSelectedResponse] = useState<number | null>(null);

    if (!analysis) return null;

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-green-400 bg-green-400/20 border-green-400/50';
            case 'MEDIUM': return 'text-yellow-300 bg-yellow-400/20 border-yellow-400/50';
            case 'HIGH': return 'text-red-300 bg-red-400/20 border-red-400/50';
            default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const PowerMeter = ({ label, description, value, color }: { 
        label: string; 
        description?: string;
        value: number; 
        color: string;
    }) => (
        <div className="flex-1">
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-mono uppercase text-[#D4A017]">{label}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-[#333333] px-3 py-1 rounded">{value}/10</span>
                </div>
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                )}
            </div>
            <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-1000`}
                    style={{ width: `${value * 10}%` }}
                />
            </div>
        </div>
    );

    // Handle both old and new API response formats
    const yourPower = (analysis.powerDynamics as any).yourPower || (analysis.powerDynamics as any).userPower || 0;
    const theirPower = (analysis.powerDynamics as any).theirPower || (analysis.powerDynamics as any).otherPower || 0;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Image Preview */}
            <div className="xl:col-span-1">
                <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333] sticky top-0">
                    <img src={imagePreview} alt="Conversation screenshot" className="rounded-md w-full" />
                </div>
            </div>

            {/* Analysis Panels */}
            <div className="xl:col-span-3 space-y-6">
                {/* Power Dynamics */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#D4A017]" />
                            <h2 className="font-mono text-lg uppercase text-[#D4A017]">Influence Position Analysis</h2>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <HelpCircle className="h-3 w-3" />
                            Who has control in this conversation?
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex gap-6">
                            <PowerMeter 
                                label="Your Influence Level" 
                                description="How much control you currently have"
                                value={yourPower} 
                                color="bg-[#D4A017]" 
                            />
                            <PowerMeter 
                                label="Their Influence Level" 
                                description="How much control they currently have"
                                value={theirPower} 
                                color="bg-blue-500" 
                            />
                        </div>
                        
                        <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-md">
                            <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.powerDynamics.dynamicsDescription}</p>
                        </div>
                    </div>
                </div>

                {/* Communication Intelligence */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#D4A017]" />
                            <h2 className="font-mono text-lg uppercase text-[#D4A017]">Communication Profile</h2>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <HelpCircle className="h-3 w-3" />
                            How they process information & respond to influence
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg">
                            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {analysis.communicationStyle.sensoryPreference}
                            </div>
                            <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">Processing Style</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {analysis.communicationStyle.sensoryPreference === 'Visual' ? 'Use pictures, charts, visuals' :
                                 analysis.communicationStyle.sensoryPreference === 'Auditory' ? 'Use sound, rhythm, verbal emphasis' :
                                 analysis.communicationStyle.sensoryPreference === 'Kinesthetic' ? 'Use feelings, touch, movement' :
                                 'Mix different communication styles'}
                            </div>
                        </div>
                        
                        <div className="text-center bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg">
                            <div className="text-xl font-bold text-blue-400 mb-1">
                                {analysis.communicationStyle.emotionalState}
                            </div>
                            <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">Current Mood</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Their emotional state right now</div>
                        </div>
                        
                        <div className="text-center bg-[#FAFAF8] dark:bg-[#0A0A0A] p-4 rounded-lg">
                            <div className="text-xl font-bold text-green-400 mb-1">
                                {analysis.communicationStyle.receptivity}%
                            </div>
                            <div className="text-xs font-mono uppercase text-[#D4A017] mb-1">Influence Openness</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {analysis.communicationStyle.receptivity >= 70 ? 'Very open to suggestions' :
                                 analysis.communicationStyle.receptivity >= 40 ? 'Moderately receptive' :
                                 'Resistant to influence attempts'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategic Response Options */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-[#D4A017]" />
                            <h2 className="font-mono text-lg uppercase text-[#D4A017]">Strategic Response Options</h2>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <HelpCircle className="h-3 w-3" />
                                Click to see psychology details
                            </div>
                            <div className="font-mono text-gray-500 dark:text-gray-400">
                                Success Rate: <span className="text-green-400 font-bold">{analysis.successProbability}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {analysis.responseOptions.map((option, index) => (
                            <div
                                key={index}
                                className={`bg-gray-50 dark:bg-[#222222] p-4 rounded-lg border transition-all cursor-pointer ${
                                    selectedResponse === index 
                                        ? 'border-[#D4A017] bg-amber-50 dark:bg-[#2A2520]' 
                                        : 'border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:border-[#444444]'
                                }`}
                                onClick={() => setSelectedResponse(selectedResponse === index ? null : index)}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-mono uppercase text-[#D4A017] font-bold text-sm">
                                            {option.type}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(option.riskLevel)}`}>
                                            {option.riskLevel === 'LOW' ? 'SAFE' :
                                             option.riskLevel === 'MEDIUM' ? 'CAREFUL' : 'RISKY'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-green-400 font-bold">
                                        +{option.powerImpact}% influence
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{option.description}</p>

                                {/* Message */}
                                <div className="bg-gray-200 dark:bg-[#333333] p-3 rounded relative group">
                                    <p className="text-gray-900 dark:text-white font-medium text-sm pr-8">{option.message}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(option.message);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-gray-300 dark:bg-[#444444] rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#555555]"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>

                                {/* Psychology Principle - Expanded View */}
                                {selectedResponse === index && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#333333] space-y-2">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-3 w-3 text-[#D4A017] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs font-mono uppercase text-[#D4A017] mb-1">Psychology Behind This</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300">{option.psychologyPrinciple}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-2 rounded text-xs text-gray-500 dark:text-gray-400">
                                            💡 <strong>Why this works:</strong> {option.description}
                                        </div>
                                        
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">
                                                Risk Level: {option.riskLevel === 'LOW' ? 'Safe to use' :
                                                           option.riskLevel === 'MEDIUM' ? 'Watch their reaction' : 
                                                           'Use carefully - could backfire'}
                                            </span>
                                            <span className="text-green-400 font-mono">
                                                Expected boost: +{option.powerImpact}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overall Analysis */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <h2 className="font-mono text-lg uppercase text-[#D4A017] mb-4">Strategic Assessment</h2>
                    
                    <div className="space-y-4">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.overallAnalysis}</p>
                        </div>
                        
                        {analysis.techniques_identified.length > 0 && (
                            <div>
                                <h3 className="font-mono text-sm uppercase text-[#D4A017] mb-2">
                                    Techniques They're Using On You
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.techniques_identified.map((technique, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-red-500/20 text-red-300 text-xs font-mono border border-red-500/30 px-2 py-1 rounded-full"
                                        >
                                            {technique}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    ⚠️ Recognizing these patterns helps you defend against manipulation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}