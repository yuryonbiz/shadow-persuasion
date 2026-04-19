/**
 * GET /api/orders/by-pi?pi=<payment_intent_id>
 *
 * Returns the aggregated order info associated with a given original
 * PaymentIntent: email, every item purchased across the main order and
 * any upsell charges that share this `original_pi`, and whether a
 * subscription was created.
 *
 * Used by /lp/thank-you to render download links.
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
    const pi = url.searchParams.get('pi');
    if (!pi) {
      return NextResponse.json({ error: 'pi query param required' }, { status: 400 });
    }

    // Order row for the original PaymentIntent (book checkout)
    const { data: primary } = await supabase
      .from('orders')
      .select('email, items, status, metadata, stripe_customer_id')
      .eq('stripe_payment_intent_id', pi)
      .maybeSingle();

    // Also fetch any orders whose metadata.original_pi points to this pi
    // (e.g. the upsell-playbooks charge)
    const { data: related } = await supabase
      .from('orders')
      .select('items, status')
      .contains('metadata', { original_pi: pi });

    if (!primary && (!related || related.length === 0)) {
      return NextResponse.json({ items: [], email: null }, { status: 200 });
    }

    const allItems = new Set<string>();
    for (const it of (primary?.items as string[] | undefined) ?? []) allItems.add(it);
    for (const row of related ?? []) {
      if (row.status === 'paid') {
        for (const it of (row.items as string[] | undefined) ?? []) allItems.add(it);
      }
    }

    return NextResponse.json({
      email: primary?.email ?? null,
      items: Array.from(allItems),
      status: primary?.status ?? 'unknown',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[orders/by-pi] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
