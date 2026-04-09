CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  description TEXT NOT NULL,
  objective TEXT NOT NULL,
  techniques TEXT[] DEFAULT '{}',
  is_generated BOOLEAN DEFAULT false,
  source_books TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);

-- Seed with the existing 15 scenarios from lib/scenarios.ts so nothing breaks
INSERT INTO scenarios (id, title, category, difficulty, description, objective, techniques) VALUES
('negotiate-raise', 'Negotiate a Raise', 'Career', 2, 'You believe you deserve a raise but your manager hasn''t brought it up. You need to initiate the conversation and negotiate effectively.', 'Successfully negotiate a 15-20% raise by demonstrating your value and using strategic communication.', ARRAY['Anchoring', 'Frame Control', 'Strategic Vulnerability']),
('difficult-boss', 'Handle a Difficult Boss', 'Career', 2, 'Your boss is micromanaging and undermining your work. You need to shift the dynamic without creating conflict.', 'Establish boundaries and earn autonomy while maintaining a positive relationship.', ARRAY['Frame Control', 'Mirroring', 'Tactical Empathy']),
('ace-interview', 'Ace a Job Interview', 'Career', 1, 'You''re interviewing for your dream job against strong competition. You need to stand out and build instant rapport.', 'Leave a lasting impression and position yourself as the clear top candidate.', ARRAY['Authority Positioning', 'Social Proof', 'Rapport Building']),
('first-date', 'First Date Mastery', 'Relationships', 1, 'You''re on a first date with someone you''re very interested in. Create attraction and a memorable connection.', 'Build genuine attraction and ensure a second date through strategic conversation.', ARRAY['Mirroring', 'Void Pull', 'Strategic Vulnerability']),
('set-boundaries', 'Set Boundaries', 'Relationships', 2, 'Someone close to you keeps crossing your boundaries. You need to be firm without damaging the relationship.', 'Clearly establish and enforce boundaries while preserving the relationship.', ARRAY['Frame Control', 'Labeling', 'Tactical Empathy']),
('win-back-trust', 'Win Back Trust', 'Relationships', 3, 'You''ve damaged trust with someone important. You need to rebuild the relationship strategically.', 'Rebuild trust through demonstrated change and strategic vulnerability.', ARRAY['Strategic Vulnerability', 'Reciprocity', 'Commitment & Consistency']),
('close-client', 'Close a Reluctant Client', 'Sales', 2, 'A potential client is interested but hesitant. You need to close the deal without being pushy.', 'Close the deal while building a foundation for a long-term relationship.', ARRAY['Scarcity', 'Social Proof', 'Reciprocity']),
('handle-objections', 'Handle Sales Objections', 'Sales', 2, 'A prospect keeps raising objections. You need to address concerns while moving toward a close.', 'Overcome all major objections and secure a commitment.', ARRAY['Labeling', 'Reframing', 'The Contrast Principle']),
('cold-outreach', 'Cold Outreach Success', 'Sales', 1, 'You need to reach out to a cold prospect and get them interested in a meeting.', 'Get a positive response and schedule a meeting through strategic messaging.', ARRAY['Curiosity Gap', 'Authority Positioning', 'Reciprocity']),
('command-room', 'Command a Room', 'Social', 2, 'You''re entering a social gathering where you don''t know anyone. Own the room.', 'Become the most memorable person at the event through strategic social moves.', ARRAY['Authority Positioning', 'Mirroring', 'Pattern Interruption']),
('handle-confrontation', 'Handle a Confrontation', 'Social', 3, 'Someone is publicly challenging or confronting you. Maintain composure and come out on top.', 'Defuse the situation while maintaining or elevating your social status.', ARRAY['Frame Control', 'Emotional Regulation', 'Pattern Interruption']),
('build-rapport', 'Build Deep Rapport', 'Social', 1, 'You need to quickly build genuine rapport with someone important for your goals.', 'Create a deep connection that makes them want to help and support you.', ARRAY['Mirroring', 'Labeling', 'Tactical Empathy']),
('spot-manipulator', 'Spot the Manipulator', 'Defense', 2, 'You suspect someone in your life is manipulating you. Confirm your suspicions and develop a counter-strategy.', 'Identify manipulation tactics being used against you and neutralize them.', ARRAY['Pattern Recognition', 'Emotional Detachment', 'Accusation Audit']),
('counter-gaslighting', 'Counter Gaslighting', 'Defense', 3, 'Someone is gaslighting you — making you question your own reality. Regain your footing.', 'Recognize gaslighting patterns, maintain your sense of reality, and set firm boundaries.', ARRAY['Reality Testing', 'Frame Control', 'Boundary Setting']),
('exit-toxic', 'Exit a Toxic Dynamic', 'Defense', 2, 'You need to extract yourself from a toxic relationship or situation without escalating conflict.', 'Safely disengage from the toxic dynamic while protecting your interests.', ARRAY['Strategic Withdrawal', 'Emotional Detachment', 'Boundary Setting'])
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
