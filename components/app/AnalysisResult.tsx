'use client';

import { Copy } from 'lucide-react';
import type { Analysis } from '@/app/app/decode/page';

interface AnalysisResultProps {
  analysis: Analysis;
  imagePreview: string;
}

export function AnalysisResult({ analysis, imagePreview }: AnalysisResultProps) {
    if (!analysis) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Preview */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
                <img src={imagePreview} alt="Conversation screenshot" className="rounded-md w-full" />
            </div>

            {/* Analysis Report */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333] space-y-4">
               <h2 className="font-mono text-lg uppercase text-[#D4A017]">Analysis Report</h2>
               <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis.analysis }} />
               <div>
                  <h3 className="font-mono text-md uppercase text-[#D4A017] mb-2">Techniques Identified</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.techniques_identified.map((technique) => (
                      <span key={technique} className="bg-[#D4A017] text-[#0A0A0A] text-xs font-mono uppercase px-2 py-1 rounded-full">{technique}</span>
                    ))}
                  </div>
               </div>
            </div>

            {/* Suggested Responses */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1A1A1A] p-4 rounded-lg border border-gray-200 dark:border-[#333333] space-y-4">
                <h2 className="font-mono text-lg uppercase text-[#D4A017]">Suggested Responses</h2>
                {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-[#222222] p-3 rounded-md relative group">
                        <p className="text-sm">{suggestion}</p>
                        <button 
                         onClick={() => handleCopy(suggestion)}
                         className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-[#333333] rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
