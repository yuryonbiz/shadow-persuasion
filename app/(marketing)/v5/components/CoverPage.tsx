'use client';

import { ArrowRight } from 'lucide-react';

const CoverPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-8 overflow-hidden">
      <div className="absolute top-8 right-8 z-10">
        <p className="text-red-700 text-3xl font-bold border-4 border-red-700 p-2 transform -rotate-12 opacity-60 origin-center scale-110">CLASSIFIED</p>
        <p className="text-green-700 text-3xl font-bold border-4 border-green-700 p-2 transform rotate-12 origin-center absolute top-4 -left-4 scale-125">DECLASSIFIED</p>
      </div>

      <div className="z-0">
        <p className="text-sm uppercase tracking-widest">DOC-SC-2026-001 // PUBLIC ACCESS</p>
        <h1 className="text-6xl md:text-8xl font-bold my-4">PROJECT: SHADOW PERSUASION</h1>
        <p className="text-xl md:text-2xl text-gray-800">Advanced Strategic Communication Training for Career Success, Better Relationships & Personal Growth</p>

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div className="bg-blue-100 border-2 border-blue-600 p-4">
              <p className="font-bold text-blue-800">CAREER ADVANCEMENT</p>
              <p className="text-sm text-blue-700">Salary negotiations, promotions, leadership presence</p>
            </div>
            <div className="bg-green-100 border-2 border-green-600 p-4">
              <p className="font-bold text-green-800">RELATIONSHIP SUCCESS</p>
              <p className="text-sm text-green-700">Dating, marriage, family communication</p>
            </div>
            <div className="bg-purple-100 border-2 border-purple-600 p-4">
              <p className="font-bold text-purple-800">BUSINESS GROWTH</p>
              <p className="text-sm text-purple-700">Sales, networking, client relationships</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-lg">
          <p>CLASSIFICATION: Strategic Communication Psychology</p>
          <p>PURPOSE: Ethical Influence for Positive Outcomes</p>
        </div>

        <div className="flex items-center justify-center space-x-3 mt-8">
          <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-2xl font-bold text-black">✓</div>
          <span>I commit to using these techniques ethically and responsibly</span>
        </div>

        <button className="mt-8 bg-black text-white py-3 px-8 text-lg font-bold flex items-center justify-center mx-auto hover:bg-gray-800 transition-colors duration-300">
          BEGIN TRAINING PROGRAM <ArrowRight className="ml-2" />
        </button>

        <div className="mt-6 text-sm text-gray-600 max-w-2xl mx-auto">
          <p>Master the psychology of persuasion for career advancement, stronger relationships, and personal success. 
          Ethical influence training based on proven psychological principles.</p>
        </div>
      </div>

      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-radial-gradient from-yellow-800/20 to-transparent rounded-full opacity-30"></div>
    </div>
  );
};

export default CoverPage;