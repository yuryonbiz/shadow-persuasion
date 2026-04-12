'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const navItems = [
  { icon: '◈', label: 'Dashboard' },
  { icon: '◉', label: 'Analyze' },
  { icon: '⬡', label: 'Coach' },
  { icon: '⟐', label: 'Optimizer' },
  { icon: '◎', label: 'People' },
  { icon: '⬢', label: 'Training' },
  { icon: '◇', label: 'Field Ops' },
  { icon: '△', label: 'Techniques' },
  { icon: '◆', label: 'Score' },
];

const tabs = ['Dashboard', 'Analyze', 'Coach'] as const;
type Tab = (typeof tabs)[number];

const tabToNavIndex: Record<Tab, number> = {
  Dashboard: 0,
  Analyze: 1,
  Coach: 2,
};

// --- Screen Components ---

function DashboardScreen() {
  const circumference = 2 * Math.PI * 22;
  const progress = 73 / 100;
  return (
    <div className="flex gap-3 h-full">
      {/* Left column */}
      <div className="flex-1 space-y-2">
        {/* Score + Streak row */}
        <div className="flex gap-2">
          {/* Score ring */}
          <div className="bg-[#1A1A1A] rounded-md p-2 flex items-center gap-2 flex-1">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="#333" strokeWidth="3" />
              <circle
                cx="26"
                cy="26"
                r="22"
                fill="none"
                stroke="#D4A017"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
              />
              <text x="26" y="24" textAnchor="middle" fill="#D4A017" fontSize="14" fontWeight="bold">
                73
              </text>
              <text x="26" y="34" textAnchor="middle" fill="#888" fontSize="6">
                SPECIALIST
              </text>
            </svg>
            <div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">Persuasion Score</div>
              <div className="text-[11px] text-[#D4A017] font-bold">Rank: Specialist</div>
            </div>
          </div>
          {/* Streak */}
          <div className="bg-[#1A1A1A] rounded-md p-2 flex flex-col justify-center items-center min-w-[70px]">
            <div className="text-[16px]">🔥</div>
            <div className="text-[11px] text-white font-bold">12 days</div>
            <div className="text-[8px] text-gray-500 uppercase">Streak</div>
          </div>
        </div>

        {/* Today's mission */}
        <div className="bg-[#1A1A1A] rounded-md p-2 border-l-2 border-[#D4A017]">
          <div className="text-[8px] text-[#D4A017] uppercase tracking-wider mb-0.5">Today&apos;s Mission</div>
          <div className="text-[10px] text-white">Deploy a Pattern Interrupt</div>
          <div className="text-[8px] text-gray-500 mt-0.5">Use a disruption technique in a real conversation</div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <div className="bg-[#1A1A1A] rounded-md p-2 flex-1 text-center hover:bg-[#222] cursor-pointer transition-colors">
            <div className="text-[10px] text-[#D4A017]">◉</div>
            <div className="text-[9px] text-white">Analyze</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-md p-2 flex-1 text-center hover:bg-[#222] cursor-pointer transition-colors">
            <div className="text-[10px] text-[#D4A017]">⬡</div>
            <div className="text-[9px] text-white">Coach</div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="w-[120px] space-y-2">
        {/* Activity heatmap */}
        <div className="bg-[#1A1A1A] rounded-md p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">This Week</div>
          <div className="flex gap-1">
            {[0.8, 0.5, 1, 0.3, 0.9, 0.6, 0.2].map((v, i) => (
              <div
                key={i}
                className="w-[11px] h-[11px] rounded-sm"
                style={{ backgroundColor: `rgba(212, 160, 23, ${v})` }}
              />
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-[#1A1A1A] rounded-md p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Recent</div>
          <div className="space-y-1">
            {['Anchoring used', 'Coach session', 'Analysis done'].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#D4A017]" />
                <div className="text-[8px] text-gray-400">{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Level progress */}
        <div className="bg-[#1A1A1A] rounded-md p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Level Progress</div>
          <div className="w-full bg-[#333] rounded-full h-1.5">
            <div className="bg-[#D4A017] h-1.5 rounded-full" style={{ width: '73%' }} />
          </div>
          <div className="text-[8px] text-gray-500 mt-0.5">73 / 100 XP</div>
        </div>
      </div>
    </div>
  );
}

function AnalyzeScreen() {
  return (
    <div className="space-y-2 h-full">
      {/* Threat score */}
      <div className="bg-[#1A1A1A] rounded-md p-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[8px] text-gray-500 uppercase tracking-wider">Threat Assessment</div>
          <div className="text-[9px] text-red-400 font-bold">HIGH THREAT</div>
        </div>
        <div className="w-full bg-[#333] rounded-full h-2">
          <div className="bg-gradient-to-r from-yellow-500 to-red-500 h-2 rounded-full" style={{ width: '70%' }} />
        </div>
        <div className="text-[9px] text-white mt-1 font-bold">7 / 10 — Significant Manipulation Detected</div>
      </div>

      {/* Detected tactics */}
      <div className="flex gap-2">
        <div className="bg-[#1A1A1A] rounded-md p-2 flex-1 border-l-2 border-red-500">
          <div className="text-[8px] text-red-400 uppercase tracking-wider mb-0.5">Tactic Detected</div>
          <div className="text-[10px] text-white font-bold">Guilt Trip</div>
          <div className="text-[8px] text-gray-400 mt-0.5">&quot;After everything I&apos;ve done for you...&quot;</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <div className="text-[7px] text-red-400">Severity: High</div>
          </div>
        </div>
        <div className="bg-[#1A1A1A] rounded-md p-2 flex-1 border-l-2 border-orange-500">
          <div className="text-[8px] text-orange-400 uppercase tracking-wider mb-0.5">Tactic Detected</div>
          <div className="text-[10px] text-white font-bold">False Urgency</div>
          <div className="text-[8px] text-gray-400 mt-0.5">&quot;You need to decide right now&quot;</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <div className="text-[7px] text-orange-400">Severity: Medium</div>
          </div>
        </div>
      </div>

      {/* Counter-script */}
      <div className="bg-[#1A1A1A] rounded-md p-2 border-l-2 border-[#D4A017]">
        <div className="text-[8px] text-[#D4A017] uppercase tracking-wider mb-1">Recommended Counter-Script</div>
        <div className="text-[9px] text-gray-300 leading-relaxed">
          &quot;I appreciate your perspective. I need time to evaluate this properly — rushed decisions rarely serve either party well.&quot;
        </div>
        <div className="text-[9px] text-gray-300 leading-relaxed mt-1">
          &quot;Let&apos;s revisit this Thursday when we can both review the details.&quot;
        </div>
      </div>

      {/* Power dynamics */}
      <div className="bg-[#1A1A1A] rounded-md p-2">
        <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Power Dynamics</div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] text-blue-400 font-bold">You: 4</div>
          <div className="flex-1 h-1.5 bg-[#333] rounded-full relative">
            <div className="absolute left-0 top-0 h-1.5 rounded-full bg-blue-500" style={{ width: '40%' }} />
            <div className="absolute right-0 top-0 h-1.5 rounded-full bg-red-500" style={{ width: '70%' }} />
          </div>
          <div className="text-[9px] text-red-400 font-bold">Them: 7</div>
        </div>
      </div>
    </div>
  );
}

function CoachScreen() {
  return (
    <div className="flex gap-2 h-full">
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-[#1A1A1A] rounded-md p-2 flex-1 space-y-2">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-[#2A2A2A] rounded-lg rounded-br-sm px-2 py-1.5 max-w-[85%]">
              <div className="text-[9px] text-gray-300">My boss rejected my raise request after I exceeded all targets this quarter. How should I respond?</div>
            </div>
          </div>

          {/* AI response */}
          <div className="flex justify-start">
            <div className="bg-[#1a1508] border border-[#D4A017]/30 rounded-lg rounded-bl-sm px-2 py-1.5 max-w-[90%]">
              <div className="text-[8px] text-[#D4A017] mb-0.5 font-bold">SHADOW COACH</div>
              <div className="text-[9px] text-gray-300 leading-relaxed">
                Here&apos;s your counter-strategy. First, don&apos;t react emotionally — that&apos;s what they expect. Deploy <span className="text-[#D4A017]">Frame Control</span>: reposition the conversation from &quot;asking for a raise&quot; to &quot;discussing my market value.&quot;
              </div>
            </div>
          </div>

          {/* AI follow-up */}
          <div className="flex justify-start">
            <div className="bg-[#1a1508] border border-[#D4A017]/30 rounded-lg rounded-bl-sm px-2 py-1.5 max-w-[90%]">
              <div className="text-[9px] text-gray-300 leading-relaxed">
                Say: <span className="text-[#D4A017] italic">&quot;I understand. Help me understand what benchmarks would warrant a compensation review?&quot;</span> This shifts power back to you.
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="bg-[#1A1A1A] rounded-md mt-1 px-2 py-1.5 flex items-center gap-1">
          <div className="text-[9px] text-gray-600 flex-1">Type your situation...</div>
          <div className="bg-[#D4A017] rounded px-1.5 py-0.5 text-[8px] text-black font-bold">Send</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[110px] space-y-2">
        <div className="bg-[#1A1A1A] rounded-md p-2">
          <div className="text-[8px] text-[#D4A017] uppercase tracking-wider mb-1">Active Technique</div>
          <div className="text-[10px] text-white font-bold">Frame Control</div>
          <div className="text-[8px] text-gray-500 mt-0.5">Redefine the terms of the negotiation</div>
          <div className="w-full bg-[#333] rounded-full h-1 mt-1.5">
            <div className="bg-[#D4A017] h-1 rounded-full" style={{ width: '65%' }} />
          </div>
          <div className="text-[7px] text-gray-500 mt-0.5">Mastery: 65%</div>
        </div>

        <div className="bg-[#1A1A1A] rounded-md p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Also Consider</div>
          <div className="space-y-1">
            {['Anchoring', 'Strategic Silence', 'Social Proof'].map((t, i) => (
              <div key={i} className="text-[8px] text-gray-400 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#D4A017]/50" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-md p-2">
          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Session Stats</div>
          <div className="text-[8px] text-gray-400">Techniques: 3</div>
          <div className="text-[8px] text-gray-400">Scripts: 2</div>
          <div className="text-[8px] text-gray-400">Duration: 4m</div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function AppPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const cycleTab = useCallback(() => {
    setActiveTab((prev) => {
      const idx = tabs.indexOf(prev);
      return tabs[(idx + 1) % tabs.length];
    });
  }, []);

  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(cycleTab, 4000);
    return () => clearInterval(interval);
  }, [isAutoCycling, cycleTab]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsAutoCycling(false);
  };

  const screens: Record<Tab, React.ReactNode> = {
    Dashboard: <DashboardScreen />,
    Analyze: <AnalyzeScreen />,
    Coach: <CoachScreen />,
  };

  return (
    <section ref={ref} className="bg-[#F4ECD8] py-20 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-5xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.3em] text-[#8B7355] uppercase mb-3">[ Section VII ]</div>
          <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-4">YOUR STRATEGIC COMMAND CENTER</h2>
          <div className="w-24 h-px bg-[#D4A017] mx-auto mb-4" />
          <p className="text-sm md:text-base text-[#5C4A32] max-w-2xl mx-auto leading-relaxed">
            Real-time AI analysis. Personalized scripts. Technique mastery tracking. All in one place.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-1.5 text-xs rounded-t-md transition-all ${
                activeTab === tab
                  ? 'bg-[#0A0A0A] text-[#D4A017] border-t border-x border-[#333]'
                  : 'bg-[#1A1A1A] text-gray-500 hover:text-gray-300 border-t border-x border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Browser frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="rounded-xl overflow-hidden shadow-2xl border border-[#333]"
        >
          {/* Title bar */}
          <div className="bg-[#1E1E1E] px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[11px] text-gray-400">Shadow Persuasion — Operator Console</span>
            </div>
            <div className="w-[54px]" /> {/* Spacer to center title */}
          </div>

          {/* URL bar */}
          <div className="bg-[#151515] px-4 py-1.5 border-b border-[#2A2A2A]">
            <div className="bg-[#0A0A0A] rounded-md px-3 py-1 flex items-center gap-2 max-w-md mx-auto">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="8" height="8" rx="1" stroke="#555" strokeWidth="1" />
                <path d="M3 5L4.5 6.5L7 3.5" stroke="#27C93F" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] text-gray-500">app.shadowpersuasion.com</span>
            </div>
          </div>

          {/* App content */}
          <div className="bg-[#0A0A0A] flex" style={{ height: '340px' }}>
            {/* Sidebar */}
            <div className="w-[140px] md:w-[160px] bg-[#0F0F0F] border-r border-[#1A1A1A] flex flex-col py-2 shrink-0">
              {/* Logo */}
              <div className="px-3 mb-3">
                <div className="text-[11px] font-bold text-[#D4A017] tracking-wider">SHADOW PERSUASION</div>
                <div className="text-[7px] text-gray-600 uppercase tracking-widest"></div>
              </div>

              {/* Nav items */}
              <div className="flex-1 space-y-0.5 px-1.5">
                {navItems.map((item, i) => {
                  const isActive = i === tabToNavIndex[activeTab];
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md text-[9px] transition-colors cursor-default ${
                        isActive
                          ? 'bg-[#D4A017]/10 text-[#D4A017]'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      <span className="text-[10px] w-4 text-center">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#D4A017]" />}
                    </div>
                  );
                })}
              </div>

              {/* User avatar */}
              <div className="px-3 pt-2 mt-auto border-t border-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#D4A017]/20 flex items-center justify-center text-[8px] text-[#D4A017]">
                    OP
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-400">Operator</div>
                    <div className="text-[7px] text-gray-600">Level 5</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-3 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="h-full"
                >
                  {screens[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Bottom caption */}
        <div className="text-center mt-6">
          <p className="text-[11px] text-[#8B7355] tracking-wider uppercase">
            Live interactive preview — actual application interface
          </p>
        </div>
      </motion.div>
    </section>
  );
}
