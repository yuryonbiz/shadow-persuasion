/**
 * GET /api/admin/dashboard
 *
 * Returns top-level metrics for the admin dashboard:
 *   - Orders: total / paid / refunded / last 24h
 *   - Revenue: all-time / last 24h
 *   - Members: total / active
 *   - Knowledge base: books / chunks
 *
 * (Admin-gated by client-side useAdmin check; API itself is not currently
 * locked down — we trust the browser redirect for non-admins. Fix later
 * with a server-side admin token if needed.)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Orders aggregate — group by email so one "order" = one customer session.
    // Test orders (is_test = true) are filtered out so dashboard metrics
    // reflect real revenue / conversions only. The admin can still see
    // test orders individually in /app/admin/orders with the "Include
    // test orders" toggle.
    const { data: ordersAll } = await supabase
      .from('orders')
      .select('email, amount_cents, status, created_at')
      .eq('is_test', false);

    const rawOrders = ordersAll ?? [];

    // Bucket by email for customer-session semantics
    const sessionsByEmail = new Map<string, {
      firstAt: string;
      hasPaid: boolean;
      hasPending: boolean;
      hasRefunded: boolean;
      totalPaidCents: number;
      paidInLast24h: boolean;
    }>();

    for (const o of rawOrders) {
      const email = (o.email || '').toLowerCase();
      if (!email) continue;
      const bucket = sessionsByEmail.get(email) || {
        firstAt: o.created_at,
        hasPaid: false,
        hasPending: false,
        hasRefunded: false,
        totalPaidCents: 0,
        paidInLast24h: false,
      };
      if (o.status === 'paid') {
        bucket.hasPaid = true;
        bucket.totalPaidCents += o.amount_cents ?? 0;
        if (o.created_at >= yesterday) bucket.paidInLast24h = true;
      } else if (o.status === 'pending') bucket.hasPending = true;
      else if (o.status === 'refunded') bucket.hasRefunded = true;
      if (o.created_at < bucket.firstAt) bucket.firstAt = o.created_at;
      sessionsByEmail.set(email, bucket);
    }

    const sessions = Array.from(sessionsByEmail.values());
    const paidSessions = sessions.filter((s) => s.hasPaid && !s.hasRefunded);
    const refundedSessions = sessions.filter((s) => s.hasRefunded);
    const recentSessions = sessions.filter((s) => s.paidInLast24h);

    const revenueCents = paidSessions.reduce((sum, s) => sum + s.totalPaidCents, 0);
    const last24hRevenueCents = recentSessions.reduce(
      (sum, s) => sum + s.totalPaidCents,
      0
    );

    // Members / subscriptions — exclude test subscriptions from dashboard counts
    const { count: membersTotal } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_test', false);

    const { count: membersActive } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing'])
      .eq('is_test', false);

    // Knowledge base: count distinct books via SQL RPC would be best, but a
    // simple select+dedup gets us there without migration.
    const { data: chunksAll } = await supabase
      .from('knowledge_chunks')
      .select('book_title');

    const chunks = chunksAll ?? [];
    const uniqueBooks = new Set(chunks.map((c) => c.book_title).filter(Boolean)).size;

    return NextResponse.json({
      stats: {
        // "ordersTotal" now = customer sessions (one per email), not raw Stripe
        // charges. A single funnel completion that hits book+bump+upsell = 1.
        ordersTotal: sessions.length,
        ordersPaid: paidSessions.length,
        ordersRefunded: refundedSessions.length,
        rawChargesTotal: rawOrders.length,
        revenueCents,
        last24hOrders: recentSessions.length,
        last24hRevenueCents,
        membersTotal: membersTotal ?? 0,
        membersActive: membersActive ?? 0,
        booksTotal: uniqueBooks,
        chunksTotal: chunks.length,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/dashboard]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
