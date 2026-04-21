/**
 * Resend email senders.
 *
 * Each sender looks up its template row in the DB (email_templates
 * table, keyed by template key) and falls back to a hardcoded
 * template in this file if the DB row is missing. That way we
 * never silently stop sending if somebody accidentally disables
 * or deletes a template row.
 *
 * Every successful or failed send is logged to the email_sends
 * table so the admin can audit deliverability.
 *
 * Requires env: RESEND_API_KEY
 * Optional env: RESEND_FROM (default: "Nate Harlan <nate@shadowpersuasion.com>")
 *               NEXT_PUBLIC_SITE_URL (default: "https://shadowpersuasion.com")
 */

import { Resend } from 'resend';
import {
  describeOrder,
  fetchProductFiles,
  type DownloadFile,
  type ProductSlug,
} from './pricing';
import {
  loadTemplate,
  renderTemplate,
  logSend,
  buildFromAddress,
  buildUnsubscribeUrl,
  isUnsubscribed,
  type TemplateRecord,
} from './email-templates';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowpersuasion.com';

/* ════════════════════════════════════════════════════════════
   Order delivery — sends download links after a paid order.
   ════════════════════════════════════════════════════════════ */

/**
 * URL resolver — DB-seeded rows store absolute URLs (either the
 * bundled-in-/public/downloads/ path prefixed with the site host,
 * or a Supabase Storage public URL). Legacy hardcoded rows in
 * lib/pricing.ts use relative paths like `/downloads/foo.pdf` which
 * need the SITE_URL prefix. Handle both by checking for scheme.
 */
function resolveDownloadUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

function renderDownloadRowsHtml(files: DownloadFile[]): string {
  return files
    .map((f) => {
      const url = resolveDownloadUrl(f.path);
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #5C3A1E22;">
            <div style="font-family:Georgia,serif;font-size:14px;font-weight:bold;color:#1A1A1A;">
              ${f.name}
            </div>
            <a href="${url}"
               style="display:inline-block;margin-top:8px;padding:9px 20px;
                      background:#D4A017;color:#000;text-decoration:none;
                      font-family:'Courier New',monospace;font-size:12px;
                      font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">
              DOWNLOAD &rarr;
            </a>
          </td>
        </tr>`;
    })
    .join('');
}

function renderDownloadRowsText(files: DownloadFile[]): string {
  return files.map((f) => `${f.name}\n${resolveDownloadUrl(f.path)}\n`).join('\n');
}

/**
 * Hardcoded fallback for the order-delivery email. Used only if the
 * DB template row is missing. Kept in sync with the seed in
 * supabase/migrations/016_email_templates.sql.
 */
function deliveryFallback(): Pick<TemplateRecord, 'subject' | 'body_html' | 'body_text' | 'from_name' | 'from_email'> {
  return {
    subject: 'Your Download: {{order_description}}',
    body_html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;"><tr><td style="padding:32px;">
<div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">// SHADOW PERSUASION //</div>
<h1 style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1A1A1A;margin:0 0 18px 0;">{{greeting}}</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 12px 0;">Thanks for grabbing the book. Here's your download{{download_plural}}:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">{{download_rows}}</table>
<p style="font-size:14px;line-height:1.7;margin:24px 0 6px 0;">Talk soon,</p>
<p style="font-family:'Brush Script MT',cursive;font-size:24px;color:#1A1A1A;margin:0 0 24px 0;">Nate Harlan</p>
</td></tr></table></td></tr></table></body></html>`,
    body_text: `{{greeting}}\n\nThanks for grabbing the book. Here are your download links:\n\n{{download_rows_text}}\n\nTalk soon,\nNate Harlan`,
    from_name: 'Nate Harlan',
    from_email: 'nate@shadowpersuasion.com',
  };
}

export async function sendDeliveryEmail(opts: {
  to: string;
  items: ProductSlug[];
  firstName?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send');
    return { ok: false, error: 'Resend not configured' };
  }

  const tpl = (await loadTemplate('order_delivery')) ?? null;
  // If template exists but is disabled, skip the send entirely.
  if (tpl && !tpl.enabled) {
    await logSend({
      template_key: 'order_delivery',
      to: opts.to,
      subject: '',
      status: 'skipped',
      error: 'template disabled',
    });
    return { ok: false, error: 'template disabled' };
  }

  // Delivery is transactional — Stripe requires we deliver what the
  // customer paid for. So we do NOT check the unsubscribe list here.
  const body = tpl ?? deliveryFallback();

  // Pull the file list from the DB (admin-managed). Falls back to
  // the hardcoded lib/pricing definitions if the DB query fails,
  // so a bad deploy or down database never blocks a real delivery.
  const files = await fetchProductFiles(opts.items);
  const fileCount = files.length;

  const vars: Record<string, string> = {
    greeting: opts.firstName ? `${opts.firstName},` : 'Hey,',
    order_description: describeOrder(opts.items),
    download_plural: fileCount > 1 ? 's' : '',
    download_rows: renderDownloadRowsHtml(files),
    download_rows_text: renderDownloadRowsText(files),
    unsubscribe_url: buildUnsubscribeUrl(opts.to), // harmless if the template doesn't reference it
  };

  const subject = renderTemplate(body.subject, vars);
  const html = renderTemplate(body.body_html, vars);
  const text = renderTemplate(body.body_text, vars);
  const from = buildFromAddress(tpl);

  try {
    const result = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error('[email] Resend error:', result.error);
      await logSend({
        template_key: 'order_delivery',
        to: opts.to,
        subject,
        status: 'failed',
        error: result.error.message,
      });
      return { ok: false, error: result.error.message };
    }
    await logSend({
      template_key: 'order_delivery',
      to: opts.to,
      subject,
      status: 'sent',
      provider_id: result.data?.id,
    });
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] Send failed:', msg);
    await logSend({
      template_key: 'order_delivery',
      to: opts.to,
      subject,
      status: 'failed',
      error: msg,
    });
    return { ok: false, error: msg };
  }
}

