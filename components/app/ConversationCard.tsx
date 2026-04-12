'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Calendar, Brain, Target, AlertTriangle } from 'lucide-react';

interface Conversation {
    id: string;
    personName: string;
    context: string;
    lastInteraction: string;
    communicationStyle: {
        sensoryPreference: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Mixed';
        emotionalPattern: string;
        receptivity: number;
    };
    techniques: {
        name: string;
        effectiveness: number;
        lastUsed: string;
    }[];
    nextRecommendedAction: string;
    relationship: 'Professional' | 'Personal' | 'Romantic' | 'Client' | 'Other';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notes: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface ConversationCardProps {
    conversation: Conversation;
    onUpdate: (updates: Partial<Conversation>) => void;
    onDelete: () => void;
}

export function ConversationCard({ conversation, onUpdate, onDelete }: ConversationCardProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const getDaysAgo = (dateString: string) => {
        const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getRelationshipColor = (relationship: string) => {
        switch (relationship) {
            case 'Professional': return 'bg-blue-500';
            case 'Personal': return 'bg-green-500';
            case 'Romantic': return 'bg-pink-500';
            case 'Client': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getSensoryIcon = (preference: string) => {
        switch (preference) {
            case 'Visual': return '👁️';
            case 'Auditory': return '👂';
            case 'Kinesthetic': return '🤚';
            default: return '🧠';
        }
    };

    return (
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-6 space-y-4 hover:border-gray-300 dark:border-[#444444] transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{conversation.personName}</h3>
                        <div className={`w-3 h-3 rounded-full ${getRelationshipColor(conversation.relationship)}`} 
                             title={conversation.relationship} />
                        <span className={`px-2 py-0.5 text-xs font-mono border rounded ${getRiskColor(conversation.riskLevel)}`}>
                            {conversation.riskLevel}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{conversation.context}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Last interaction: {getDaysAgo(conversation.updatedAt)}
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-[#333333] rounded transition-colors"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showDropdown && (
                        <div className="absolute right-0 top-8 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                                onClick={() => {
                                    setIsExpanded(!isExpanded);
                                    setShowDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-[#333333] flex items-center gap-2"
                            >
                                <Eye className="h-3 w-3" />
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-[#333333] flex items-center gap-2"
                            >
                                <Edit className="h-3 w-3" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    onDelete();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-[#333333] text-red-400 flex items-center gap-2"
                            >
                                <Trash2 className="h-3 w-3" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {getSensoryIcon(conversation.communicationStyle.sensoryPreference)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">{conversation.communicationStyle.sensoryPreference}</div>
                </div>
                
                <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                        {conversation.communicationStyle.receptivity}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">Receptivity</div>
                </div>
                
                <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                        {conversation.techniques.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">Techniques</div>
                </div>
            </div>

            {/* Next Action */}
            <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-3 rounded border-l-4 border-[#D4A017]">
                <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-mono uppercase text-[#D4A017] mb-1">Next Recommended Action</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{conversation.nextRecommendedAction}</p>
                    </div>
                </div>
            </div>

            {/* Tags */}
            {conversation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {conversation.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-200 dark:bg-[#333333] text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Expanded Details */}
            {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#333333]">
                    {/* Emotional Pattern */}
                    <div>
                        <h4 className="text-sm font-mono uppercase text-[#D4A017] mb-2">Emotional Pattern</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{conversation.communicationStyle.emotionalPattern}</p>
                    </div>

                    {/* Techniques */}
                    {conversation.techniques.length > 0 && (
                        <div>
                            <h4 className="text-sm font-mono uppercase text-[#D4A017] mb-2">Effective Techniques</h4>
                            <div className="space-y-2">
                                {conversation.techniques.slice(0, 3).map((technique, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-[#222222] p-2 rounded">
                                        <span className="text-sm text-gray-900 dark:text-white">{technique.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 dark:bg-[#333333] rounded-full h-2">
                                                <div 
                                                    className="bg-[#D4A017] h-2 rounded-full"
                                                    style={{ width: `${technique.effectiveness}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{technique.effectiveness}%</span>
                                        </div>
                                    </div>
                                ))}
                                {conversation.techniques.length > 3 && (
                                    <p className="text-xs text-gray-500">
                                        +{conversation.techniques.length - 3} more techniques
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {conversation.notes && (
                        <div>
                            <h4 className="text-sm font-mono uppercase text-[#D4A017] mb-2">Notes</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{conversation.notes}</p>
                        </div>
                    )}

                    {/* Risk Assessment */}
                    {conversation.riskLevel !== 'LOW' && (
                        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-mono uppercase text-red-400 mb-1">Risk Assessment</p>
                                    <p className="text-xs text-red-200">
                                        {conversation.riskLevel === 'HIGH' 
                                            ? 'High risk relationship - proceed with extreme caution'
                                            : 'Moderate risk - monitor responses carefully'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-[#333333] flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Created {getDaysAgo(conversation.createdAt)}
                    </div>
                </div>
            )}
        </div>
    );
}