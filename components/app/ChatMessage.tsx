'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

type Source = { book: string; author: string; technique: string; similarity: number };

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  sources?: Source[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold text-gray-800 dark:text-[#E8E8E0] mt-4 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-gray-800 dark:text-[#E8E8E0] mt-4 mb-1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-[#D4A017] mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 dark:text-[#E8E8E0] font-semibold">$1</strong>')
    .replace(/\[TECHNIQUE: (.*?)\]/g, '<span class="inline-block bg-[#D4A017] text-[#0A0A0A] px-2 py-0.5 rounded text-xs font-mono font-bold mt-1 mb-1">$1</span>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017] font-mono text-sm">$1.</span><span class="text-gray-600 dark:text-[#ccc]">$2</span></div>')
    .replace(/^[-•] (.*$)/gm, '<div class="flex gap-2 ml-2 my-0.5"><span class="text-[#D4A017]">→</span><span class="text-gray-600 dark:text-[#ccc]">$1</span></div>')
    .replace(/\(Source: &quot;(.*?)&quot; by (.*?)\)/g, '<span class="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full cursor-help" title="From: $1 by $2">📚 $1</span>')
    .replace(/\n\n/g, '<div class="h-3"></div>')
    .replace(/\n/g, '<br/>');
}

export function ChatMessage({ role, content, isLoading, sources }: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = role === 'user';
  const formattedContent = parseMarkdown(content);
  
  // Deduplicate sources by book+technique
  const uniqueSources = sources?.filter((s, i, arr) => 
    arr.findIndex(x => x.book === s.book && x.technique === s.technique) === i
  );
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl rounded-lg ${
          isUser
            ? 'p-4 bg-[#D4A017] text-[#0A0A0A]'
            : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333]'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-mono uppercase text-[#D4A017] tracking-wider">Handler</span>
            {uniqueSources && uniqueSources.length > 0 && (
              <button 
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <BookOpen className="h-3 w-3" />
                {uniqueSources.length} source{uniqueSources.length > 1 ? 's' : ''} used
                {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        {/* Sources panel */}
        {!isUser && showSources && uniqueSources && uniqueSources.length > 0 && (
          <div className="mx-4 mb-2 p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-blue-500/20">
            <div className="text-xs font-mono text-blue-400 uppercase mb-2">Knowledge Base Sources</div>
            <div className="space-y-1.5">
              {uniqueSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-800 dark:text-[#E8E8E0]">{source.technique}</span>
                    <span className="text-gray-500 ml-2">from "{source.book}" by {source.author}</span>
                  </div>
                  <span className="text-blue-400 font-mono ml-3">{source.similarity}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pb-3">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          ) : (
            <div 
              className="text-sm text-gray-600 dark:text-[#ccc] leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: formattedContent }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
