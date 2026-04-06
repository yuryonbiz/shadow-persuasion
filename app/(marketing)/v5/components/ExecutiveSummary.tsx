'use client';

const Redacted = ({ children }) => (
  <span className="bg-black text-black inline-block px-1 transition-opacity duration-150 hover:opacity-80 cursor-pointer">{children}</span>
);

const Highlight = ({ children }) => (
  <span style={{ background: 'rgba(255, 241, 118, 0.3)' }}>{children}</span>
);

const ExecutiveSummary = () => {
  return (
    <section>
      <div className="border-b-2 border-t-2 border-black py-1 mb-12 text-sm text-center">
        <p>PAGE 1 of 12 | CLASSIFICATION: PUBLIC ACCESS | DATE: MARCH 2026</p>
      </div>
      <div className="relative">
        <h2 className="text-4xl font-bold uppercase tracking-wider mb-8 text-center">Executive Summary</h2>
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
            Project SHADOW PERSUASION is a comprehensive strategic communication training system designed to empower individuals with advanced psychological influence techniques for <Highlight>positive personal and professional outcomes</Highlight>. This document outlines an AI-powered platform that provides students with the communication skills traditionally reserved for executives, negotiators, and influence professionals.
          </p>
          <p>
            The core of the system is the Strategic Communication Console, an intelligent interface that provides real-time coaching and analysis. Users can <Redacted>upload conversation screenshots</Redacted> for psychological analysis, practice scenarios in risk-free environments, and receive personalized guidance for their specific goals. The system leverages proven psychology principles from <Highlight>behavioral science, negotiation theory, and interpersonal communication research</Highlight>.
          </p>
          <p>
            The objective is to democratize advanced communication skills for legitimate purposes: career advancement, relationship building, business success, and personal growth. Beta testing shows participants achieve <Highlight>measurable improvements in salary negotiations, relationship satisfaction, and professional influence</Highlight> within 90 days. The system is designed for ethical application, with built-in guidance to ensure win-win outcomes in all interactions.
          </p>
          <div className="bg-green-100 border-2 border-green-600 p-4 mt-6">
            <h3 className="font-bold text-green-800 mb-2">PRACTICAL APPLICATIONS:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
              <div>• Salary negotiations and promotion requests</div>
              <div>• Dating and relationship communication</div>
              <div>• Sales and business development</div>
              <div>• Leadership and team management</div>
              <div>• Conflict resolution and difficult conversations</div>
              <div>• Social confidence and networking</div>
            </div>
          </div>
        </div>
        <div className="mt-6 ml-8 text-blue-700 italic transform -rotate-2 relative">
          <p className="text-lg">↳ Note: Ethical influence creates win-win outcomes for all parties involved.</p>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;