/* ════════════════════════════════════════════════════════════
   Cart abandonment recovery sequence (3 emails over 72 hours)

   Step 1: ~1 hour after lead captured (gentle check-in)
   Step 2: ~24 hours (value reinforcement + social proof)
   Step 3: ~72 hours (final offer / walkaway)
   ════════════════════════════════════════════════════════════ */

const RECOVERY_URL = `${SITE_URL}/checkout/book`;

/**
 * Build a recovery CTA with UTM params baked in so attribution is
 * deterministic. When the user clicks this link, the checkout page
 * captures the UTMs into sessionStorage and the next lead/order
 * API call stores them on the lead row. The webhook then uses
 * `utm_content='step_N'` as the authoritative answer for
 * recovered_by_email_step instead of relying on the 72h heuristic.
 *
 * We use the standard UTM names so these URLs also light up in
 * Google Analytics out of the box if anyone plugs that in later.
 */
function buildRecoveryCtaUrl(step: number): string {
  const url = new URL(RECOVERY_URL);
  url.searchParams.set('utm_source', 'email');
  url.searchParams.set('utm_medium', 'recovery');
  url.searchParams.set('utm_campaign', 'cart_recovery');
  url.searchParams.set('utm_content', `step_${step}`);
  return url.toString();
}

/**
 * Any positive integer step. Legacy code used the literal `1 | 2 | 3`
 * but the DB-driven cron needs to support arbitrary counts now that
 * admins can add step 4+.
 */
type RecoveryStep = number;

/**
 * Minimal fallback copy for each recovery step. Used if the DB row
 * for the corresponding template key is missing. Kept intentionally
 * terse — the seed in 016_email_templates.sql has the full copy.
 *
 * Only covers steps 1-3 (the originally-shipped sequence). If admin
 * adds step 4+ and the DB lookup later fails, we return step 3's
 * copy as a very-last-resort fallback.
 */
