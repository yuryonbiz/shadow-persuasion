-- ════════════════════════════════════════════════════════════
-- Email templates + send log
--
-- Moves every Resend email (order delivery + 3-step cart recovery)
-- out of hardcoded strings in lib/email.ts and into a DB-backed
-- editor the admin can manage at /app/admin/emails.
--
-- Seed rows carry the exact current copy so day-zero behavior is
-- unchanged. Templates are looked up by `key`; missing rows fall
-- back to the code defaults in lib/email.ts so we never silently
-- fail to send.
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text UNIQUE NOT NULL,
  name          text NOT NULL,
  description   text,
  trigger_description text,
  subject       text NOT NULL,
  body_html     text NOT NULL,
  body_text     text NOT NULL,
  from_name     text,
  from_email    text,
  variables     jsonb DEFAULT '[]'::jsonb,  -- [{ name, description, sample }]
  provider      text DEFAULT 'resend',       -- 'resend' | 'firebase' (firebase is read-only)
  is_system     boolean DEFAULT false,       -- built-in templates can't be deleted
  enabled       boolean DEFAULT true,
  sequence_key  text,                        -- groups multi-step sequences (e.g. 'cart_recovery')
  sequence_step int,                         -- order within the sequence (1, 2, 3)
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(key);
CREATE INDEX IF NOT EXISTS idx_email_templates_sequence ON email_templates(sequence_key, sequence_step);

