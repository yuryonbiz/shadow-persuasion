/**
 * Email template loader + renderer.
 *
 * Every Resend email in the system goes through this module. Templates
 * live in the `email_templates` Supabase table so the admin can edit
 * them at runtime from /app/admin/emails without requiring a deploy.
 *
 * If the DB lookup fails or the row is missing we fall back to the
 * caller-supplied code template so we never silently stop sending —
 * the legacy lib/email.ts code stays reachable as a safety net.
 *
 * Variable syntax: {{name}} — simple string replacement, no escaping,
 * no logic. Callers pre-render anything structural (HTML rows, etc.)
 * and pass it as a pre-rendered string.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type TemplateRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  trigger_description: string | null;
  subject: string;
  body_html: string;
  body_text: string;
  from_name: string | null;
  from_email: string | null;
  variables: Array<{ name: string; description?: string; sample?: string }>;
  provider: string;
  is_system: boolean;
  enabled: boolean;
  sequence_key: string | null;
  sequence_step: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Render a template string by substituting {{var}} placeholders.
 * Missing variables are replaced with an empty string and logged.
 */
export function renderTemplate(
  template: string,
  vars: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    const v = vars[name];
    if (v === undefined || v === null) {
      // Don't spam — this is expected when a template doesn't use
      // every variable the caller offers.
      return '';
    }
    return String(v);
  });
}

/**
 * Fetch a template row by key. Returns null if the row is missing
 * or the DB is unavailable — caller should fall back to its
 * hardcoded defaults.
 */
export async function loadTemplate(key: string): Promise<TemplateRecord | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return null;
    return data as TemplateRecord;
  } catch (err) {
    console.warn('[email-templates] load failed for', key, err);
    return null;
  }
}

/**
 * Record a send attempt so admins can see delivery history.
 * Fire-and-forget — we never want a logging hiccup to block a real send.
 */
export async function logSend(entry: {
  template_key: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  provider_id?: string | null;
  error?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.from('email_sends').insert({
      template_key: entry.template_key,
      to_email: entry.to,
      subject: entry.subject,
      status: entry.status,
      provider_id: entry.provider_id ?? null,
      error: entry.error ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.warn('[email-templates] log failed', err);
  }
}

/**
 * Build the From address. Prefers the template's per-row values; falls
 * back to env (RESEND_FROM) or the canonical default.
 */
export function buildFromAddress(template: TemplateRecord | null): string {
  const envFrom = process.env.RESEND_FROM;
  if (template?.from_name && template?.from_email) {
    return `${template.from_name} <${template.from_email}>`;
  }
  if (template?.from_email) return template.from_email;
  if (envFrom) return envFrom;
  return 'Nate Harlan <nate@shadowpersuasion.com>';
}
