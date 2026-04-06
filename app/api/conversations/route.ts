import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all chat sessions with last message preview
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (type) {
      query = query.eq('session_type', type);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,goal_title.ilike.%${search}%`);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Fetch last message for each session
    const sessionsWithPreview = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content, role, created_at')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...session,
          lastMessage: lastMsg?.content?.slice(0, 150) || null,
          lastMessageRole: lastMsg?.role || null,
          lastMessageAt: lastMsg?.created_at || null,
        };
      })
    );

    return NextResponse.json({ sessions: sessionsWithPreview });
  } catch (error) {
    console.error('[CONVERSATIONS GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new chat session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, goal, goal_title, session_type, scenario_id } = body;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        title: title || 'New Chat',
        goal: goal || null,
        goal_title: goal_title || null,
        session_type: session_type || 'general',
        scenario_id: scenario_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error('[CONVERSATIONS POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a chat session by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONVERSATIONS DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
