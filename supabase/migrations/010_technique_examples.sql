ALTER TABLE technique_summaries ADD COLUMN IF NOT EXISTS conversation_examples JSONB DEFAULT '[]';
NOTIFY pgrst, 'reload schema';
