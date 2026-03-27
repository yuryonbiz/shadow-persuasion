'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

// Mock data for now
const conversations = [
  // { id: '1', title: 'Negotiating a pay rise', lastMessage: '...', timestamp: '2h ago'},
  // { id: '2', title: 'Handling a difficult client', lastMessage: '...', timestamp: '1d ago'},
];

export default function ChatListPage() {
  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
              AI Coach Sessions
          </h1>
          <Link href="/app/chat/new" className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#E8B030] transition-colors">
            <PlusCircle className="h-5 w-5" />
            <span>New Conversation</span>
          </Link>
      </header>
      
      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map(convo => (
            <Link href={`/app/chat/${convo.id}`} key={convo.id} className="block p-4 bg-[#1A1A1A] rounded-lg border border-[#333333] hover:border-[#D4A017]">
                <h2 className="font-bold">{convo.title}</h2>
                <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-2">{convo.timestamp}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center rounded-lg border border-dashed border-[#333333]">
           <p className="text-gray-400">No conversations yet. Start one to begin your training.</p>
        </div>
      )}
    </div>
  );
}
