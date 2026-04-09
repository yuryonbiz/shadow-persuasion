ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS voice_profile JSONB DEFAULT '{}';
-- voice_profile structure:
-- {
--   personality: string (e.g. "direct, confident, slightly sarcastic"),
--   writingStyle: string (e.g. "short sentences, casual, uses humor"),
--   tone: string (e.g. "professional but warm"),
--   sampleTexts: string[] (actual messages/emails the user has written),
--   updatedAt: string (ISO date)
-- }

NOTIFY pgrst, 'reload schema';
