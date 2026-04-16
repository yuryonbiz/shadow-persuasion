'use client';

interface MidPageCTAProps {
  headline?: string;
}

export default function MidPageCTA({ headline = 'Ready to Start?' }: MidPageCTAProps) {
  return (
    <div className="flex justify-center px-6 py-12 md:py-16">
      <div className="max-w-2xl w-full bg-[#1A1A1A] rounded-2xl px-8 py-10 md:px-12 md:py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#F4ECD8] mb-6">
          {headline}
        </h2>

        <div className="mb-2">
          <span className="text-4xl md:text-5xl font-bold text-[#D4A843]">$99</span>
          <span className="text-lg text-[#F4ECD8]/70">/month</span>
        </div>

        <p className="text-sm text-[#F4ECD8]/50 mb-8">Cancel anytime</p>

        <a
          href="/login"
          className="inline-block bg-[#D4A843] hover:bg-[#C49A3A] text-[#1A1A1A] font-bold text-lg px-10 py-4 rounded-lg tracking-wide transition-colors duration-200"
        >
          START YOUR TRAINING
        </a>

        <p className="mt-6 text-sm text-[#F4ECD8]/40">
          Join 2,000+ members already training
        </p>
      </div>
    </div>
  );
}
