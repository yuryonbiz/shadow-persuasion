/**
 * POST /api/checkout/book
 *
 * Creates a Stripe PaymentIntent for the $7 book (optionally bundled with
 * the $17 Pre-Conversation Briefing order bump). Uses setup_future_usage
 * so the saved payment method can be charged off-session for upsells.
 *
 * Body: { email: string, name?: string, includeBump?: boolean }
 * Returns: { clientSecret, orderId, amount, items }
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { computeTotalCents, describeOrder, type ProductSlug } from '@/lib/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const name = body?.name ? String(body.name).trim() : undefined;
    const includeBump = Boolean(body?.includeBump);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const items: ProductSlug[] = includeBump ? ['book', 'briefing'] : ['book'];
    const amount = computeTotalCents(items);

    if (amount < 50) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    // Find or create a Stripe customer keyed on email
    let customerId: string;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      if (name && !existing.data[0].name) {
        await stripe.customers.update(customerId, { name });
      }
    } else {
      const created = await stripe.customers.create({
        email,
        ...(name ? { name } : {}),
        metadata: { source: 'book_checkout' },
      });
      customerId = created.id;
    }

    // Create the PaymentIntent with setup_future_usage for one-click upsells
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      setup_future_usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      description: describeOrder(items),
      receipt_email: email,
      metadata: {
        funnel: 'book_checkout',
        items: items.join(','),
      },
    });

    // Pre-create the order row (status=pending). Webhook flips to paid.
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        email,
        stripe_customer_id: customerId,
        stripe_payment_intent_id: intent.id,
        items,
        amount_cents: amount,
        currency: 'usd',
        status: 'pending',
        metadata: name ? { name } : {},
      })
      .select('id')
      .single();

    if (orderErr) {
      console.error('[checkout/book] order insert failed:', orderErr);
      // Non-fatal: the webhook can still create the order later.
    }

    return NextResponse.json({
      clientSecret: intent.client_secret,
      orderId: order?.id ?? null,
      paymentIntentId: intent.id,
      amount,
      items,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[checkout/book] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
