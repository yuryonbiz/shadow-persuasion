CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  person_id UUID,
  input_text TEXT,
  input_type TEXT DEFAULT 'text', -- 'text' or 'image'
  threat_score INTEGER,
  power_yours INTEGER,
  power_theirs INTEGER,
  tactics JSONB DEFAULT '[]',
  response_options JSONB DEFAULT '[]',
  communication_style JSONB DEFAULT '{}',
  counter_script TEXT,
  overall_assessment TEXT,
  techniques_identified TEXT[] DEFAULT '{}',
  full_result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_history_user ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_person ON analysis_history(person_id);

NOTIFY pgrst, 'reload schema';
