'use client';


import { useEffect, useRef, useState } from 'react';
import { ChatInput } from '@/components/app/ChatInput';
import { ChatMessage } from '@/components/app/ChatMessage';

// This would come from a database in a real app
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // A mock for fetching initial messages (if any)
  useEffect(() => {
    if (params.id !== 'new') {
        // Fetch existing messages for params.id
    }
  }, [params.id]);


  const handleSend = async (input: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    if (!response.body) {
        setIsLoading(false);
        // Handle error state
        return;
    }
    
    setMessages(prev => [...prev, { id: 'assistant-placeholder', role: 'assistant', content: '' }]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let done = false;
    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'assistant') {
                lastMessage.content += chunk;
                return [...prev.slice(0, -1), lastMessage];
            }
            return prev;
        });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && messages[messages.length-1].role === 'user' && (
             <ChatMessage role="assistant" content="Thinking..." isLoading={true} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#333333]">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