CREATE TABLE IF NOT EXISTS email_sends (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key  text,
  to_email      text NOT NULL,
  subject       text,
  status        text NOT NULL,     -- 'sent' | 'failed' | 'skipped'
  provider_id   text,              -- Resend email id
  error         text,
  metadata      jsonb DEFAULT '{}'::jsonb,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_template_key ON email_sends(template_key);
CREATE INDEX IF NOT EXISTS idx_email_sends_to_email ON email_sends(to_email);
CREATE INDEX IF NOT EXISTS idx_email_sends_created_at ON email_sends(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- Seed: Order delivery (post-purchase download links)
-- ────────────────────────────────────────────────────────────
INSERT INTO email_templates (key, name, description, trigger_description, subject, body_html, body_text, from_name, from_email, variables, provider, is_system, enabled)
VALUES (
  'order_delivery',
  'Order Delivery',
  'Sent after a successful Stripe payment. Delivers the download links for whatever the customer bought (book, briefing, playbooks, vault).',
  'Fires automatically on Stripe webhook `payment_intent.succeeded`. Also triggered manually when admin clicks Resend on an order.',
  'Your Download: {{order_description}}',
  $HTML$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
        <tr><td style="padding:32px;">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
            // SHADOW PERSUASION //
          </div>
          <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1A1A1A;margin:0 0 18px 0;">
            {{greeting}}
          </h1>
          <p style="font-size:15px;line-height:1.6;margin:0 0 12px 0;">
            Thanks for grabbing the book. Here&#x2019;s your download{{download_plural}}:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
            {{download_rows}}
          </table>
          <p style="font-size:14px;line-height:1.7;margin:24px 0 14px 0;">
            A few quick notes.
          </p>
          <ul style="font-size:14px;line-height:1.7;margin:0 0 14px 20px;padding:0;">
            <li>Download the files to your laptop, not just your phone. Easier to read that way.</li>
            <li>If a link expires or breaks, reply to this email and I&#x2019;ll re-send.</li>
            <li>When you hit the first "this is different" moment in the book, email me back and tell me which one. I read everything.</li>
          </ul>
          <p style="font-size:14px;line-height:1.7;margin:20px 0 6px 0;">Talk soon,</p>
          <p style="font-family:'Brush Script MT',cursive;font-size:24px;color:#1A1A1A;margin:0 0 24px 0;">Nate Harlan</p>
          <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>
          <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
            Shadow Persuasion &mdash; the counterintuitive approach to influence.<br/>
            Questions? Just reply to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>$HTML$,
  $TEXT${{greeting}}

Thanks for grabbing the book. Here are your download links:

{{download_rows_text}}

Talk soon,
Nate Harlan$TEXT$,
  'Nate Harlan',
  'nate@shadowpersuasion.com',
  $JSON$[
    {"name": "greeting", "description": "First name if known, else generic greeting", "sample": "Yury,"},
    {"name": "order_description", "description": "Human description of what they bought", "sample": "Shadow Persuasion Book + Briefing Bonus"},
    {"name": "download_plural", "description": "Empty string or 's' depending on number of items", "sample": "s"},
    {"name": "download_rows", "description": "Rendered HTML table rows with download links", "sample": "<tr>...</tr>"},
    {"name": "download_rows_text", "description": "Plain-text version of download links", "sample": "Book\nhttps://..."}
  ]$JSON$::jsonb,
  'resend',
  true,
  true
)
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- Seed: Cart recovery Step 1 (~1 hour)
-- ────────────────────────────────────────────────────────────
INSERT INTO email_templates (key, name, description, trigger_description, subject, body_html, body_text, from_name, from_email, variables, provider, is_system, enabled, sequence_key, sequence_step)
VALUES (
  'cart_recovery_1',
  'Cart Recovery — Step 1 (1 hour)',
  'First nudge after a checkout abandonment. Gentle check-in, no pitch. Fires ~1 hour after the lead is captured.',
  'Fires from hourly cron /api/cron/recovery-emails when a checkout_leads row is status=created and ~1 hour old.',
  'You left something behind',
  $HTML$<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
        <tr><td style="padding:32px;">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
            // SHADOW PERSUASION //
          </div>
          <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 16px 0;">
            {{greeting}}
          </h1>
          <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
            Looks like you started grabbing the book a bit ago and didn&#x2019;t finish. No pitch here. Just flagging it in case you lost the tab or the wifi dropped.
          </p>
          <p style="font-size:15px;line-height:1.65;margin:0 0 18px 0;">
            If you still want it, here&#x2019;s the page:
          </p>
          <p style="margin:0 0 24px 0;">
            <a href="{{cta_url}}" style="display:inline-block;padding:14px 32px;background:#D4A017;color:#000;text-decoration:none;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
              Finish My Order &rarr; $7
            </a>
          </p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Nate</p>
          <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>
          <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
            You&#x2019;re getting this because you started a checkout at shadowpersuasion.com. If that wasn&#x2019;t you, ignore this email. We don&#x2019;t send more than three of these.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>$HTML$,
  $TEXT${{greeting}}

Looks like you started grabbing the book and didn't finish. No pitch — just in case you lost the tab.

If you still want it: {{cta_url}}

Nate$TEXT$,
  'Nate Harlan',
  'nate@shadowpersuasion.com',
  $JSON$[
    {"name": "greeting", "description": "First name if known, else 'Hey,'", "sample": "Yury,"},
    {"name": "cta_url", "description": "URL to the checkout page", "sample": "https://shadowpersuasion.com/checkout/book"}
  ]$JSON$::jsonb,
  'resend',
  true,
  true,
  'cart_recovery',
  1
)
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- Seed: Cart recovery Step 2 (~24 hours)
-- ────────────────────────────────────────────────────────────
INSERT INTO email_templates (key, name, description, trigger_description, subject, body_html, body_text, from_name, from_email, variables, provider, is_system, enabled, sequence_key, sequence_step)
VALUES (
  'cart_recovery_2',
  'Cart Recovery — Step 2 (24 hours)',
  'Value reinforcement + the Persuasion Detector hook. Fires ~24 hours after the lead is captured if they still haven''t bought.',
  'Fires from hourly cron /api/cron/recovery-emails when a checkout_leads row is status=recovery_sent_1 and ~24 hours old.',
  'The part I should have said up front',
  $HTML$<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
        <tr><td style="padding:32px;">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
            // SHADOW PERSUASION //
          </div>
          <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 16px 0;">
            {{greeting}}
          </h1>
          <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
            Most readers finish Chapter 1 and email me the same sentence: <em>&#x201C;wait, is this actually the problem with everything I&#x2019;ve tried?&#x201D;</em>
          </p>
          <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
            Yes. It is. It&#x2019;s the Persuasion Detector, and every book you&#x2019;ve read before this one triggers it. That&#x2019;s why the Cialdini anchoring move never actually worked on your boss, and why the Voss mirroring thing felt weird when you tried it. The other person saw you running the play.
          </p>
          <p style="font-size:15px;line-height:1.65;margin:0 0 18px 0;">
            The 47 tactics in the book work because the other person doesn&#x2019;t see them running. That&#x2019;s the whole book, in one sentence.
          </p>
          <p style="margin:0 0 24px 0;">
            <a href="{{cta_url}}" style="display:inline-block;padding:14px 32px;background:#D4A017;color:#000;text-decoration:none;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
              Grab The Book &rarr; $7
            </a>
          </p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Still here if you want it,</p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Nate</p>
          <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>
          <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
            You&#x2019;re getting this because you started a checkout at shadowpersuasion.com. If that wasn&#x2019;t you, ignore this email. We don&#x2019;t send more than three of these.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>$HTML$,
  $TEXT${{greeting}}

Most readers finish Chapter 1 and email me the same sentence: "wait, is this actually the problem with everything I've tried?" Yes.

The 47 tactics in the book work because the other person doesn't see them running. That's the whole thing, in one sentence.

{{cta_url}}

Nate$TEXT$,
  'Nate Harlan',
  'nate@shadowpersuasion.com',
  $JSON$[
    {"name": "greeting", "description": "First name if known, else 'Hey again,'", "sample": "Yury,"},
    {"name": "cta_url", "description": "URL to the checkout page", "sample": "https://shadowpersuasion.com/checkout/book"}
  ]$JSON$::jsonb,
  'resend',
  true,
  true,
  'cart_recovery',
  2
)
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- Seed: Cart recovery Step 3 (~72 hours)
-- ────────────────────────────────────────────────────────────
INSERT INTO email_templates (key, name, description, trigger_description, subject, body_html, body_text, from_name, from_email, variables, provider, is_system, enabled, sequence_key, sequence_step)
VALUES (
  'cart_recovery_3',
  'Cart Recovery — Step 3 (72 hours)',
  'Final walkaway. Explicit reminder that this is the last email in the sequence. Fires ~72 hours after the lead was captured.',
  'Fires from hourly cron /api/cron/recovery-emails when a checkout_leads row is status=recovery_sent_2 and ~72 hours old. Lead is marked abandoned after this send.',
  'Last one from me',
  $HTML$<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
        <tr><td style="padding:32px;">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
            // SHADOW PERSUASION //
          </div>
          <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 16px 0;">
            {{greeting}}
          </h1>
          <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
            This is the last email I&#x2019;ll send about this. Promise.
          </p>
          <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
            If the book isn&#x2019;t for you, no hard feelings. Unsubscribe link is at the bottom of this email. I won&#x2019;t send another recovery sequence.
          </p>
          <p style="font-size:15px;line-height:1.65;margin:0 0 14px 0;">
            If it is for you and you just haven&#x2019;t gotten around to it: the offer&#x2019;s still $7, still backed by the 30-day guarantee. Read the first chapter tonight. If you don&#x2019;t have at least one &#x201C;that&#x2019;s what was happening&#x201D; moment by the last page, email me the word &#x201C;refund.&#x201D; I send the money back and you keep the files.
          </p>
          <p style="margin:0 0 24px 0;">
            <a href="{{cta_url}}" style="display:inline-block;padding:14px 32px;background:#D4A017;color:#000;text-decoration:none;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
              Last Chance &middot; $7
            </a>
          </p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Either way, thanks for checking us out.</p>
          <p style="font-size:14px;line-height:1.65;margin:0 0 6px 0;">Nate</p>
          <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>
          <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
            You&#x2019;re getting this because you started a checkout at shadowpersuasion.com. If that wasn&#x2019;t you, ignore this email. We don&#x2019;t send more than three of these.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>$HTML$,
  $TEXT${{greeting}}

This is the last email I'll send about this.

If the book isn't for you, no hard feelings. If it is: $7, 30-day guarantee, unsubscribe anytime.

{{cta_url}}

Nate$TEXT$,
  'Nate Harlan',
  'nate@shadowpersuasion.com',
  $JSON$[
    {"name": "greeting", "description": "First name if known, else 'Hey,'", "sample": "Yury,"},
    {"name": "cta_url", "description": "URL to the checkout page", "sample": "https://shadowpersuasion.com/checkout/book"}
  ]$JSON$::jsonb,
  'resend',
  true,
  true,
  'cart_recovery',
  3
)
ON CONFLICT (key) DO NOTHING;
