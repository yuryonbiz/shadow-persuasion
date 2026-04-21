-- ════════════════════════════════════════════════════════════
-- Test-order flagging
--
-- Admins can mark any order as a test so its revenue, conversion,
-- and attribution signals don't pollute the real metrics. The flag
-- cascades to any linked subscription and checkout lead so the
-- downstream dashboards stay clean regardless of which table the
-- admin queries.
--
-- All admin endpoints filter `is_test = false` by default and
-- accept an `includeTest` flag to surface test rows when needed.
-- ════════════════════════════════════════════════════════════

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

ALTER TABLE checkout_leads
  ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- Partial indexes — only index the small set of rows flagged as
-- test, since the vast majority will be `false` and aren't worth
-- indexing. Queries that filter out tests use the much more
-- selective `WHERE is_test = false` against the full table.
CREATE INDEX IF NOT EXISTS idx_orders_is_test
  ON orders(is_test) WHERE is_test = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_test
  ON subscriptions(is_test) WHERE is_test = true;
CREATE INDEX IF NOT EXISTS idx_checkout_leads_is_test
  ON checkout_leads(is_test) WHERE is_test = true;
