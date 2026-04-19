/**
 * POST /api/checkout/upsell-playbooks
 *
 * One-click upsell charge. Charges the saved payment method from the
 * original book purchase for the Playbooks + Vault bundle ($47).
 *
 * Body: { paymentIntentId: string }  (the original book PaymentIntent — we
 *        use it to look up customer + payment method.)
 * Returns: { success: true, orderId, amount } | { success: false, error }
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { UPSELL_PLAYBOOKS_BUNDLE, describeOrder, type ProductSlug } from '@/lib/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentIntentId = String(body?.paymentIntentId || '').trim();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId required' }, { status: 400 });
    }

    // Look up the original order to recover customer + payment method
    const originalIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (originalIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Original payment has not succeeded yet' },
        { status: 400 }
      );
    }

    const customerId =
      typeof originalIntent.customer === 'string'
        ? originalIntent.customer
        : originalIntent.customer?.id;
    const paymentMethodId =
      typeof originalIntent.payment_method === 'string'
        ? originalIntent.payment_method
        : originalIntent.payment_method?.id;

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Unable to find saved customer/payment method' },
        { status: 400 }
      );
    }

    // Fetch the email from the original customer for receipts + order row
    const customer = await stripe.customers.retrieve(customerId);
    const email =
      !customer.deleted && 'email' in customer ? customer.email || '' : '';

    const items: ProductSlug[] = [...UPSELL_PLAYBOOKS_BUNDLE.items];
    const amount = UPSELL_PLAYBOOKS_BUNDLE.priceCents;

    // Attempt the off-session charge
    let upsellIntent;
    try {
      upsellIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: describeOrder(items),
        receipt_email: email || undefined,
        metadata: {
          funnel: 'upsell_playbooks',
          items: items.join(','),
          original_pi: paymentIntentId,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Common path: card requires authentication (3DS). Return the intent
      // so the client can confirm via Stripe.js.
      const stripeErr = err as { raw?: { payment_intent?: { client_secret?: string; id?: string } } };
      if (stripeErr?.raw?.payment_intent?.client_secret) {
        return NextResponse.json(
          {
            requiresAction: true,
            clientSecret: stripeErr.raw.payment_intent.client_secret,
            paymentIntentId: stripeErr.raw.payment_intent.id,
          },
          { status: 402 }
        );
      }
      console.error('[upsell-playbooks] charge failed:', msg);
      return NextResponse.json({ error: msg }, { status: 402 });
    }

    // Insert an order row for this upsell
    const { data: order } = await supabase
      .from('orders')
      .insert({
        email,
        stripe_customer_id: customerId,
        stripe_payment_intent_id: upsellIntent.id,
        stripe_payment_method_id: paymentMethodId,
        items,
        amount_cents: amount,
        currency: 'usd',
        status: upsellIntent.status === 'succeeded' ? 'paid' : 'pending',
        metadata: { original_pi: paymentIntentId },
      })
      .select('id')
      .single();

    return NextResponse.json({
      success: upsellIntent.status === 'succeeded',
      orderId: order?.id ?? null,
      paymentIntentId: upsellIntent.id,
      amount,
      items,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[upsell-playbooks] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
