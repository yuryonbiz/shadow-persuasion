CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technique TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  xp_reward INTEGER DEFAULT 50,
  type TEXT DEFAULT 'beginner',
  is_generated BOOLEAN DEFAULT false,
  source_books TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with the existing 32 missions from the hardcoded pool
INSERT INTO missions (id, title, description, technique, category, difficulty, xp_reward, type) VALUES
(1, 'Spot the Anchor', 'During any conversation today about money, prices, or numbers, notice who sets the first number. Observe how it influences the rest of the discussion.', 'Anchoring', 'Negotiation', 'Beginner', 30, 'observer'),
(2, 'Social Proof Radar', 'Count how many times someone uses social proof on you today. Ads, colleagues, friends saying "everyone does it." Just notice and log each instance.', 'Social Proof', 'Influence', 'Beginner', 30, 'observer'),
(3, 'Frame Detective', 'In your next meeting or conversation, identify who controls the frame. Notice how the topic, tone, and direction are set by one person. Who is it and how do they do it?', 'Frame Control', 'Framing', 'Beginner', 30, 'observer'),
(4, 'Mirror Watch', 'Observe a conversation between two people. Notice any mirroring happening naturally: body language, speech patterns, word choices. How does it affect rapport?', 'Mirroring', 'Rapport', 'Beginner', 30, 'observer'),
(5, 'Scarcity Scanner', 'Track every scarcity message you encounter today: limited-time offers, exclusive access, "only 3 left." Rate each one: genuine or manufactured?', 'Scarcity Frame', 'Influence', 'Beginner', 30, 'observer'),
(6, 'The Reciprocity Drop', 'Do something unexpectedly helpful for someone today with no strings attached. Buy a coffee, share a useful resource, or give a genuine compliment. Notice how it shifts the dynamic.', 'Reciprocity', 'Influence', 'Beginner', 50, 'beginner'),
(7, 'Deploy a Mirror', 'In your next conversation, repeat the last 2-3 words someone says back to them as a question. Do this at least twice. Notice how it makes them elaborate.', 'Mirroring', 'Rapport', 'Beginner', 50, 'beginner'),
(8, 'Label an Emotion', 'In a conversation today, use the phrase "It seems like..." or "It sounds like..." to name what the other person is feeling. Observe their reaction.', 'Labeling', 'Rapport', 'Beginner', 50, 'beginner'),
(9, 'Authority Frame', 'Before making a recommendation today, briefly establish your credibility on the topic. Reference a specific experience, data point, or insight. Then make your suggestion.', 'Authority Positioning', 'Framing', 'Beginner', 50, 'beginner'),
(10, 'The Contrast Play', 'When presenting an option today, first mention a more expensive/difficult alternative, then present your actual recommendation. Notice how the contrast shifts perception.', 'The Contrast Principle', 'Negotiation', 'Beginner', 50, 'beginner'),
(11, 'Small Commitment', 'Get someone to agree to a small, easy request first ("Can you help me with something quick?"), then follow up with your actual request. Track how the small yes affects the bigger ask.', 'Commitment & Consistency', 'Influence', 'Beginner', 50, 'beginner'),
(12, 'Strategic Compliment', 'Share a specific, genuine vulnerability or past mistake in a professional conversation. Not a big one -- something small and relatable. Notice how it changes the dynamic.', 'Strategic Vulnerability', 'Rapport', 'Beginner', 50, 'beginner'),
(13, 'Deploy a Presupposition', 'Use one embedded presupposition in a real conversation today. Example: "When we finalize this deal..." instead of "If we finalize..." Notice how it subtly shifts the assumption.', 'Frame Control', 'Framing', 'Intermediate', 80, 'intermediate'),
(14, 'Tactical Empathy Disarm', 'In a tense or difficult conversation, summarize the other person''s position so accurately they say "exactly" or "that''s right." Use this as a bridge to your point.', 'Tactical Empathy', 'Rapport', 'Intermediate', 80, 'intermediate'),
(15, 'The Reframe', 'When someone raises an objection or problem today, reframe it. Turn a cost into an investment, a risk into an opportunity, or a weakness into a strength. Track their reaction.', 'Reframing', 'Framing', 'Intermediate', 80, 'intermediate'),
(16, 'Door-in-the-Face', 'Make a deliberately large request that you expect to be declined. Then immediately follow up with your real, smaller request. Compare the acceptance rate to asking directly.', 'Door-in-the-Face', 'Negotiation', 'Intermediate', 80, 'intermediate'),
(17, 'Pattern Break', 'In a conversation that feels stuck or scripted, do something unexpected: change the topic abruptly, ask a surprising question, or shift the energy. Notice how it creates an opening.', 'Pattern Interruption', 'Framing', 'Intermediate', 80, 'intermediate'),
(18, 'The Void', 'After asking an important question today, stay completely silent. Do not fill the silence. Wait for them to speak first, no matter how awkward it feels. Time how long it takes.', 'The Void Pull', 'Rapport', 'Intermediate', 80, 'intermediate'),
(19, 'Emotional Redirect', 'When someone is in a negative emotional state, use a story, question, or humor to shift their emotional state before making your point. Document the transition.', 'Emotional Hijacking', 'Influence', 'Intermediate', 80, 'intermediate'),
(20, 'Scarcity + Reciprocity Stack', 'Combine two techniques: give something valuable first (reciprocity), then make it clear this opportunity is limited (scarcity). Track the combined effect.', 'Scarcity Frame', 'Influence', 'Intermediate', 100, 'intermediate'),
(21, 'Label + Mirror Combo', 'In one conversation, use both labeling ("It seems like...") and mirroring (repeating their last few words). Use labeling for emotions and mirroring for facts. Compare the effects.', 'Labeling', 'Rapport', 'Intermediate', 100, 'intermediate'),
(22, 'Accusation Audit', 'Before a difficult conversation, list every negative thing the other person might think about you or your proposal. Then preemptively address them at the start. Track how it disarms them.', 'The Accusation Audit', 'Defense', 'Advanced', 120, 'advanced'),
(23, 'The Takeaway Close', 'When someone is hesitant but interested, pull back. Say "Maybe this isn''t the right fit" or remove a benefit from your offer. Notice if they chase.', 'The Takeaway', 'Negotiation', 'Advanced', 120, 'advanced'),
(24, 'Full Frame War', 'Enter a conversation where someone else sets the frame. Your mission: politely but firmly reject their frame and establish your own. Maintain it for the entire conversation.', 'Frame Control', 'Framing', 'Advanced', 120, 'advanced'),
(25, 'Cognitive Overload Play', 'Present someone with 3-4 complex options, then offer your preferred option as the simple, clear choice. Notice how decision fatigue pushes them toward the easy path.', 'Cognitive Overload', 'Influence', 'Advanced', 120, 'advanced'),
(26, 'Triple Stack', 'In one interaction, combine three techniques: establish authority, use tactical empathy, then close with a takeaway. Document each phase.', 'Authority Positioning', 'Framing', 'Advanced', 150, 'advanced'),
(27, 'Defense Mode', 'Someone will try to influence you today (sales, negotiation, request). Identify the technique they use in real-time and deploy a counter-technique. Document the exchange.', 'The Accusation Audit', 'Defense', 'Advanced', 120, 'advanced'),
(28, 'Anchoring Ambush', 'In your next negotiation (price, timeline, scope), set an aggressive anchor before they can. Make it high enough to seem bold but not absurd. Track how it shifts the final number.', 'Anchoring', 'Negotiation', 'Advanced', 120, 'advanced'),
(29, 'Empathy to Ask Pipeline', 'Build deep rapport using tactical empathy and labeling. Once they say "that''s right," pivot to your ask. Track the conversion from rapport to action.', 'Tactical Empathy', 'Rapport', 'Advanced', 150, 'advanced'),
(30, 'The Full Playbook', 'Choose any three techniques and use all three in a single high-stakes conversation. Plan your sequence in advance. Document what worked and what clashed.', 'Frame Control', 'Framing', 'Advanced', 200, 'advanced'),
(31, 'Recover a Lost Frame', 'Deliberately let someone take the frame, then reclaim it mid-conversation. Practice the transition from following to leading. How long did recovery take?', 'Frame Control', 'Defense', 'Advanced', 150, 'advanced'),
(32, 'Social Proof Engineering', 'Before making a proposal, plant social proof by casually mentioning others who have already done what you are suggesting. Make it feel natural, not forced.', 'Social Proof', 'Influence', 'Intermediate', 80, 'intermediate');

-- Reset the sequence to continue after seeded data
SELECT setval('missions_id_seq', 32);
