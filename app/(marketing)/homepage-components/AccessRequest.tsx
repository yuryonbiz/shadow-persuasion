'use client';

const CheckListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <span className="font-mono text-2xl mr-3">[&#10003;]</span>
    <span>{children}</span>
  </li>
);

const AccessRequest = () => {
  return (
    <section className="border-4 border-black p-8 md:p-12 relative">
      <h2 className="text-3xl font-bold uppercase tracking-wider mb-6 text-center">Start Your Training Today</h2>
      <div className="text-center mb-8">
        <p className="text-5xl font-bold">$99/month</p>
        <p className="text-sm">That&apos;s less than $3.30/day for an AI communication coach available 24/7</p>
      </div>
      <div className="max-w-md mx-auto">
        <ul className="space-y-3 text-lg mb-8">
          <CheckListItem>AI Strategic Coach &amp; Conversation Analyzer</CheckListItem>
          <CheckListItem>50+ Influence Techniques with Practice Mode</CheckListItem>
          <CheckListItem>Training Arena, Field Ops &amp; Daily Missions</CheckListItem>
          <CheckListItem>Message Optimizer &amp; Quick-Fire Mode</CheckListItem>
          <CheckListItem>People Profiles, Persuasion Score &amp; Voice Profile</CheckListItem>
        </ul>
        <button className="w-full bg-black text-white py-4 px-8 text-xl font-bold hover:bg-gray-800 transition-colors duration-300">
          START TRAINING NOW
        </button>
      </div>
      <p className="text-center mt-8 text-xs text-gray-600">Cancel anytime. No contracts. Results in your first week or your money back.</p>
      <div className="border-t-2 border-black py-1 mt-12 text-sm text-center">
        <p>Page 12 of 12 | END OF DOCUMENT</p>
      </div>
    </section>
  );
};

export default AccessRequest;