function recoveryFallback(step: RecoveryStep): Pick<TemplateRecord, 'subject' | 'body_html' | 'body_text' | 'from_name' | 'from_email'> {
  const base = {
    from_name: 'Nate Harlan',
    from_email: 'nate@shadowpersuasion.com',
  };
  if (step === 1) {
    return {
      ...base,
      subject: 'You left something behind',
      body_html: `<p>{{greeting}}</p><p>You started grabbing the book and didn't finish. <a href="{{cta_url}}">Finish here.</a></p><p>Nate</p>`,
      body_text: `{{greeting}}\n\nYou started grabbing the book and didn't finish: {{cta_url}}\n\nNate`,
    };
  }
  if (step === 2) {
    return {
      ...base,
      subject: 'The part I should have said up front',
      body_html: `<p>{{greeting}}</p><p>Shadow Persuasion works because the other person doesn't see the tactic running. <a href="{{cta_url}}">Grab the book.</a></p><p>Nate</p>`,
      body_text: `{{greeting}}\n\nShadow Persuasion works because the other person doesn't see it running: {{cta_url}}\n\nNate`,
    };
  }
  // Step 3 and anything beyond (if a future step's DB row goes missing)
  return {
    ...base,
    subject: 'Last one from me',
    body_html: `<p>{{greeting}}</p><p>Last email. $7, 30-day guarantee. <a href="{{cta_url}}">Last chance.</a></p><p>Nate</p>`,
    body_text: `{{greeting}}\n\nLast email. $7, 30-day guarantee: {{cta_url}}\n\nNate`,
  };
}

export async function sendRecoveryEmail(opts: {
  to: string;
  firstName?: string | null;
  step: RecoveryStep; // widened to any positive integer for DB-driven sequences
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping recovery send');
    return { ok: false, error: 'Resend not configured' };
  }

  const key = `cart_recovery_${opts.step}`;
  const tpl = (await loadTemplate(key)) ?? null;
  if (tpl && !tpl.enabled) {
    await logSend({
      template_key: key,
      to: opts.to,
      subject: '',
      status: 'skipped',
      error: 'template disabled',
    });
    return { ok: false, error: 'template disabled' };
  }

  // Honor unsubscribes for non-transactional sends. Recovery emails
  // are marketing, so check the opt-out list before sending.
  // (If the template flag isn't set, default to treating sequences as
  // non-transactional — safer default.)
  const nonTransactional = tpl ? !tpl.is_transactional : true;
  if (nonTransactional && (await isUnsubscribed(opts.to))) {
    await logSend({
      template_key: key,
      to: opts.to,
      subject: '',
      status: 'skipped',
      error: 'recipient unsubscribed',
    });
    return { ok: false, error: 'recipient unsubscribed' };
  }

  const body = tpl ?? recoveryFallback(opts.step);
  const vars: Record<string, string> = {
    greeting: opts.firstName ? `${opts.firstName},` : opts.step === 2 ? 'Hey again,' : 'Hey,',
    cta_url: buildRecoveryCtaUrl(opts.step),
    unsubscribe_url: buildUnsubscribeUrl(opts.to),
  };

  const subject = renderTemplate(body.subject, vars);
  const html = renderTemplate(body.body_html, vars);
  const text = renderTemplate(body.body_text, vars);
  const from = buildFromAddress(tpl);

  try {
    const result = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      html,
      text,
    });
    if (result.error) {
      await logSend({
        template_key: key,
        to: opts.to,
        subject,
        status: 'failed',
        error: result.error.message,
      });
      return { ok: false, error: result.error.message };
    }
    await logSend({
      template_key: key,
      to: opts.to,
      subject,
      status: 'sent',
      provider_id: result.data?.id,
      metadata: { step: opts.step },
    });
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logSend({
      template_key: key,
      to: opts.to,
      subject,
      status: 'failed',
      error: msg,
    });
    return { ok: false, error: msg };
  }
}

/* ════════════════════════════════════════════════════════════
   Admin test-send — renders an arbitrary template with caller-
   supplied variables and sends it to a destination address.

   Used by /api/admin/emails/[key]/test. Doesn't check `enabled`
   because admins need to preview disabled drafts.
   ════════════════════════════════════════════════════════════ */

export async function sendTestEmail(opts: {
  template: Pick<TemplateRecord, 'subject' | 'body_html' | 'body_text' | 'from_name' | 'from_email'>;
  to: string;
  variables: Record<string, string>;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    return { ok: false, error: 'Resend not configured' };
  }
  const subject = '[TEST] ' + renderTemplate(opts.template.subject, opts.variables);
  const html = renderTemplate(opts.template.body_html, opts.variables);
  const text = renderTemplate(opts.template.body_text, opts.variables);
  const from = buildFromAddress(opts.template as TemplateRecord);

  try {
    const result = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      html,
      text,
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
