// DEPRECATED: Use /api/scenarios/list instead. This file is kept as a fallback reference only.
// All scenario data now lives in the Supabase `scenarios` table.
// See supabase/migrations/005_dynamic_scenarios.sql for the schema.

export type Scenario = {
  id: string;
  title: string;
  category: 'Career' | 'Relationships' | 'Sales' | 'Social' | 'Defense';
  difficulty: 1 | 2 | 3;
  description: string;
  objective: string;
  techniques: string[];
};

export const scenarios: Scenario[] = [
    // Career
    { id: 'negotiate-raise', title: 'Negotiate a Raise', category: 'Career', difficulty: 2, description: "You've been underpaid for 6 months. Deploy the right frame.", objective: "Secure a salary increase of at least 15%.", techniques: ['Anchoring', 'Frame Control', 'The Takeaway'] },
    { id: 'handle-boss', title: 'Handle a Difficult Boss', category: 'Career', difficulty: 3, description: "They're passive-aggressive and undermining you. Time to reframe.", objective: "Neutralize their behavior and establish clear boundaries.", techniques: ['Labeling', 'Reframing', 'Pattern Interruption'] },
    { id: 'ace-interview', title: 'Ace the Interview', category: 'Career', difficulty: 1, description: "Turn the power dynamic in your favor from minute one.", objective: "Position yourself as the prize, not a supplicant.", techniques: ['Authority Positioning', 'Frame Control', 'Tactical Empathy'] },
    // Relationships
    { id: 'first-date', title: 'The First Date', category: 'Relationships', difficulty: 1, description: "Establish attraction and intrigue without being obvious.", objective: "Create a memorable impression that makes them want a second date.", techniques: ['Mirroring', 'Strategic Vulnerability', 'The Void Pull'] },
    { id: 'set-boundaries', title: 'Set Boundaries', category: 'Relationships', difficulty: 2, description: "They keep pushing. Deploy the line they can't cross.", objective: "Clearly define a boundary and ensure it's respected.", techniques: ['Frame Control', 'Commitment & Consistency', 'The Takeaway'] },
    { id: 'win-trust', title: 'Win Back Trust', category: 'Relationships', difficulty: 3, description: "You messed up. Rebuild without groveling.", objective: "Demonstrate genuine remorse and create a path to reconciliation.", techniques: ['Tactical Empathy', 'The Accusation Audit', 'Commitment & Consistency'] },
    // Sales
    { id: 'close-client', title: 'Close the Reluctant Client', category: 'Sales', difficulty: 2, description: "They want to 'think about it'. Create urgency without pressure.", objective: "Get a decision (ideally a 'yes') on the call.", techniques: ['Scarcity Frame', 'Social Proof', 'The Takeaway'] },
    { id: 'handle-objection', title: 'Handle Price Objections', category: 'Sales', difficulty: 2, description: "They say it's too expensive. Reframe the value.", objective: "Turn the price objection into a reason to buy.", techniques: ['Reframing', 'The Contrast Principle', 'Anchoring'] },
    { id: 'cold-outreach', title: 'Cold Outreach', category: 'Sales', difficulty: 1, description: "First contact. Open a door they didn't know existed.", objective: "Get a positive response and book a meeting.", techniques: ['Pattern Interruption', 'Reciprocity', 'Labeling'] },
    // Social
    { id: 'command-room', title: 'Command a Room', category: 'Social', difficulty: 2, description: "Walk in and own it. Subtle authority signals.", objective: "Become the focal point of the room without being loud.", techniques: ['Authority Positioning', 'Frame Control', 'Social Proof'] },
    { id: 'handle-confrontation', title: 'Handle Confrontation', category: 'Social', difficulty: 3, description: "Someone's challenging you publicly. Neutralize without escalating.", objective: "Defuse the situation while maintaining your status.", techniques: ['Labeling', 'Reframing', 'The Void Pull'] },
    { id: 'build-rapport', title: 'Build Instant Rapport', category: 'Social', difficulty: 1, description: "Make them feel like they've known you forever. In 5 minutes.", objective: "Establish a strong connection quickly.", techniques: ['Mirroring', 'Tactical Empathy', 'Strategic Vulnerability'] },
    // Defense
    { id: 'spot-manipulator', title: 'Spot the Manipulator', category: 'Defense', difficulty: 2, description: "They're using tactics on YOU. Identify and counter.", objective: "Recognize manipulation attempts and disarm them.", techniques: ['Labeling', 'Pattern Interruption', 'Frame Control'] },
    { id: 'counter-gaslighting', title: 'Counter Gaslighting', category: 'Defense', difficulty: 3, description: "They're rewriting reality. Ground yourself and expose it.", objective: "Re-assert reality and protect your sanity.", techniques: ['Frame Control', 'The Accusation Audit', 'Commitment & Consistency'] },
    { id: 'exit-toxic', title: 'Exit a Toxic Dynamic', category: 'Defense', difficulty: 3, description: "Leave on your terms with your power intact.", objective: "Disengage from a toxic relationship without getting drawn back in.", techniques: ['The Takeaway', 'Frame Control', 'Pattern Interruption'] },
];
