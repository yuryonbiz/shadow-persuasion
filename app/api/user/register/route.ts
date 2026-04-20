/**
 * POST /api/user/register
 *
 * Called from auth-context on every Firebase auth-state change to upsert
 * a row in the `users` table. This is also the server-side backstop for
 * the entitlement gate on /login — even if the UI gate is bypassed, we
 * refuse to register a Supabase user row without a paid subscription.
 *
 * On a successful first register, we also RECONCILE: if there's a
 * subscription row with `user_id = stripe_<customer_id>` whose email
 * matches the new Firebase user, we rebind it to the firebase_uid so
 * the admin view and downstream app-entitlement logic see a single
 * user, not two.
 *
 * Returns:
 *   200 { success: true }                 — registered (or already existed)
 *   403 { error: 'not_entitled' }         — no paid subscription for email
 *   500 { error: <message> }              — unexpected failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FALLBACK_ADMIN_EMAILS = ['ybyalik@gmail.com'];

async function isAdminEmail(email: string): Promise<boolean> {
  const lower = email.toLowerCase();
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_emails')
      .single();
    const admins = ((data?.value as string[]) ?? FALLBACK_ADMIN_EMAILS).map((e) =>
      e.toLowerCase()
    );
    return admins.includes(lower);
  } catch {
    return FALLBACK_ADMIN_EMAILS.includes(lower);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { email, displayName } = await req.json();
    const emailLower = email ? String(email).toLowerCase() : null;

    // If a row already exists for this firebase_uid, they've been
    // admitted before — just refresh last_login_at and move on.
    const { data: existing } = await supabase
      .from('users')
      .select('firebase_uid')
      .eq('firebase_uid', userId)
      .maybeSingle();

    const isFirstRegistration = !existing;

    // First-time registration → enforce the entitlement gate.
    if (isFirstRegistration) {
      if (!emailLower) {
        return NextResponse.json(
          { error: 'not_entitled', reason: 'missing_email' },
          { status: 403 }
        );
      }
      // Admin bypass — never block admin emails.
      const isAdmin = await isAdminEmail(emailLower);
      if (!isAdmin) {
        const entitled = await checkEntitlement(emailLower);
        if (!entitled) {
          return NextResponse.json(
            { error: 'not_entitled', reason: 'no_subscription' },
            { status: 403 }
          );
        }
      }
    }

    // Upsert the users row.
    const { error: userErr } = await supabase
      .from('users')
      .upsert(
        {
          firebase_uid: userId,
          email: email || null,
          display_name: displayName || null,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'firebase_uid' }
      );
    if (userErr) throw userErr;

    // On first registration, reconcile any guest-checkout subscription
    // that was parked under `user_id = stripe_<customer>` with the new
    // firebase_uid so the admin + app see a single account.
    if (isFirstRegistration && emailLower) {
      const { data: guestSubs } = await supabase
        .from('subscriptions')
        .select('user_id')
        .ilike('email', emailLower)
        .like('user_id', 'stripe_%');

      for (const s of guestSubs ?? []) {
        const { error: relinkErr } = await supabase
          .from('subscriptions')
          .update({ user_id: userId, updated_at: new Date().toISOString() })
          .eq('user_id', s.user_id);
        if (relinkErr) {
          // Likely a unique-constraint collision because a row for this
          // firebase_uid already exists. Safe to ignore — the valid row
          // wins, and the stale stripe_* row can be cleaned up manually.
          console.warn('[USER_REGISTER] relink subscription failed:', relinkErr.message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[USER_REGISTER]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Same entitlement rule as /api/auth/check-entitlement. Kept duplicated
 * here so the gate can't be bypassed by a caller skipping the public
 * check endpoint.
 */
async function checkEntitlement(email: string): Promise<boolean> {
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .ilike('email', email);

  const now = new Date();
  const hasValidSub = (subs ?? []).some((s) => {
    const status = (s.status || '').toLowerCase();
    if (status === 'active' || status === 'trialing' || status === 'past_due') {
      return true;
    }
    if ((status === 'cancelled' || status === 'canceled') && s.current_period_end) {
      return new Date(s.current_period_end) > now;
    }
    return false;
  });
  if (hasValidSub) return true;

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('items, status')
    .ilike('email', email)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5);
  const hasAppOrder = (recentOrders ?? []).some((o) => {
    const items = (o.items as string[]) || [];
    return items.includes('app') || items.includes('lifetime');
  });
  return hasAppOrder;
}
