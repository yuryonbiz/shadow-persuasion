-- ============================================================================
-- 014_orders.sql — One-time purchase orders
-- ============================================================================
-- Tracks one-time purchases from the funnel:
--   - The $7 book
--   - The $17 Pre-Conversation Briefing order bump
--   - The $47 Playbooks + Vault upsell
-- (Recurring SaaS subscriptions still live in `subscriptions`.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     text NOT NULL,
  stripe_customer_id        text,
  stripe_payment_intent_id  text UNIQUE,
  items                     jsonb NOT NULL,                    -- e.g. ["book", "briefing"] or ["playbooks", "vault"]
  amount_cents              integer NOT NULL,
  currency                  text NOT NULL DEFAULT 'usd',
  status                    text NOT NULL DEFAULT 'pending',   -- 'pending' | 'paid' | 'failed' | 'refunded'
  stripe_payment_method_id  text,                              -- saved for one-click upsells
  ip_address                text,
  user_agent                text,
  delivered_at              timestamptz,                       -- set when PDFs have been emailed
  refunded_at               timestamptz,
  metadata                  jsonb DEFAULT '{}'::jsonb,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_email_idx              ON orders (email);
CREATE INDEX IF NOT EXISTS orders_stripe_customer_id_idx ON orders (stripe_customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx             ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx         ON orders (created_at DESC);

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION orders_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION orders_set_updated_at();

-- Row-level security: service role only (admin + webhook)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY orders_service_role_all ON orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE  orders IS 'One-time purchase orders from the book funnel ($7 book, $17 bump, $47 upsell).';
COMMENT ON COLUMN orders.items IS 'JSON array of item slugs purchased. e.g. ["book","briefing"] or ["playbooks","vault"].';
COMMENT ON COLUMN orders.stripe_payment_method_id IS 'Saved payment method ID — used for one-click upsell charges.';
