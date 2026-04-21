/**
 * GET  /api/admin/files  — list every product file (all products)
 * POST /api/admin/files  — upload a new file (multipart/form-data)
 *
 * Upload flow:
 *   1. Admin picks a file in the UI + chooses a product_slug + name
 *   2. Client POSTs multipart/form-data with the file + metadata
 *   3. Server streams the file into the Supabase Storage bucket
 *      `product-files` under a unique key
 *   4. Server inserts a row in `product_files` pointing at the
 *      resulting public URL
 *
 * The bucket must exist in Supabase before uploads work — see
 * supabase/migrations/019_product_files.sql for creation notes.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'product-files';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .order('product_slug', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ files: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/files GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productSlug = String(formData.get('productSlug') || '').trim();
    const name = String(formData.get('name') || '').trim();
    const sortOrderRaw = formData.get('sortOrder');
    const sortOrder =
      sortOrderRaw != null && sortOrderRaw !== '' ? Number(sortOrderRaw) : null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }
    if (!productSlug) {
      return NextResponse.json({ error: 'productSlug is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Generate a unique storage key so a second upload of the same
    // filename never overwrites the first.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${productSlug}/${Date.now()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
    if (uploadErr) {
      return NextResponse.json(
        {
          error: `Storage upload failed: ${uploadErr.message}. Does the '${BUCKET}' bucket exist in Supabase?`,
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    // Pick sort_order: explicit wins, otherwise MAX+1 within the product.
    let effectiveSort = sortOrder;
    if (effectiveSort == null) {
      const { data: existing } = await supabase
        .from('product_files')
        .select('sort_order')
        .eq('product_slug', productSlug)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      effectiveSort = ((existing?.sort_order as number | null) ?? -1) + 1;
    }

    const { data: row, error: insertErr } = await supabase
      .from('product_files')
      .insert({
        product_slug: productSlug,
        name,
        file_path: filePath,
        storage_url: publicUrl,
        size_bytes: file.size,
        content_type: file.type || null,
        sort_order: effectiveSort,
        is_active: true,
        source: 'supabase',
      })
      .select('*')
      .single();
    if (insertErr) throw insertErr;

    return NextResponse.json({ file: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/files POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
