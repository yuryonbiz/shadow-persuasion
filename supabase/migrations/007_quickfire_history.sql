CREATE TABLE IF NOT EXISTS quickfire_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  situation TEXT NOT NULL,
  context TEXT,
  classification TEXT,
  technique TEXT,
  responses JSONB DEFAULT '[]',
  avoid TEXT,
  scenarios JSONB DEFAULT '[]',
  full_result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quickfire_history_user ON quickfire_history(user_id);

NOTIFY pgrst, 'reload schema';
