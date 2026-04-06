import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List practice results, filterable by type and date range
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('practice_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (from) {
      query = query.gte('created_at', from);
    }

    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching practice results:', error);
      return NextResponse.json({ error: 'Failed to fetch practice results' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('[PRACTICE RESULTS GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save a practice result
export async function POST(req: NextRequest) {
  try {
    const { type, reference_id, score, xp_earned, techniques_used, feedback } = await req.json();

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('practice_results')
      .insert({
        type,
        reference_id: reference_id || null,
        score: score ?? null,
        xp_earned: xp_earned ?? 0,
        techniques_used: techniques_used || [],
        feedback: feedback || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving practice result:', error);
      return NextResponse.json({ error: 'Failed to save practice result' }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    console.error('[PRACTICE RESULTS POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
