'use client';


import { useEffect, useRef, useState } from 'react';
import { ChatInput } from '@/components/app/ChatInput';
import { ChatMessage } from '@/components/app/ChatMessage';

// This would come from a database in a real app
type Source = { book: string; author: string; technique: string; similarity: number };
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
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
  
  const [sessionId, setSessionId] = useState<string | null>(params.id !== 'new' ? params.id : null);

  // Load existing messages from DB
  useEffect(() => {
    if (params.id !== 'new') {
      fetch(`/api/conversations/messages?session_id=${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                sources: m.metadata?.sources || undefined,
              }))
            );
          }
        })
        .catch(e => console.error('Failed to load messages:', e));
    }
  }, [params.id]);


  const handleSend = async (input: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, userMessage], session_id: sessionId }),
      });

      // Track session id from response for new chats
      const returnedSessionId = response.headers.get('X-Session-Id');
      if (returnedSessionId && !sessionId) {
        setSessionId(returnedSessionId);
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
                          // If it's not JSON, treat as plain content
                          if (!data.includes('{"id":') && !data.includes('"object":"chat.completion.chunk"')) {
                              fullContent += data;
                          }
                      }
                  } else if (!trimmed.includes('{"id":') && !trimmed.includes('"object":"chat.completion.chunk"')) {
                      // Plain text content
                      fullContent += trimmed + '\n';
                  }
              }
              
              // Update UI with accumulated content (excluding sources)
              const displayContent = fullContent.replace(/\n\n<!--SOURCES:.*?-->/, '');
              
              setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...lastMessage, content: displayContent }];
                  }
                  return prev;
              });
          }
      }
      
      // Parse sources from the end of stream
      const sourcesMatch = fullContent.match(/<!--SOURCES:(.*?)-->/);
      if (sourcesMatch) {
          try {
              const sources = JSON.parse(sourcesMatch[1]);
              const displayContent = fullContent.replace(/\n\n<!--SOURCES:.*?-->/, '');
              setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...lastMessage, content: displayContent, sources }];
                  }
                  return prev;
              });
          } catch (e) {
              console.error('Error parsing sources:', e);
          }
      }
      
    } catch (error) {
        console.error('Chat API error:', error);
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} />
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
