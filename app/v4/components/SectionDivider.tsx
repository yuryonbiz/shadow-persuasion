
'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

type SectionDividerProps = {
  text: string;
};

const SectionDivider: React.FC<SectionDividerProps> = ({ text }) => {
  return (
    <div className="relative -mx-6 md:-mx-12 my-12 md:my-16">
      <div className="bg-[#1A1A1A] w-full h-[60px] flex items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C0392B]"></div>
        <div className="flex items-center justify-center gap-4 text-[#D4A017] font-mono uppercase tracking-widest text-sm md:text-base">
          <ShieldCheck className="w-5 h-5 text-amber-500 opacity-50" />
          <span>{text}</span>
          <ShieldCheck className="w-5 h-5 text-amber-500 opacity-50" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C0392B]"></div>
      </div>
    </div>
  );
};

export default SectionDivider;
