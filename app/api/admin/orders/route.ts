/**
 * GET /api/admin/orders
 *
 * Returns CUSTOMER SESSIONS — one per buyer — each aggregating all orders
 * (book + bump + upsell) and any subscription from the same email/customer.
 *
 * This matches how most funnel admins think about purchases: "Yury paid $71
 * across one flow and subscribed to monthly" is one session, not 2+ orders.
 *
 * The raw `orders` rows are still preserved and returned inside each session
 * so the detail page can refund individual charges when needed.
 *
 * Query params:
 *   status:  'all' | 'paid' | 'pending' | 'refunded' | 'mixed'  (default 'all')
 *   product: 'all' | 'book' | 'briefing' | 'playbooks' | 'vault'
 *   search:  email substring
 *   from, to: ISO dates
 *   limit: max 500 (default 200)
 *   offset: pagination
 *
 * Returns: { sessions, total, totalRevenueCents, funnel, rawOrderCount }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type OrderRow = {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  items: unknown;
  amount_cents: number;
  currency: string;
  status: string;
  delivered_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  is_test: boolean;
};

type SubRow = {
  id: string;
  email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
};

type SessionStatus = 'paid' | 'pending' | 'refunded' | 'mixed';

type CustomerSession = {
  email: string;
  customer_id: string | null;
  items: string[];                  // union of all items across orders
  order_count: number;
  total_cents: number;               // sum of paid orders only
  pending_cents: number;             // sum of pending orders
  refunded_cents: number;            // sum of refunded orders
  statusCounts: Record<string, number>;
  rolled_up_status: SessionStatus;   // single label for the whole session
  has_subscription: boolean;
  subscription: {
    id: string;
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
  first_at: string;                  // first order timestamp
  latest_at: string;                 // most recent order timestamp
  orders: OrderRow[];                // raw rows for detail page drilldown
  is_test: boolean;                  // true when every order in the session is flagged test
};

function rollupStatus(counts: Record<string, number>): SessionStatus {
  const statuses = Object.keys(counts).filter((s) => counts[s] > 0);
  if (statuses.length === 1) return statuses[0] as SessionStatus;
  if (statuses.includes('paid') && statuses.includes('refunded')) return 'mixed';
  if (statuses.includes('paid') && statuses.includes('pending')) return 'mixed';
  return 'mixed';
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const product = url.searchParams.get('product') || 'all';
    const search = url.searchParams.get('search')?.trim().toLowerCase() || '';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 200), 500);
    const offset = Number(url.searchParams.get('offset') || 0);
    // Test orders are hidden from the list by default. The admin UI
    // exposes an "Include test orders" toggle that sets ?includeTest=1
    // to surface them with a TEST badge.
    const includeTest = url.searchParams.get('includeTest') === '1';

    // Fetch a wide window of orders + subs, then group + filter in memory.
    // This is fine up to low tens of thousands of rows; at scale we'd move
    // the grouping to a SQL view.
    let ordersQuery = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (!includeTest) ordersQuery = ordersQuery.eq('is_test', false);
    const { data: rawOrders, error: ordersErr } = await ordersQuery;
    if (ordersErr) throw ordersErr;

    const orders = (rawOrders ?? []) as OrderRow[];

    let subsQuery = supabase
      .from('subscriptions')
      .select('id, email, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, created_at, is_test')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (!includeTest) subsQuery = subsQuery.eq('is_test', false);
    const { data: rawSubs } = await subsQuery;
    const subs = (rawSubs ?? []) as SubRow[];

    // Index subs by email (primary) + customer_id (fallback)
    const subsByEmail = new Map<string, SubRow>();
    const subsByCustomer = new Map<string, SubRow>();
    for (const s of subs) {
      if (s.email) subsByEmail.set(s.email.toLowerCase(), s);
      if (s.stripe_customer_id) subsByCustomer.set(s.stripe_customer_id, s);
    }

    // Group orders by email (lowercased)
    const bucket = new Map<string, OrderRow[]>();
    for (const o of orders) {
      const key = (o.email || '').toLowerCase();
      if (!key) continue;
      if (!bucket.has(key)) bucket.set(key, []);
      bucket.get(key)!.push(o);
    }

    const sessions: CustomerSession[] = [];
    for (const [email, os] of bucket.entries()) {
      const sorted = [...os].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      const statusCounts: Record<string, number> = {};
      const itemsSet = new Set<string>();
      let totalCents = 0;
      let pendingCents = 0;
      let refundedCents = 0;
      let customerId: string | null = null;

      for (const o of os) {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        for (const it of (o.items as string[]) || []) itemsSet.add(it);
        if (o.stripe_customer_id) customerId = o.stripe_customer_id;
        if (o.status === 'paid') totalCents += o.amount_cents;
        else if (o.status === 'pending') pendingCents += o.amount_cents;
        else if (o.status === 'refunded') refundedCents += o.amount_cents;
      }

      const sub =
        subsByEmail.get(email) ||
        (customerId ? subsByCustomer.get(customerId) : null) ||
        null;

      // A session is "test" when every order row in it is flagged
      // test (cascade from the mark_test action on one order hits
      // every order for that email, so this is normally 0 or all).
      const sessionIsTest = os.length > 0 && os.every((o) => o.is_test === true);

      sessions.push({
        email,
        customer_id: customerId,
        items: Array.from(itemsSet),
        order_count: os.length,
        total_cents: totalCents,
        pending_cents: pendingCents,
        refunded_cents: refundedCents,
        statusCounts,
        rolled_up_status: rollupStatus(statusCounts),
        has_subscription: !!sub,
        subscription: sub
          ? {
              id: sub.id,
              plan: sub.plan,
              status: sub.status,
              current_period_end: sub.current_period_end,
            }
          : null,
        first_at: first.created_at,
        latest_at: last.created_at,
        orders: sorted,
        is_test: sessionIsTest,
      });
    }

    // Also include email-less subscription-only customers (existing SaaS
    // subscribers who never bought the book)
    const emailsWithOrders = new Set(bucket.keys());
    for (const s of subs) {
      const emailKey = (s.email || '').toLowerCase();
      if (emailKey && !emailsWithOrders.has(emailKey)) {
        sessions.push({
          email: s.email!,
          customer_id: s.stripe_customer_id,
          items: [],
          order_count: 0,
          total_cents: 0,
          pending_cents: 0,
          refunded_cents: 0,
          statusCounts: {},
          rolled_up_status: 'paid',
          has_subscription: true,
          subscription: {
            id: s.id,
            plan: s.plan,
            status: s.status,
            current_period_end: s.current_period_end,
          },
          first_at: s.created_at,
          latest_at: s.created_at,
          orders: [],
          is_test: (s as SubRow & { is_test?: boolean }).is_test === true,
        });
      }
    }

    // Sort newest first
    sessions.sort((a, b) => b.latest_at.localeCompare(a.latest_at));

    // Apply filters against sessions
    let filtered = sessions;
    if (status !== 'all') filtered = filtered.filter((s) => s.rolled_up_status === status);
    if (product !== 'all') filtered = filtered.filter((s) => s.items.includes(product));
    if (search) filtered = filtered.filter((s) => s.email.toLowerCase().includes(search));
    if (from) filtered = filtered.filter((s) => s.first_at >= from);
    if (to) filtered = filtered.filter((s) => s.latest_at <= to);

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    // Filtered revenue
    let totalRevenueCents = 0;
    for (const s of filtered) totalRevenueCents += s.total_cents;

    // Global funnel stats (unfiltered)
    const bookPaid = new Set<string>();
    const bumpPaid = new Set<string>();
    const upsell1Paid = new Set<string>();
    for (const s of sessions) {
      if (s.items.includes('book') && s.statusCounts.paid) bookPaid.add(s.email);
      if (s.items.includes('briefing') && s.statusCounts.paid) bumpPaid.add(s.email);
      if ((s.items.includes('playbooks') || s.items.includes('vault')) && s.statusCounts.paid) {
        upsell1Paid.add(s.email);
      }
    }
    const upsell2Taken = sessions.filter(
      (s) => s.has_subscription && s.items.includes('book')
    ).length;

    return NextResponse.json({
      sessions: paged,
      total,
      totalRevenueCents,
      rawOrderCount: orders.length,
      funnel: {
        bookBuyers: bookPaid.size,
        bumpTakers: bumpPaid.size,
        upsell1Takers: upsell1Paid.size,
        upsell2Takers: upsell2Taken,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/orders GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
