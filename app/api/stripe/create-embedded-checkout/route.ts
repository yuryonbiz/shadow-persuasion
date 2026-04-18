import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const PLAN_CONFIG = {
  weekly: { name: 'Weekly', amount: 995, interval: 'week' as const },
  monthly: { name: 'Monthly', amount: 3495, interval: 'month' as const },
  yearly: { name: 'Yearly', amount: 19595, interval: 'year' as const },
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: 'plan is required' }, { status: 400 });
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
    if (!config) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://shadowpersuasion.com';

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Shadow Persuasion - ${config.name}` },
          unit_amount: config.amount,
          recurring: { interval: config.interval, interval_count: 1 },
        },
        quantity: 1,
      }],
      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      allow_promotion_codes: false,
      subscription_data: { metadata: { plan } },
      metadata: { plan },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    const msg = err?.message || String(err);
    const code = err?.code || err?.type || 'unknown';
    console.error('[STRIPE EMBEDDED-CHECKOUT]', JSON.stringify({ message: msg, code, type: err?.type, statusCode: err?.statusCode }));
    return NextResponse.json({ error: msg, code }, { status: 500 });
  }
}
