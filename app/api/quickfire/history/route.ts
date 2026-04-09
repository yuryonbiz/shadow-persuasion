import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { getUserFromRequest } from '@/lib/auth-api';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    let query = supabase
      .from('quickfire_history')
      .select('id, situation, context, classification, technique, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('[QUICKFIRE_HISTORY]', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from('quickfire_history')
      .insert({
        user_id: userId,
        situation: body.situation,
        context: body.context || null,
        classification: body.classification || null,
        technique: body.technique || null,
        responses: body.responses || [],
        avoid: body.avoid || null,
        scenarios: body.scenarios || [],
        full_result: body.fullResult || {},
      })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('[QUICKFIRE_HISTORY]', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    let query = supabase.from('quickfire_history').delete().eq('id', id);
    if (userId) query = query.eq('user_id', userId);

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[QUICKFIRE_HISTORY]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
