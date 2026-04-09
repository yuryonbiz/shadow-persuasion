import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TABLE = 'user_profiles_people';

// Map snake_case DB row to camelCase for frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    relationshipType: row.relationship_type,
    traits: row.traits || {},
    interactions: row.interactions || [],
    playbook: row.playbook,
    confidenceScore: row.confidence_score,
    keyTraitTags: row.key_trait_tags,
    riskLevel: row.risk_level,
    nextRecommendedAction: row.next_recommended_action,
    tags: row.tags,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
      return NextResponse.json({ error: 'Failed to fetch people profiles', details: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ profiles: (data || []).map(mapProfile) });
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
        relationship_type: body.relationshipType || 'Other',
        user_id: userId,
        traits: body.traits || {},
        interactions: body.interactions || [],
      })
      .select()
      .single();

    if (error) {
      console.error('[PROFILER_PEOPLE]', 'Error creating profile:', error);
      return NextResponse.json({ error: 'Failed to create profile', details: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ profile: mapProfile(data) });
  } catch (error) {
    console.error('[PROFILER_PEOPLE]', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
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

    return NextResponse.json({ profile: mapProfile(data) });
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
