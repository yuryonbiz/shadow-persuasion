'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatInput } from '@/components/app/ChatInput';
import { ChatMessage } from '@/components/app/ChatMessage';
import { Target, TrendingUp, AlertTriangle, Lightbulb, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Goal {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    examples: string[];
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
    imagePreview?: string;
}

interface StrategicChatProps {
    goal: Goal;
    onBack: () => void;
    resumeSessionId?: string;
    initialMessages?: Message[];
}

interface PersonProfile {
    id: string;
    name: string;
    relationshipType?: string;
    analysis_data?: any;
    keyTraitTags?: string[];
    communicationStyle?: string;
    notes?: string;
}

export function StrategicChat({ goal, onBack, resumeSessionId, initialMessages }: StrategicChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(resumeSessionId || null);
    const [tacticalGuidance, setTacticalGuidance] = useState<any>(null);
    const [progressScore, setProgressScore] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // People integration state
    const [peopleProfiles, setPeopleProfiles] = useState<PersonProfile[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);
    const [loadingPeople, setLoadingPeople] = useState(false);

    const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
        const token = await user?.getIdToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [user]);

    // Fetch people profiles on mount
    useEffect(() => {
        const fetchPeople = async () => {
            setLoadingPeople(true);
            try {
                const headers = await getHeaders();
                const res = await fetch('/api/profiler/people', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setPeopleProfiles(data.profiles || []);
                }
            } catch (e) {
                console.error('Failed to load people profiles:', e);
            } finally {
                setLoadingPeople(false);
            }
        };
        fetchPeople();
    }, [getHeaders]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize conversation with goal-specific introduction
    useEffect(() => {
        const initMessage: Message = {
            id: 'init',
            role: 'assistant',
            content: `I'm your Strategic Communication Coach, focused on: **${goal.title}**\n\nI'll provide specific tactics, exact scripts, and real-time guidance to help you achieve your objective.\n\n**To get started, describe your specific situation:**\n\n• Who are you dealing with?\n• What's the context?\n• What outcome do you want?\n• What challenges are you facing?\n\nThe more specific you are, the more targeted my tactical guidance will be.`
        };
        setMessages([initMessage]);
    }, [goal]);

    const handleSend = async (input: string, image?: { file: File; preview: string; base64: string }) => {
        // If image is attached, add a description for the AI
        let enrichedInput = input;
        if (image) {
            enrichedInput = `[User attached an image]\n${input || 'Please analyze this image and provide strategic guidance.'}`;
        }

        // If a person is selected, prepend their profile context
        if (selectedPerson) {
            const traits = selectedPerson.keyTraitTags?.join(', ') || 'unknown';
            const commStyle = selectedPerson.communicationStyle || 'not profiled yet';
            const analysisInfo = selectedPerson.analysis_data
                ? `Threat score: ${selectedPerson.analysis_data.threat_score || 'N/A'}, Communication style: ${JSON.stringify(selectedPerson.analysis_data.communication_style || {})}`
                : '';
            enrichedInput = `[Context: I'm dealing with ${selectedPerson.name}. Their profile: traits=${traits}, communication style=${commStyle}. ${analysisInfo} ${selectedPerson.notes ? 'Notes: ' + selectedPerson.notes : ''}]\n\n${enrichedInput}`;
        }

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: enrichedInput };
        // Show the original input + image preview in the UI
        const displayContent = image ? `📷 ${input || '(image attached)'}` : input;
        const displayMessage: Message = { id: Date.now().toString(), role: 'user', content: displayContent, imagePreview: image?.preview };
        setMessages(prev => [...prev, displayMessage]);
        setIsLoading(true);

        try {
            // If image is attached, first extract text via vision API
            let imageContext = '';
            if (image?.base64) {
                try {
                    const extractRes = await fetch('/api/user/voice-profile/extract', {
                        method: 'POST',
                        body: (() => { const fd = new FormData(); fd.append('image', image.file); return fd; })(),
                    });
                    if (extractRes.ok) {
                        const extractData = await extractRes.json();
                        if (extractData.extractedText) {
                            imageContext = `\n[Extracted text from the attached image: "${extractData.extractedText}"]\n`;
                            userMessage.content = enrichedInput + imageContext;
                        }
                    }
                } catch {}
            }

            const response = await fetch('/api/strategic-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    goal: goal.id,
                    goalTitle: goal.title,
                    session_id: activeSessionId || undefined,
                }),
            });

            // Track session id from response
            const returnedSessionId = response.headers.get('X-Session-Id');
            if (returnedSessionId && !activeSessionId) {
                setActiveSessionId(returnedSessionId);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }
            
            setMessages(prev => [...prev, { id: 'assistant-placeholder', role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            let done = false;
            let buffer = '';
            let fullContent = '';
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    
                    // Process complete lines
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer
                    
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        // Skip SSE comments (lines starting with :)
                        if (trimmed.startsWith(':')) continue;

                        // Handle server-sent events format
                        if (trimmed.startsWith('data: ')) {
                            const data = trimmed.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const json = JSON.parse(data);
                                const content = json.choices?.[0]?.delta?.content || '';
                                if (content) {
                                    fullContent += content;
                                }
                            } catch (e) {
                                // Skip non-JSON data — don't display raw SSE artifacts
                            }
                        } else if (!trimmed.includes('{"id":') && !trimmed.includes('"object":"chat.completion.chunk"')) {
                            // Plain text content
                            fullContent += trimmed + '\n';
                        }
                    }
                    
                    // Parse tactical guidance if present
                    const guidanceMatch = fullContent.match(/<!--GUIDANCE:(.*?)-->/);
                    if (guidanceMatch) {
                        try {
                            const guidance = JSON.parse(guidanceMatch[1]);
                            setTacticalGuidance(guidance);
                        } catch {}
                    }
                    
                    // Strip guidance from displayed content
                    const displayContent = fullContent.replace(/\n\n<!--GUIDANCE:.*?-->/, '');
                    
                    setMessages(prev => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage.role === 'assistant') {
                            return [...prev.slice(0, -1), { ...lastMessage, content: displayContent }];
                        }
                        return prev;
                    });
                }
            }
            
        } catch (error) {
            console.error('Strategic chat error:', error);
            setMessages(prev => [...prev, { 
                id: 'error-' + Date.now(), 
                role: 'assistant', 
                content: 'Sorry, I encountered an error processing your request. Please try again.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 mb-4 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-[#333333] rounded transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    
                    <div className={`w-10 h-10 ${goal.color} rounded-lg flex items-center justify-center text-white`}>
                        {goal.icon}
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="font-mono uppercase text-[#D4A017] font-bold">
                            {goal.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
                    </div>

                    {progressScore > 0 && (
                        <div className="text-right">
                            <div className="text-lg font-bold text-green-400">{progressScore}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">Progress</div>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg">
                    {messages.map((msg) => (
                        <div key={msg.id}>
                            {msg.imagePreview && (
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-1`}>
                                    <img src={msg.imagePreview} alt="Attached" className="max-h-40 rounded-lg border border-gray-200 dark:border-[#333]" />
                                </div>
                            )}
                            <ChatMessage role={msg.role} content={msg.content} sources={msg.sources} />
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1]?.role === 'user' && (
                        <ChatMessage role="assistant" content="Analyzing your situation and preparing tactical guidance..." isLoading={true} />
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="mt-4">
                    <ChatInput 
                        onSend={handleSend} 
                        isLoading={isLoading} 
                        placeholder="Describe your situation or ask for specific tactical guidance..."
                    />
                </div>
            </div>

            {/* Tactical Guidance Panel */}
            <div className="w-80 space-y-4">
                {/* Live Guidance */}
                {tacticalGuidance && (
                    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#D4A017]" />
                            <h3 className="font-mono uppercase text-[#D4A017] font-bold">Live Tactical Guidance</h3>
                        </div>

                        {tacticalGuidance.nextMove && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-mono uppercase text-green-400">Recommended Next Move</h4>
                                <div className="bg-[#FAFAF8] dark:bg-[#0A0A0A] p-3 rounded border-l-4 border-green-400">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{tacticalGuidance.nextMove}</p>
                                </div>
                            </div>
                        )}

                        {tacticalGuidance.riskLevel && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-mono uppercase text-yellow-400">Risk Assessment</h4>
                                <div className={`bg-[#FAFAF8] dark:bg-[#0A0A0A] p-3 rounded border-l-4 ${
                                    tacticalGuidance.riskLevel === 'HIGH' ? 'border-red-400' :
                                    tacticalGuidance.riskLevel === 'MEDIUM' ? 'border-yellow-400' : 'border-green-400'
                                }`}>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{tacticalGuidance.riskLevel} - {tacticalGuidance.riskExplanation}</p>
                                </div>
                            </div>
                        )}

                        {tacticalGuidance.techniques && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-mono uppercase text-blue-400">Active Techniques</h4>
                                <div className="flex flex-wrap gap-1">
                                    {tacticalGuidance.techniques.map((technique: string, index: number) => (
                                        <span key={index} className="text-xs bg-blue-400/10 text-blue-400 px-2 py-1 rounded">
                                            {technique}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Goal Progress */}
                <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#D4A017]" />
                        <h3 className="font-mono uppercase text-[#D4A017] font-bold">Session Progress</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Goal Completion</span>
                            <span className="font-bold">{progressScore}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-[#333333] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#D4A017] transition-all duration-500"
                                style={{ width: `${progressScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* People Profiles */}
                <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#D4A017]" />
                        <h3 className="font-mono uppercase text-[#D4A017] font-bold">Person Context</h3>
                    </div>

                    <select
                        value={selectedPerson?.id || ''}
                        onChange={(e) => {
                            const person = peopleProfiles.find(p => p.id === e.target.value) || null;
                            setSelectedPerson(person);
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                    >
                        <option value="">No person selected</option>
                        {peopleProfiles.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    {loadingPeople && (
                        <p className="text-xs text-gray-500">Loading profiles...</p>
                    )}

                    {selectedPerson && (
                        <div className="bg-gray-50 dark:bg-[#0A0A0A] rounded p-2 space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="text-[#D4A017]">{selectedPerson.name}</span>
                                {selectedPerson.relationshipType && ` - ${selectedPerson.relationshipType}`}
                            </p>
                            {selectedPerson.keyTraitTags && selectedPerson.keyTraitTags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedPerson.keyTraitTags.map((tag, i) => (
                                        <span key={i} className="text-xs bg-[#D4A017]/10 text-[#D4A017] px-1.5 py-0.5 rounded">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 italic">
                                Their profile data will be included as context in your next message.
                            </p>
                        </div>
                    )}

                    {!loadingPeople && peopleProfiles.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            No profiles yet.{' '}
                            <Link href="/app/people" className="text-[#D4A017] hover:underline">
                                Add people in the Profiler section &rarr;
                            </Link>
                        </p>
                    )}
                </div>

                {/* Quick Tips */}
                <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-[#D4A017]" />
                        <h3 className="font-mono uppercase text-[#D4A017] font-bold">Quick Tips</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <p>• Be specific about your situation for better guidance</p>
                        <p>• Ask for exact scripts when you need them</p>
                        <p>• Describe the other person's behavior patterns</p>
                        <p>• Share what tactics you've already tried</p>
                    </div>
                </div>

                {/* Warnings */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h3 className="font-mono uppercase text-red-400 font-bold">Important</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm text-red-400">
                        <p>• Use influence ethically and responsibly</p>
                        <p>• Respect others' boundaries and autonomy</p>
                        <p>• Focus on win-win outcomes when possible</p>
                    </div>
                </div>
            </div>
        </div>
    );
}