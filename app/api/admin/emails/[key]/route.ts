/**
 * GET    /api/admin/emails/:key         — Fetch a single template
 * PUT    /api/admin/emails/:key         — Update a template
 * DELETE /api/admin/emails/:key         — Delete a template (blocked for is_system)
 * POST   /api/admin/emails/:key  body:
 *           { action: 'clone', newKey }   — Duplicate a template with a new key
 *           { action: 'test', to, vars }  — Send a test to an arbitrary address
 *
 * The PUT handler explicitly does not let you change the `key` (use
 * clone-then-delete for that) or flip `is_system` (that's seed-only).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTestEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { key } = await params;
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // Also pull the most recent sends for this template so the editor
    // can show a lightweight delivery history.
    const { data: sends } = await supabase
      .from('email_sends')
      .select('id, to_email, subject, status, provider_id, error, created_at')
      .eq('template_key', key)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ template: data, sends: sends ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails GET /:key]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { key } = await params;
    const body = await req.json();

    // Whitelist editable columns
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body?.name === 'string') patch.name = body.name;
    if (typeof body?.description === 'string' || body?.description === null) patch.description = body.description;
    if (typeof body?.trigger_description === 'string' || body?.trigger_description === null)
      patch.trigger_description = body.trigger_description;
    if (typeof body?.subject === 'string') patch.subject = body.subject;
    if (typeof body?.body_html === 'string') patch.body_html = body.body_html;
    if (typeof body?.body_text === 'string') patch.body_text = body.body_text;
    if (typeof body?.from_name === 'string' || body?.from_name === null) patch.from_name = body.from_name;
    if (typeof body?.from_email === 'string' || body?.from_email === null) patch.from_email = body.from_email;
    if (Array.isArray(body?.variables)) patch.variables = body.variables;
    if (typeof body?.enabled === 'boolean') patch.enabled = body.enabled;

    const { data, error } = await supabase
      .from('email_templates')
      .update(patch)
      .eq('key', key)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });

    return NextResponse.json({ template: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails PUT /:key]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { key } = await params;
    const { data: existing } = await supabase
      .from('email_templates')
      .select('is_system')
      .eq('key', key)
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.is_system) {
      return NextResponse.json(
        { error: 'system templates can\'t be deleted. Disable it instead.' },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('key', key);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails DELETE /:key]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { key } = await params;
    const body = await req.json();
    const action = String(body?.action || '');

    if (action === 'clone') {
      const newKey = String(body?.newKey || '').trim();
      if (!/^[a-z0-9_]+$/.test(newKey)) {
        return NextResponse.json(
          { error: 'newKey must be lowercase letters, digits, underscores only' },
          { status: 400 }
        );
      }
      const { data: source } = await supabase
        .from('email_templates')
        .select('*')
        .eq('key', key)
        .maybeSingle();
      if (!source) return NextResponse.json({ error: 'source not found' }, { status: 404 });

      const clone = {
        ...source,
        id: undefined,
        key: newKey,
        name: `${source.name} (copy)`,
        is_system: false,
        sequence_key: null, // clones are standalone by default
        sequence_step: null,
        created_at: undefined,
        updated_at: undefined,
      };
      delete (clone as Record<string, unknown>).id;
      delete (clone as Record<string, unknown>).created_at;
      delete (clone as Record<string, unknown>).updated_at;

      const { data, error } = await supabase
        .from('email_templates')
        .insert(clone)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ template: data });
    }

    if (action === 'test') {
      const to = String(body?.to || '').trim();
      if (!to || !/@/.test(to)) {
        return NextResponse.json({ error: 'valid `to` email required' }, { status: 400 });
      }
      const { data: tpl } = await supabase
        .from('email_templates')
        .select('subject, body_html, body_text, from_name, from_email, variables')
        .eq('key', key)
        .maybeSingle();
      if (!tpl) return NextResponse.json({ error: 'not found' }, { status: 404 });

      // Use either caller-supplied vars or fall back to the sample
      // values documented on the template row. This means the test
      // send works even if the admin hasn't filled anything in.
      const suppliedVars = (body?.variables || {}) as Record<string, string>;
      const templateVars = (tpl.variables as Array<{ name: string; sample?: string }>) || [];
      const mergedVars: Record<string, string> = {};
      for (const v of templateVars) {
        mergedVars[v.name] = suppliedVars[v.name] ?? v.sample ?? '';
      }
      // Anything the caller passed that isn't in the template's variable
      // list is still honored — useful for ad-hoc test values.
      for (const [k, v] of Object.entries(suppliedVars)) {
        if (!(k in mergedVars)) mergedVars[k] = v;
      }

      const result = await sendTestEmail({
        template: {
          subject: tpl.subject,
          body_html: tpl.body_html,
          body_text: tpl.body_text,
          from_name: tpl.from_name,
          from_email: tpl.from_email,
        },
        to,
        variables: mergedVars,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error || 'send failed' }, { status: 500 });
      }
      return NextResponse.json({ success: true, id: result.id });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/emails POST /:key]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
