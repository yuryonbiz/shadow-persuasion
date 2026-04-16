'use client';

import {
  BookOpen,
  Brain,
  Layers,
  Activity,
} from 'lucide-react';

const Redacted = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-black text-black inline-block px-1 transition-opacity duration-150 hover:opacity-80 cursor-pointer">
    {children}
  </span>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span style={{ background: 'rgba(200, 168, 78, 0.25)' }}>{children}</span>
);

const stats = [
  {
    icon: BookOpen,
    value: '700+',
    label: 'Influence Techniques You Can Practice & Deploy',
  },
  {
    icon: Brain,
    value: '10',
    label: 'Training Modules',
  },
  {
    icon: Layers,
    value: '24/7',
    label: 'AI Strategic Coach Access',
  },
  {
    icon: Activity,
    value: '<3 min',
    label: 'From Screenshot to Counter-Script',
  },
];

const paragraphs = [
  (
    <>
      Every day, you walk into conversations where the other person has more leverage than you. Your boss controls your salary. Your clients control the deal. Even in personal relationships, the person who understands psychology better holds the cards.
    </>
  ),
  (
    <>
      You replay the conversation in your head and think of what you <Highlight>SHOULD</Highlight> have said. You watch less qualified people get promoted because they know how to play the game. You lose deals to competitors who aren&apos;t better, just better at framing. You let boundaries get crossed because you didn&apos;t know how to push back without blowing things up.{' '}
      <Highlight>Every one of these moments has a cost, and it compounds.</Highlight>
    </>
  ),
  (
    <>
      Shadow Persuasion changes that. Upload a screenshot and know exactly what they&apos;re trying to pull on you, and what to say back. Get word-for-word scripts before your next negotiation. Practice high-stakes conversations with AI before the real thing.{' '}
      <Highlight>Stop leaving leverage on the table.</Highlight>
    </>
  ),
  (
    <>
      Members report <Highlight>$5,000 to $50,000+ salary increases</Highlight> after their first negotiation using the system. Relationship satisfaction scores improve within 30 days. The difference isn&apos;t talent. It&apos;s having an AI that decodes what people really mean and tells you exactly what to say back.
    </>
  ),
];

const ExecutiveSummary = () => {
  return (
    <section>
      {/* Header bar */}
      <div className="border-b-2 border-t-2 border-[#5C3A1E] py-1 mb-12 text-sm text-center text-[#6B5B3E] tracking-wide">
        <p>CLASSIFICATION: PUBLIC ACCESS | DATE: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
      </div>

      <div className="relative">
        <h2 className="text-4xl font-bold uppercase tracking-wider mb-10 text-center text-[#2A1F0E]">
          Executive Summary
        </h2>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* Left column — text */}
          <div className="flex-1 space-y-6 text-lg leading-relaxed text-[#3B2E1A]">
            {paragraphs.map((content, i) => (
              <p key={i}>
                {content}
              </p>
            ))}
          </div>

          {/* Right column — Intelligence Brief */}
          <div className="lg:w-[340px] flex-shrink-0">
            <div className="border-2 border-[#A0884A] bg-[#F4ECD8]/50 p-6 sticky top-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#5C3A1E] border-b border-[#A0884A]/50 pb-3 mb-5">
                Intelligence Brief
              </h3>

              <div className="space-y-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-start gap-3 p-3 border border-[#A0884A]/30 bg-[#F4ECD8]/40"
                    >
                      <div className="mt-0.5 text-[#8B6914]">
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#5C3A1E] leading-tight">
                          {stat.value}
                        </p>
                        <p className="text-sm text-[#7A6543] leading-snug">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-[#A0884A]/40 text-xs text-[#7A6543] italic">
                Ethical influence creates win-win outcomes for all parties
                involved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;
