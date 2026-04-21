-- ════════════════════════════════════════════════════════════
-- Product files — admin-managed download delivery
--
-- Before this migration, lib/pricing.ts hardcoded the list of
-- files delivered to buyers of each product. Swapping a file, or
-- adding a new bonus, required a code change + deploy.
--
-- This table moves that list into the DB so admins can
-- upload / rename / reassign / delete files from /app/admin/files.
-- The delivery email + thank-you page read from here.
--
-- Storage:
--   - Existing files in /public/downloads/ are seeded with their
--     existing URLs (served from the Vercel deploy).
--   - New uploads from the admin UI go to Supabase Storage bucket
--     `product-files` and store a storage URL.
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS product_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug  text NOT NULL,            -- 'book' | 'briefing' | 'playbooks' | 'vault' | future
  name          text NOT NULL,            -- user-facing label in the email / UI
  file_path     text NOT NULL,            -- path within storage bucket (blank for static /downloads/ files)
  storage_url   text NOT NULL,            -- absolute URL the customer clicks to download
  size_bytes    bigint,
  content_type  text,
  sort_order    int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  source        text NOT NULL DEFAULT 'static', -- 'static' (bundled in /public) | 'supabase' (uploaded)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_files_slug_active
  ON product_files(product_slug, sort_order)
  WHERE is_active = true;

-- ─────────────── Seed with current /public/downloads ───────────────

INSERT INTO product_files (product_slug, name, file_path, storage_url, sort_order, source)
VALUES
  ('book', 'Shadow Persuasion (The Book)',                     '', 'https://shadowpersuasion.com/downloads/shadow-persuasion-book.pdf',          0, 'static'),
  ('book', 'Bonus #1 — The Manipulation Tactics Decoder',      '', 'https://shadowpersuasion.com/downloads/bonus-1-manipulation-decoder.pdf',    1, 'static'),
  ('book', 'Bonus #2 — The Power Dynamics Cheatsheet',         '', 'https://shadowpersuasion.com/downloads/bonus-2-power-dynamics-cheatsheet.pdf', 2, 'static'),
  ('book', 'Bonus #3 — 48 Salary Negotiation Scripts',         '', 'https://shadowpersuasion.com/downloads/bonus-3-salary-scripts.pdf',          3, 'static'),
  ('book', 'Bonus #4 — The Reactance Detector Cheatsheet',     '', 'https://shadowpersuasion.com/downloads/bonus-4-reactance-detector.pdf',      4, 'static'),
  ('briefing',  'The Pre-Conversation Briefing', '', 'https://shadowpersuasion.com/downloads/pre-conversation-briefing.pdf', 0, 'static'),
  ('playbooks', 'The Situation Playbooks',       '', 'https://shadowpersuasion.com/downloads/situation-playbooks.pdf',       0, 'static'),
  ('vault',     'The Shadow Persuasion Vault',   '', 'https://shadowpersuasion.com/downloads/shadow-persuasion-vault.pdf',   0, 'static')
ON CONFLICT DO NOTHING;
