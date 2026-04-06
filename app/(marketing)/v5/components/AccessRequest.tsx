'use client';

const CheckListItem = ({ children }) => (
  <li className="flex items-start">
    <span className="font-mono text-2xl mr-3">[✓]</span>
    <span>{children}</span>
  </li>
);

const AccessRequest = () => {
  return (
    <section className="border-4 border-black p-8 md:p-12 relative">
      <h2 className="text-3xl font-bold uppercase tracking-wider mb-6 text-center">FORM SP-2026-ACCESS: REQUEST FOR UNREDACTED ACCESS</h2>
      <div className="text-center mb-8">
        <p className="text-5xl font-bold"><span className="line-through text-gray-500 mr-4">$97</span>$47/month</p>
        <p className="text-sm">Access protocol activated. Clearance fee adjusted for immediate deployment.</p>
      </div>
      <div className="max-w-md mx-auto">
        <ul className="space-y-3 text-lg mb-8">
          <CheckListItem>Full Access to AI Operator Console</CheckListItem>
          <CheckListItem>Visual Intelligence & Profiling Units</CheckListItem>
          <CheckListItem>Negotiation & Scripting Systems</CheckListItem>
          <CheckListItem>Continuous Dark Psychology Engine Updates</CheckListItem>
          <CheckListItem>Restricted Operator Community Access</CheckListItem>
        </ul>
        <button className="w-full bg-black text-white py-4 px-8 text-xl font-bold hover:bg-gray-800 transition-colors duration-300">
          SUBMIT ACCESS REQUEST
        </button>
      </div>
      <p className="text-center mt-8 text-xs text-gray-600">This document is the property of Shadow Persuasion. Unauthorized reproduction is prohibited.</p>
      <div className="border-t-2 border-black py-1 mt-12 text-sm text-center">
        <p>Page 12 of 12 | END OF DOCUMENT</p>
      </div>
    </section>
  );
};

export default AccessRequest;
