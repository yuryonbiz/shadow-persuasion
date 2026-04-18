import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Fetch all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, status, current_period_end, stripe_customer_id, updated_at');

    if (subError) {
      console.error('[ADMIN_USERS] subscriptions query error:', subError);
    }

    // 2. Fetch unique user_ids from chat_sessions with first and last activity, plus session count
    const { data: sessions, error: sessError } = await supabase
      .from('chat_sessions')
      .select('user_id, created_at, updated_at');

    if (sessError) {
      console.error('[ADMIN_USERS] chat_sessions query error:', sessError);
    }

    // 3. Fetch message counts per session, then we'll map to user
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('session_id, created_at');

    if (msgError) {
      console.error('[ADMIN_USERS] chat_messages query error:', msgError);
    }

    // Build session -> user_id map and per-session message counts
    const sessionUserMap: Record<string, string> = {};
    const userSessions: Record<string, { count: number; firstSeen: string; lastActive: string }> = {};

    for (const s of sessions || []) {
      if (!s.user_id) continue;
      sessionUserMap[s.id ?? ''] = s.user_id;

      if (!userSessions[s.user_id]) {
        userSessions[s.user_id] = {
          count: 0,
          firstSeen: s.created_at,
          lastActive: s.updated_at || s.created_at,
        };
      }
      userSessions[s.user_id].count++;

      // Track earliest and latest
      if (s.created_at < userSessions[s.user_id].firstSeen) {
        userSessions[s.user_id].firstSeen = s.created_at;
      }
      const activity = s.updated_at || s.created_at;
      if (activity > userSessions[s.user_id].lastActive) {
        userSessions[s.user_id].lastActive = activity;
      }
    }

    // Count messages per user
    const userMessages: Record<string, number> = {};
    for (const m of messages || []) {
      const userId = sessionUserMap[m.session_id];
      if (!userId) continue;
      userMessages[userId] = (userMessages[userId] || 0) + 1;
    }

    // Build subscription map
    const subMap: Record<string, {
      plan: string;
      status: string;
      current_period_end: string | null;
      stripe_customer_id: string | null;
    }> = {};
    for (const sub of subscriptions || []) {
      if (!sub.user_id) continue;
      subMap[sub.user_id] = {
        plan: sub.plan || 'unknown',
        status: sub.status || 'unknown',
        current_period_end: sub.current_period_end || null,
        stripe_customer_id: sub.stripe_customer_id || null,
      };
    }

    // Merge all user IDs from all sources
    const allUserIds = new Set<string>();
    for (const uid of Object.keys(userSessions)) allUserIds.add(uid);
    for (const uid of Object.keys(subMap)) allUserIds.add(uid);

    // Build final user list
    const users = Array.from(allUserIds).map(userId => {
      const session = userSessions[userId];
      const sub = subMap[userId];

      return {
        user_id: userId,
        first_seen: session?.firstSeen || null,
        last_active: session?.lastActive || null,
        total_sessions: session?.count || 0,
        total_messages: userMessages[userId] || 0,
        subscription_status: sub?.status || null,
        subscription_plan: sub?.plan || null,
        subscription_period_end: sub?.current_period_end || null,
        stripe_customer_id: sub?.stripe_customer_id || null,
      };
    });

    // Sort by first_seen descending (newest first), nulls last
    users.sort((a, b) => {
      if (!a.first_seen && !b.first_seen) return 0;
      if (!a.first_seen) return 1;
      if (!b.first_seen) return -1;
      return new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime();
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('[ADMIN_USERS]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
