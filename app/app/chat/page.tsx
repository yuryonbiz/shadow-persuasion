'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { GoalSelector } from '@/components/app/GoalSelector';
import { StrategicChat } from '@/components/app/StrategicChat';

interface Goal {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    examples: string[];
}

interface ChatSession {
  id: string;
  title: string;
  goal_title: string | null;
  session_type: string;
  created_at: string;
  updated_at: string;
  lastMessage: string | null;
  lastMessageRole: string | null;
  lastMessageAt: string | null;
}

export default function ChatListPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.sessions || []);
      }
    } catch (e) {
      console.error('Failed to fetch conversations:', e);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewGeneralChat = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat', session_type: 'general' }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/app/chat/${data.session.id}`);
      }
    } catch (e) {
      console.error('Failed to create chat session:', e);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/conversations?id=${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalSelector(false);
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
    setShowGoalSelector(false);
  };

  const handleBackToGoals = () => {
    setSelectedGoal(null);
    setShowGoalSelector(true);
  };

  // Strategic Chat Session
  if (selectedGoal) {
    return <StrategicChat goal={selectedGoal} onBack={handleBackToGoals} />;
  }

  // Goal Selection
  if (showGoalSelector) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </button>
        <GoalSelector onSelectGoal={handleSelectGoal} />
      </div>
    );
  }

  // Main Chat List
  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
              Strategic Communication Sessions
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGoalSelector(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#E8B030] transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New Strategic Session</span>
            </button>
            <button
              onClick={handleNewGeneralChat}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#333333] text-white rounded-lg font-semibold hover:bg-[#444444] transition-colors"
            >
              <span>New Chat</span>
            </button>
          </div>
      </header>
      
      {isLoadingConversations ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
        </div>
      ) : conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map(convo => (
            <Link href={`/app/chat/${convo.id}`} key={convo.id} className="block p-4 bg-[#1A1A1A] rounded-lg border border-[#333333] hover:border-[#D4A017] relative group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold truncate">{convo.title}</h2>
                      {convo.session_type === 'strategic' && (
                        <span className="text-xs px-2 py-0.5 bg-[#D4A017]/20 text-[#D4A017] rounded-full flex-shrink-0">Strategic</span>
                      )}
                    </div>
                    {convo.goal_title && (
                      <p className="text-xs text-[#D4A017] mt-0.5">{convo.goal_title}</p>
                    )}
                    {convo.lastMessage && (
                      <p className="text-sm text-gray-400 truncate mt-1">{convo.lastMessage}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{formatTimestamp(convo.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(convo.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                    title="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Strategic Session CTA */}
          <div
            onClick={() => setShowGoalSelector(true)}
            className="p-8 text-center rounded-lg border-2 border-dashed border-[#D4A017] hover:border-[#F4D03F] hover:bg-[#2A2520] transition-all cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="text-6xl">🎯</div>
              <div>
                <h3 className="text-xl font-bold text-[#D4A017] group-hover:text-[#F4D03F] transition-colors">
                  Start Your First Strategic Session
                </h3>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                  Get goal-focused coaching with specific tactics, exact scripts, and real-time guidance
                  for negotiations, influence, relationships, and more.
                </p>
              </div>
              <button className="bg-[#D4A017] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors">
                Choose Your Objective
              </button>
            </div>
          </div>

          {/* General Chat Option */}
          <div className="p-6 text-center rounded-lg border border-[#333333] bg-[#1A1A1A]">
            <p className="text-gray-400 mb-4">
              Or continue with the general-purpose chat for open-ended conversations
            </p>
            <button
              onClick={handleNewGeneralChat}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#333333] text-white rounded-lg font-semibold hover:bg-[#444444] transition-colors"
            >
              <span>Open General Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
