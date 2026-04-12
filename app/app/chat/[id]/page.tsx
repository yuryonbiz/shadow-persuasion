'use client';


import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { ChatInput } from '@/components/app/ChatInput';
import { ChatMessage } from '@/components/app/ChatMessage';

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


  const handleSend = async (input: string, image?: { file: File; preview: string; base64: string }) => {
    let messageContent = input;

    // If image attached, extract text first
    if (image?.file) {
      try {
        const fd = new FormData();
        fd.append('image', image.file);
        const extractRes = await fetch('/api/user/voice-profile/extract', { method: 'POST', body: fd });
        if (extractRes.ok) {
          const extractData = await extractRes.json();
          if (extractData.extractedText) {
            messageContent = `${input}\n\n[Extracted from attached image: "${extractData.extractedText}"]`;
          }
        }
      } catch {}
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
    const displayMessage: Message = { id: Date.now().toString(), role: 'user', content: image ? `📷 ${input || '(image attached)'}` : input };
    setMessages(prev => [...prev, displayMessage]);
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

                  // Skip SSE comments (e.g., ": OPENROUTER PROCESSING")
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
                          // Skip non-JSON data
                      }
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
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-[#D4A017]/10 flex items-center justify-center mb-4">
              <Send className="h-7 w-7 text-[#D4A017]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start a Conversation</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Describe your situation and get tactical advice with specific scripts, techniques, and strategies — all grounded in expert psychology.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {['How do I negotiate a raise?', 'Help me handle a difficult coworker', 'I need to close a hesitant client'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-full text-gray-600 dark:text-gray-400 hover:border-[#D4A017] hover:text-[#D4A017] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
             <ChatMessage role="assistant" content="Thinking..." isLoading={true} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-[#333333]">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
