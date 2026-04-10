import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';

const ADMIN_EMAILS = ['ybyalik@gmail.com'];

/**
 * Extract email from Firebase JWT (no verification — matches existing pattern).
 */
function getEmailFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return payload.email || null;
  } catch {
    return null;
  }
}

function requireAdmin(request: NextRequest): NextResponse | null {
  const email = getEmailFromToken(request);
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// GET: all categories + use cases (including inactive)
export async function GET(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  const { data: categories, error: catError } = await supabase
    .from('taxonomy_categories')
    .select('*')
    .order('sort_order');

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

  const { data: useCases, error: ucError } = await supabase
    .from('taxonomy_use_cases')
    .select('*')
    .order('sort_order');

  if (ucError) return NextResponse.json({ error: ucError.message }, { status: 500 });

  const result = (categories || []).map((cat) => ({
    ...cat,
    useCases: (useCases || []).filter((uc) => uc.category_id === cat.id),
  }));

  return NextResponse.json({ categories: result });
}

// POST: create category or use case
export async function POST(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  const body = await request.json();

  if (body.type === 'category') {
    const { data, error } = await supabase
      .from('taxonomy_categories')
      .insert({
        id: body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        name: body.name,
        emoji: body.emoji || null,
        description: body.description || null,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (body.type === 'use_case') {
    const { data, error } = await supabase
      .from('taxonomy_use_cases')
      .insert({
        category_id: body.category_id,
        title: body.title,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

// PUT: update category or use case
export async function PUT(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  const body = await request.json();

  if (body.type === 'category') {
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.emoji !== undefined) updates.emoji = body.emoji;
    if (body.description !== undefined) updates.description = body.description;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data, error } = await supabase
      .from('taxonomy_categories')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (body.type === 'use_case') {
    const updates: Record<string, any> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.category_id !== undefined) updates.category_id = body.category_id;

    const { data, error } = await supabase
      .from('taxonomy_use_cases')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

// DELETE: remove category or use case
export async function DELETE(request: NextRequest) {
  const err = requireAdmin(request);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
  }

  if (type === 'category') {
    const { error } = await supabase
      .from('taxonomy_categories')
      .delete()
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (type === 'use_case') {
    const { error } = await supabase
      .from('taxonomy_use_cases')
      .delete()
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
