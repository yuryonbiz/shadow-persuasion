/**
 * PUT    /api/admin/files/:id — update metadata (name, sort_order, is_active, product_slug)
 * DELETE /api/admin/files/:id — delete the DB row and the underlying
 *                                Supabase Storage object (if source='supabase').
 *
 * `source='static'` rows (seeds pointing at /public/downloads files) can
 * still be deleted from the DB — that stops those files from being
 * delivered to future buyers. The physical file in /public stays on
 * disk until a future cleanup.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'product-files';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Whitelist editable columns. file_path / storage_url / source /
    // size_bytes / content_type are managed by the upload + delete
    // endpoints and aren't client-editable.
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body?.name === 'string' && body.name.trim()) patch.name = body.name.trim();
    if (typeof body?.product_slug === 'string' && body.product_slug.trim())
      patch.product_slug = body.product_slug.trim();
    if (typeof body?.sort_order === 'number') patch.sort_order = body.sort_order;
    if (typeof body?.is_active === 'boolean') patch.is_active = body.is_active;

    const { data, error } = await supabase
      .from('product_files')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });

    return NextResponse.json({ file: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/files PUT]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const { data: row } = await supabase
      .from('product_files')
      .select('id, file_path, source')
      .eq('id', id)
      .maybeSingle();
    if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // Remove the storage object first — if that fails the row stays
    // so the admin can retry, rather than ending up with orphaned
    // storage files.
    if (row.source === 'supabase' && row.file_path) {
      const { error: rmErr } = await supabase.storage.from(BUCKET).remove([row.file_path]);
      if (rmErr) {
        console.warn('[admin/files DELETE] storage remove failed:', rmErr.message);
        // Keep going — DB delete is still worth doing so the file
        // stops being delivered. Admin can clean storage manually.
      }
    }

    const { error } = await supabase.from('product_files').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/files DELETE]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
