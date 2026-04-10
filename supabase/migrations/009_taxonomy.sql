-- Categories (the 11 life domains)
CREATE TABLE IF NOT EXISTS taxonomy_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Use cases (specific situations under each category)
CREATE TABLE IF NOT EXISTS taxonomy_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT REFERENCES taxonomy_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_use_cases_category ON taxonomy_use_cases(category_id);

-- Seed the 12 categories
INSERT INTO taxonomy_categories (id, name, emoji, description, sort_order) VALUES
('career', 'Career & Work', '💼', 'Raises, promotions, politics, getting taken seriously', 1),
('leadership', 'Leadership & Managing People', '👔', 'Team management, buy-in, respect, change management', 2),
('business', 'Business & Money', '💰', 'Closing deals, clients, negotiations, investors', 3),
('finance', 'Money & Personal Finance', '💵', 'Purchases, contracts, refunds, exceptions', 4),
('dating', 'Dating & Attraction', '❤️', 'Dates, attraction, chemistry, commitment', 5),
('relationships', 'Relationships & Social', '👥', 'Friendships, boundaries, toxic people, first impressions', 6),
('parenting', 'Parenting & Kids', '👨‍👩‍👧', 'Teenagers, boundaries, co-parenting', 7),
('personal_power', 'Personal Power', '🧍', 'Confidence, approval-seeking, presence, inner power', 8),
('high_stakes', 'High Stakes Life Moments', '🌋', 'Custody, second chances, life-changers', 9),
('texting', 'Texting & Online Conversations', '💬', 'DMs, replies, dating apps, cold conversations', 10),
('influence', 'Influence & Audience', '📣', 'Viral content, personal brand, audience building', 11),
('defense', 'Defend & Protect', '🛡️', 'Manipulation detection, liars, gaslighting, boundaries', 12)
ON CONFLICT (id) DO NOTHING;

-- Seed all use cases

-- career (15)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('career', 'Get a raise or higher starting salary', 1),
('career', 'Land a promotion faster', 2),
('career', 'Get your idea approved by leadership', 3),
('career', 'Make your boss rely on you', 4),
('career', 'Win a difficult workplace conflict', 5),
('career', 'Neutralize an office enemy or rival', 6),
('career', 'Become the most respected person on your team', 7),
('career', 'Get credit for your work', 8),
('career', 'Survive (or win) company politics', 9),
('career', 'Get your coworker to stop undermining you', 10),
('career', 'Be taken seriously when you''re the youngest in the room', 11),
('career', 'Recover your reputation after a public mistake at work', 12),
('career', 'Get a "no" reversed after being rejected for a role or project', 13),
('career', 'Make people listen when you speak in meetings', 14),
('career', 'Overcoming imposter syndrome in a new role', 15);

-- leadership (8)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('leadership', 'Get your team to follow through without micromanaging', 1),
('leadership', 'Make people want to work hard for you', 2),
('leadership', 'Handle an underperformer without HR drama', 3),
('leadership', 'Get respect from employees older than you', 4),
('leadership', 'Stop your team from going around you to your boss', 5),
('leadership', 'Get buy-in from people who don''t report to you', 6),
('leadership', 'Make a hard decision and keep your team''s trust', 7),
('leadership', 'Get a resistant team to embrace change', 8);

-- business (12)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('business', 'Close a deal a client is hesitant on', 1),
('business', 'Get a client to stop ghosting you', 2),
('business', 'Charge more without losing customers', 3),
('business', 'Win a negotiation with a vendor or partner', 4),
('business', 'Get an investor interested in your pitch', 5),
('business', 'Turn a one-time client into a retainer', 6),
('business', 'Increase reply rates on cold outreach', 7),
('business', 'Get a client to pay an overdue invoice without killing the relationship', 8),
('business', 'Get off a blacklist or recover a burned bridge with a prospect', 9),
('business', 'Stop a client from churning without begging', 10),
('business', 'Win back a client who left for a competitor', 11),
('business', 'Get a "maybe" to commit without pressure', 12);

-- finance (6)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('finance', 'Negotiate a better deal on a big purchase (car, rent, contractor)', 1),
('finance', 'Get out of a contract or commitment without burning the bridge', 2),
('finance', 'Get a refund or exception when policy says no', 3),
('finance', 'Get a doctor to take your symptoms seriously', 4),
('finance', 'Talk someone out of a bad financial decision', 5),
('finance', 'Convince a landlord or bank to make an exception for you', 6);

-- dating (14)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('dating', 'Get your ex back', 1),
('dating', 'Get a date with someone out of your league', 2),
('dating', 'Increase the chance of a second date', 3),
('dating', 'Make someone think about you when you''re not around', 4),
('dating', 'Get out of the friend zone', 5),
('dating', 'Build sexual tension through conversation', 6),
('dating', 'Make someone jealous without looking desperate', 7),
('dating', 'Get an emotionally unavailable person to open up', 8),
('dating', 'Know if someone actually likes you or is just being polite', 9),
('dating', 'Make yourself more physically attractive through behavior alone', 10),
('dating', 'Re-ignite attraction in a long-term relationship', 11),
('dating', 'Get someone to chase you instead of the other way around', 12),
('dating', 'Get a partner to commit and stop avoiding labels', 13),
('dating', 'Handle a partner who is pulling away', 14);

