import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const PLAN_CONFIG = {
  weekly: {
    name: 'Weekly',
    amount: 995,
    interval: 'week' as const,
  },
  monthly: {
    name: 'Monthly',
    amount: 3495,
    interval: 'month' as const,
  },
  yearly: {
    name: 'Yearly',
    amount: 19595,
    interval: 'year' as const,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: plan, userId, email' },
        { status: 400 }
      );
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be weekly, monthly, or yearly.' },
        { status: 400 }
      );
    }

    // Check for existing Stripe customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customerId: string | undefined;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    }

    const origin = req.headers.get('origin') || '';

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shadow Persuasion - ${config.name}`,
            },
            unit_amount: config.amount,
            recurring: {
              interval: config.interval,
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancelled`,
      client_reference_id: userId,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 0,
        metadata: { userId, plan },
      },
      metadata: { userId, plan },
    };

    // Use existing customer ID or pass email for new customer creation
    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[STRIPE CREATE-CHECKOUT]', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
