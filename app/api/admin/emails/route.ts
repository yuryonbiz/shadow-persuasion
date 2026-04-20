/**
 * GET  /api/admin/emails       — List every template
 * POST /api/admin/emails       — Create a brand-new template from scratch
 *
 * Admin-gated in the UI; the API itself trusts that only admins reach it
 * (matches the pattern used by the rest of /api/admin/*).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select(
        'id, key, name, description, trigger_description, subject, from_name, from_email, provider, is_system, enabled, sequence_key, sequence_step, variables, created_at, updated_at'
      )
      .order('is_system', { ascending: false })
      .order('sequence_key', { ascending: true, nullsFirst: false })
      .order('sequence_step', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ templates: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST body: { key, name, description?, subject, body_html, body_text,
 *              from_name?, from_email?, variables? }
 *
 * `key` must be unique, lowercase_with_underscores. Created templates
 * are never `is_system` — only seed rows are, and they're inserted by
 * migration.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = String(body?.key || '').trim();
    if (!/^[a-z0-9_]+$/.test(key)) {
      return NextResponse.json(
        { error: 'key must be lowercase letters, digits, underscores only' },
        { status: 400 }
      );
    }
    const row = {
      key,
      name: String(body?.name || key),
      description: body?.description ?? null,
      trigger_description: body?.trigger_description ?? null,
      subject: String(body?.subject || ''),
      body_html: String(body?.body_html || ''),
      body_text: String(body?.body_text || ''),
      from_name: body?.from_name ?? null,
      from_email: body?.from_email ?? null,
      variables: Array.isArray(body?.variables) ? body.variables : [],
      provider: 'resend',
      is_system: false,
      enabled: body?.enabled !== false,
    };
    const { data, error } = await supabase
      .from('email_templates')
      .insert(row)
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ template: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