-- relationships (15)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('relationships', 'Repair a damaged friendship or relationship', 1),
('relationships', 'Get someone to respect you who doesn''t', 2),
('relationships', 'Set a boundary without starting a fight', 3),
('relationships', 'Get your family to take you seriously', 4),
('relationships', 'Spot when someone is lying or hiding something', 5),
('relationships', 'Defuse a tense situation before it explodes', 6),
('relationships', 'Cut off a toxic person without drama', 7),
('relationships', 'Get a narcissist or manipulator off your back', 8),
('relationships', 'Make new friends as an adult', 9),
('relationships', 'Get people to genuinely like you, not just tolerate you', 10),
('relationships', 'Handle a passive-aggressive person without losing your mind', 11),
('relationships', 'Get someone to forgive you after a serious fallout', 12),
('relationships', 'Make a strong first impression when you''re nervous or introverted', 13),
('relationships', 'Convince someone to go to therapy without pushing them away', 14),
('relationships', 'Deal with a controlling parent as an adult', 15);

-- parenting (5)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('parenting', 'Get your teenager to actually listen to you', 1),
('parenting', 'Stop your child from tuning you out', 2),
('parenting', 'Get your kids to respect boundaries without constant fighting', 3),
('parenting', 'Co-parent effectively with a difficult ex', 4),
('parenting', 'Talk to your child about a hard topic without shutting them down', 5);

-- personal_power (13)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('personal_power', 'Stop seeking approval from others', 1),
('personal_power', 'Walk into any room with confidence', 2),
('personal_power', 'Recover your confidence after a loss or rejection', 3),
('personal_power', 'Stay calm and sharp under pressure', 4),
('personal_power', 'Reinvent how people see you', 5),
('personal_power', 'Become someone people naturally follow', 6),
('personal_power', 'Stop self-sabotaging before big moments', 7),
('personal_power', 'Get out of your head in social situations', 8),
('personal_power', 'Handle rejection without it wrecking your confidence', 9),
('personal_power', 'Stop being a pushover without becoming an asshole', 10),
('personal_power', 'Make people take you seriously when you look young or unassuming', 11),
('personal_power', 'Overcome imposter syndrome in a new role', 12),
('personal_power', 'Stop letting envy or resentment hold you back', 13);

-- high_stakes (7)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('high_stakes', 'Win a custody situation', 1),
('high_stakes', 'Get a second chance after a major life mistake', 2),
('high_stakes', 'Talk someone out of a bad decision before it''s too late', 3),
('high_stakes', 'Convince a loved one to get help (therapy, addiction, health)', 4),
('high_stakes', 'Get your partner on board with a major life change', 5),
('high_stakes', 'Handle a public failure or scandal and rebuild trust', 6),
('high_stakes', 'Get an exception when every official channel has said no', 7);

-- texting (5)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('texting', 'Get more replies to your DMs', 1),
('texting', 'Get someone to say yes over text', 2),
('texting', 'Recover a conversation that went cold', 3),
('texting', 'Get a girl (or guy) to respond to your message', 4),
('texting', 'Get more matches on dating apps without changing your photos', 5);

-- influence (5)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('influence', 'Make your social content go viral', 1),
('influence', 'Build an audience that trusts you', 2),
('influence', 'Write a post that actually converts', 3),
('influence', 'Make people take your personal brand seriously', 4),
('influence', 'Write a bio or profile that makes people want to know you', 5);

-- defense (10)
INSERT INTO taxonomy_use_cases (category_id, title, sort_order) VALUES
('defense', 'Spot when someone is manipulating you', 1),
('defense', 'Recognize a liar before they do damage', 2),
('defense', 'Protect yourself from being taken advantage of', 3),
('defense', 'Identify toxic people before you''re too deep in', 4),
('defense', 'Shut down someone who is trying to control you', 5),
('defense', 'Know when you''re being played in a negotiation', 6),
('defense', 'Detect fake friendships and hidden agendas', 7),
('defense', 'Respond to gaslighting without losing your footing', 8),
('defense', 'Set limits with someone who ignores them', 9),
('defense', 'Stay in control when someone is trying to provoke you', 10);

-- Enable RLS
ALTER TABLE taxonomy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_use_cases ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active items (via service role key, RLS policies for anon)
CREATE POLICY "Allow public read of active categories" ON taxonomy_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read of active use cases" ON taxonomy_use_cases
  FOR SELECT USING (is_active = true);

-- Allow service role full access (admin operations go through service role)
CREATE POLICY "Service role full access categories" ON taxonomy_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access use cases" ON taxonomy_use_cases
  FOR ALL USING (true) WITH CHECK (true);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
