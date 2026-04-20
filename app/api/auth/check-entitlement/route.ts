/**
 * POST /api/auth/check-entitlement
 *
 * Gates /login signup. We only allow registration for emails that have
 * already paid for SaaS access — either through the upsell flow
 * (/lp/upsell-app → /api/checkout/upsell-app) or the standalone flow
 * (/checkout?plan=X → Stripe Checkout Session).
 *
 * Body:    { email: string }
 * Returns: { entitled: boolean, reason?: 'no_subscription' | 'expired' }
 *
 * Note: this is an "eventual-consistency" check — the Stripe webhook
 * writes the subscription row; if the user submits signup faster than
 * the webhook lands, we'd tell them "no subscription" even though
 * they did pay. We mitigate by also checking recent `orders` for an
 * in-flight SaaS purchase. If /checkout/success just redirected them,
 * the order might exist before the sub.
 *
 * The book alone does NOT grant access — only a subscription does.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Hard-coded fallback mirroring lib/admin.ts and /api/settings.
// Admins are always entitled so they can create/recreate their own
// accounts without having to buy a sub.
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

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const email = (body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { entitled: false, reason: 'missing_email' },
        { status: 400 }
      );
    }

    // Admin bypass — never lock admins out.
    if (await isAdminEmail(email)) {
      return NextResponse.json({ entitled: true, reason: 'admin' });
    }

    // Primary signal: subscriptions table. Anyone with a sub row whose
    // status is active/trialing, OR whose period hasn't ended yet, gets in.
    const { data: subs, error: subErr } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, plan')
      .ilike('email', email);
    if (subErr) throw subErr;

    const now = new Date();
    const hasValidSub = (subs ?? []).some((s) => {
      const status = (s.status || '').toLowerCase();
      if (status === 'active' || status === 'trialing' || status === 'past_due') {
        return true;
      }
      // Cancelled-but-not-yet-expired subs still grant access through period end.
      if (status === 'cancelled' || status === 'canceled') {
        if (s.current_period_end) {
          return new Date(s.current_period_end) > now;
        }
      }
      return false;
    });

    if (hasValidSub) {
      return NextResponse.json({ entitled: true });
    }

    // Secondary signal: a `paid` order whose items include an app-access
    // product, for the rare case where the sub row hasn't landed yet.
    // Book/bump/playbooks/vault do NOT grant app access — they are
    // info products.
    // (We don't currently sell "app" as a one-time order, so this is a
    // forward-compat hook for the lifetime/one-time plan if we add it.)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('items, status, created_at')
      .ilike('email', email)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(5);

    const hasAppOrder = (recentOrders ?? []).some((o) => {
      const items = (o.items as string[]) || [];
      return items.includes('app') || items.includes('lifetime');
    });

    if (hasAppOrder) {
      return NextResponse.json({ entitled: true });
    }

    return NextResponse.json({ entitled: false, reason: 'no_subscription' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth/check-entitlement]', msg);
    // Fail closed — if the DB is down, don't create orphan Firebase users.
    return NextResponse.json(
      { entitled: false, reason: 'error', error: msg },
      { status: 500 }
    );
  }
}
