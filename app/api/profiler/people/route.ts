import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'user_profiles_people';

// GET: List all people profiles for the user
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);

    let query = supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[PROFILER_PEOPLE]', 'Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch people profiles' }, { status: 500 });
    }

    return NextResponse.json({ profiles: data || [] });
  } catch (error) {
    console.error('[PROFILER_PEOPLE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new person profile
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        name: body.name,
        relationship_type: body.relationshipType,
        user_id: userId,
        traits: {},
        interactions: [],
      })
      .select()
      .single();

    if (error) {
      console.error('[PROFILER_PEOPLE]', 'Error creating profile:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('[PROFILER_PEOPLE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a person profile (by id in body)
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    let query = supabase.from(TABLE).update(updates).eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('[PROFILER_PEOPLE]', 'Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('[PROFILER_PEOPLE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a person profile (by ?id=xxx)
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    let query = supabase.from(TABLE).delete().eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { error } = await query;

    if (error) {
      console.error('[PROFILER_PEOPLE]', 'Error deleting profile:', error);
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PROFILER_PEOPLE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
