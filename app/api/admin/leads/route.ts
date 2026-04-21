/**
 * GET /api/admin/leads
 *
 * Returns all checkout leads with stats summary for the admin dashboard.
 *
 * Query params:
 *   status: 'all' | 'created' | 'recovery_sent_1' | 'recovery_sent_2' |
 *           'recovery_sent_3' | 'converted' | 'recovered' | 'abandoned'
 *           (default 'all')
 *   search: email substring (optional)
 *   from, to: ISO date range (optional)
 *   limit: max 500 (default 200)
 *   offset: pagination (default 0)
 *
 * Returns: { leads, total, stats }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search')?.trim().toLowerCase() || '';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 200), 500);
    const offset = Number(url.searchParams.get('offset') || 0);
    // Admin can opt in to seeing test leads (those whose linked order
    // was flagged via the mark-test action). Off by default so the
    // metrics on this page stay real.
    const includeTest = url.searchParams.get('includeTest') === '1';

    let query = supabase.from('checkout_leads').select('*', { count: 'exact' });
    if (!includeTest) query = query.eq('is_test', false);
    if (status !== 'all') query = query.eq('status', status);
    if (search) query = query.ilike('email', `%${search}%`);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: leads, count, error } = await query;
    if (error) throw error;

    // Stats across the FULL dataset (excluding test leads always —
    // these numbers drive the KPI cards, so keep them real).
    const { data: allLeads } = await supabase
      .from('checkout_leads')
      .select('status, recovered_by_email_step, amount_cents, created_at, converted_at')
      .eq('is_test', false);

    const all = allLeads ?? [];
    const total = all.length;

    const byStatus: Record<string, number> = {
      created: 0,
      recovery_sent_1: 0,
      recovery_sent_2: 0,
      recovery_sent_3: 0,
      converted: 0,
      recovered: 0,
      abandoned: 0,
    };
    let conversionRevenueCents = 0;
    let recoveryRevenueCents = 0;
    const recoveryByStep: Record<string, number> = { '1': 0, '2': 0, '3': 0 };

    for (const l of all) {
      if (l.status in byStatus) byStatus[l.status] += 1;
      if (l.status === 'converted' && l.amount_cents) {
        conversionRevenueCents += l.amount_cents;
      }
      if (l.status === 'recovered' && l.amount_cents) {
        recoveryRevenueCents += l.amount_cents;
        const step = String(l.recovered_by_email_step ?? '');
        if (step in recoveryByStep) recoveryByStep[step] += 1;
      }
    }

    const converted = byStatus.converted + byStatus.recovered;
    const emailsSent =
      byStatus.recovery_sent_1 +
      byStatus.recovery_sent_2 +
      byStatus.recovery_sent_3 +
      byStatus.abandoned +
      byStatus.recovered;

    // Last 24h
    const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const last24h = all.filter((l) => l.created_at >= day).length;

    return NextResponse.json({
      leads: leads ?? [],
      total: count ?? 0,
      stats: {
        total,
        byStatus,
        converted,
        conversionRate: total ? (converted / total) * 100 : 0,
        recoveryRate: emailsSent ? (byStatus.recovered / emailsSent) * 100 : 0,
        conversionRevenueCents,
        recoveryRevenueCents,
        recoveryByStep,
        last24h,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/leads GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
