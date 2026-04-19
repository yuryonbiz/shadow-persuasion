/**
 * Resend email helper — post-purchase delivery of PDF products.
 *
 * Requires env: RESEND_API_KEY
 * Optional env: RESEND_FROM (default: "Nate Harlan <nate@shadowpersuasion.com>")
 *               NEXT_PUBLIC_SITE_URL (default: "https://shadowpersuasion.com")
 */

import { Resend } from 'resend';
import { PRODUCTS, describeOrder, flattenDownloads, type ProductSlug } from './pricing';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM || 'Nate Harlan <nate@shadowpersuasion.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowpersuasion.com';

function renderDownloadRows(items: ProductSlug[]): string {
  const files = flattenDownloads(items);
  return files
    .map((f) => {
      const url = `${SITE_URL}${f.path}`;
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

export async function sendDeliveryEmail(opts: {
  to: string;
  items: ProductSlug[];
  firstName?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send');
    return { ok: false, error: 'Resend not configured' };
  }

  const greeting = opts.firstName ? `${opts.firstName},` : 'Hey,';
  const subject = `Your Download: ${describeOrder(opts.items)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#F4ECD8;font-family:Georgia,serif;color:#1A1A1A;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD8;padding:30px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid #5C3A1E;max-width:560px;">
            <tr><td style="padding:32px;">

              <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.3em;
                          color:#5C3A1E;text-transform:uppercase;margin-bottom:18px;">
                // SHADOW PERSUASION //
              </div>

              <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1A1A1A;margin:0 0 18px 0;">
                ${greeting}
              </h1>

              <p style="font-size:15px;line-height:1.6;margin:0 0 12px 0;">
                Thanks for grabbing the book. Here's your download${opts.items.length > 1 ? 's' : ''}:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
                ${renderDownloadRows(opts.items)}
              </table>

              <p style="font-size:14px;line-height:1.7;margin:24px 0 14px 0;">
                A few quick notes.
              </p>

              <ul style="font-size:14px;line-height:1.7;margin:0 0 14px 20px;padding:0;">
                <li>Download the files to your laptop, not just your phone. Easier to read that way.</li>
                <li>If a link expires or breaks, reply to this email and I'll re-send.</li>
                <li>When you hit the first "this is different" moment in the book, email me back and tell me which one. I read everything.</li>
              </ul>

              <p style="font-size:14px;line-height:1.7;margin:20px 0 6px 0;">
                Talk soon,
              </p>
              <p style="font-family:'Brush Script MT',cursive;font-size:24px;color:#1A1A1A;margin:0 0 24px 0;">
                Nate Harlan
              </p>

              <hr style="border:none;border-top:1px solid #5C3A1E22;margin:24px 0 18px 0;"/>

              <p style="font-size:11px;color:#5C3A1E;line-height:1.5;margin:0;">
                Shadow Persuasion — the counterintuitive approach to influence.<br/>
                Questions? Just reply to this email.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const text =
    `${greeting}\n\nThanks for grabbing the book. Here are your download links:\n\n` +
    flattenDownloads(opts.items)
      .map((f) => `${f.name}\n${SITE_URL}${f.path}\n`)
      .join('\n') +
    `\nTalk soon,\nNate Harlan`;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject,
      html,
      text,
    });
    if (result.error) {
      console.error('[email] Resend error:', result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[email] Send failed:', msg);
    return { ok: false, error: msg };
  }
}
