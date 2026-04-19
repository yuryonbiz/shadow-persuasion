/**
 * POST /api/checkout/upsell-app
 *
 * One-click SaaS subscription. Creates a Stripe Subscription for the
 * shadowpersuasion.com app using the saved payment method from the
 * original book PaymentIntent.
 *
 * Body: { paymentIntentId: string, plan: 'weekly'|'monthly'|'yearly' }
 * Returns: { success: true, subscriptionId } | { error }
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

type PlanKey = 'weekly' | 'monthly' | 'yearly';

const PLAN_CONFIG: Record<PlanKey, { name: string; amount: number; interval: 'week' | 'month' | 'year' }> = {
  weekly:  { name: 'Weekly',  amount: 995,   interval: 'week'  },
  monthly: { name: 'Monthly', amount: 3495,  interval: 'month' },
  yearly:  { name: 'Yearly',  amount: 19595, interval: 'year'  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentIntentId = String(body?.paymentIntentId || '').trim();
    const plan = (body?.plan || 'monthly') as PlanKey;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId required' }, { status: 400 });
    }
    const config = PLAN_CONFIG[plan];
    if (!config) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Recover customer + payment method from the original book PaymentIntent
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

    // Attach payment method as default for invoices on the customer
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Stripe subscription `price_data` doesn't support inline product_data,
    // so create a Price (with product_data, which Prices DO support) first,
    // then attach the Price to the subscription.
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: config.amount,
      recurring: { interval: config.interval, interval_count: 1 },
      product_data: { name: `Shadow Persuasion - ${config.name}` },
      metadata: { plan, funnel: 'upsell_app' },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      off_session: true,
      payment_behavior: 'error_if_incomplete',
      metadata: {
        plan,
        funnel: 'upsell_app',
        original_pi: paymentIntentId,
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return NextResponse.json({
      success: subscription.status === 'active' || subscription.status === 'trialing',
      subscriptionId: subscription.id,
      status: subscription.status,
      plan,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // If Stripe returned a structured error with a requires_action payment intent,
    // surface that so the client could do 3DS auth (rare for saved cards).
    const stripeErr = err as { raw?: { payment_intent?: { client_secret?: string } } };
    if (stripeErr?.raw?.payment_intent?.client_secret) {
      return NextResponse.json(
        {
          requiresAction: true,
          clientSecret: stripeErr.raw.payment_intent.client_secret,
        },
        { status: 402 }
      );
    }
    console.error('[upsell-app] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
