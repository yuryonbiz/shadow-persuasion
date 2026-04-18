import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Fetch all registered users
    const { data: registeredUsers, error: usersError } = await supabase
      .from('users')
      .select('firebase_uid, email, display_name, created_at, last_login_at');

    if (usersError) {
      console.error('[ADMIN_USERS] users query error:', usersError);
    }

    // 2. Fetch all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, status, current_period_end, stripe_customer_id, updated_at');

    if (subError) {
      console.error('[ADMIN_USERS] subscriptions query error:', subError);
    }

    // 3. Fetch session counts per user
    const { data: sessions, error: sessError } = await supabase
      .from('chat_sessions')
      .select('user_id, created_at, updated_at');

    if (sessError) {
      console.error('[ADMIN_USERS] chat_sessions query error:', sessError);
    }

    // 4. Fetch message counts per session
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('session_id, created_at');

    if (msgError) {
      console.error('[ADMIN_USERS] chat_messages query error:', msgError);
    }

    // Build session -> user_id map
    const sessionUserMap: Record<string, string> = {};
    const userSessionCounts: Record<string, number> = {};
    const userLastActive: Record<string, string> = {};

    for (const s of sessions || []) {
      if (!s.user_id) continue;
      sessionUserMap[s.id ?? ''] = s.user_id;
      userSessionCounts[s.user_id] = (userSessionCounts[s.user_id] || 0) + 1;
      const activity = s.updated_at || s.created_at;
      if (!userLastActive[s.user_id] || activity > userLastActive[s.user_id]) {
        userLastActive[s.user_id] = activity;
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

    // Build user list from registered users (primary source)
    const seenIds = new Set<string>();
    const users: any[] = [];

    for (const u of registeredUsers || []) {
      seenIds.add(u.firebase_uid);
      const sub = subMap[u.firebase_uid];
      users.push({
        user_id: u.firebase_uid,
        email: u.email,
        display_name: u.display_name,
        registered_at: u.created_at,
        last_login_at: u.last_login_at,
        last_active: userLastActive[u.firebase_uid] || u.last_login_at,
        total_sessions: userSessionCounts[u.firebase_uid] || 0,
        total_messages: userMessages[u.firebase_uid] || 0,
        subscription_status: sub?.status || null,
        subscription_plan: sub?.plan || null,
        subscription_period_end: sub?.current_period_end || null,
        stripe_customer_id: sub?.stripe_customer_id || null,
      });
    }

    // Also include users from sessions/subscriptions not yet in users table
    for (const uid of [...Object.keys(userSessionCounts), ...Object.keys(subMap)]) {
      if (seenIds.has(uid)) continue;
      seenIds.add(uid);
      const sub = subMap[uid];
      users.push({
        user_id: uid,
        email: null,
        display_name: null,
        registered_at: null,
        last_login_at: null,
        last_active: userLastActive[uid] || null,
        total_sessions: userSessionCounts[uid] || 0,
        total_messages: userMessages[uid] || 0,
        subscription_status: sub?.status || null,
        subscription_plan: sub?.plan || null,
        subscription_period_end: sub?.current_period_end || null,
        stripe_customer_id: sub?.stripe_customer_id || null,
      });
    }

    // Sort by registered_at descending (newest first), nulls last
    users.sort((a, b) => {
      const aDate = a.registered_at || a.last_active;
      const bDate = b.registered_at || b.last_active;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('[ADMIN_USERS]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Admin actions on a user's subscription
export async function POST(req: NextRequest) {
  try {
    const { action, userId, plan, status } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (action === 'grant') {
      // Grant or change a subscription manually (no Stripe involved)
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: plan || 'monthly',
          status: 'active',
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'granted', plan: plan || 'monthly' });
    }

    if (action === 'change_plan') {
      const { error } = await supabase
        .from('subscriptions')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'plan_changed', plan });
    }

    if (action === 'revoke') {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'revoked' });
    }

    if (action === 'activate') {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true, action: 'activated' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[ADMIN_USERS]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
