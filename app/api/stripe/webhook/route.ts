import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Extract the current_period_end from a subscription.
 * In Stripe SDK v22+ (API 2026-03-25), current_period_end lives on items, not the subscription.
 */
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  if (periodEnd) {
    return new Date(periodEnd * 1000).toISOString();
  }
  // Fallback: use trial_end or current time
  if (subscription.trial_end) {
    return new Date(subscription.trial_end * 1000).toISOString();
  }
  return new Date().toISOString();
}

/**
 * Extract subscription ID from an invoice.
 * In Stripe SDK v22+, subscription is under parent.subscription_details.
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === 'string' ? sub : sub.id;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || 'unknown';

        if (!userId) {
          console.error('[STRIPE WEBHOOK] No userId in checkout.session.completed');
          break;
        }

        // Retrieve the subscription to get period details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const { error } = await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan,
            status: subscription.status === 'trialing' ? 'trialing' : 'active',
            current_period_end: getSubscriptionPeriodEnd(subscription),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          console.error('[STRIPE WEBHOOK] Supabase upsert error (checkout):', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Try to find by stripe_subscription_id
          const { data } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (!data) {
            console.error('[STRIPE WEBHOOK] No userId for subscription.updated:', subscription.id);
            break;
          }

          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : subscription.status,
              current_period_end: getSubscriptionPeriodEnd(subscription),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', data.user_id);

          if (error) {
            console.error('[STRIPE WEBHOOK] Supabase update error (sub.updated):', error);
          }
          break;
        }

        const { error } = await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status === 'active' ? 'active' : subscription.status,
            current_period_end: getSubscriptionPeriodEnd(subscription),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          console.error('[STRIPE WEBHOOK] Supabase upsert error (sub.updated):', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        const filter = userId
          ? { column: 'user_id', value: userId }
          : { column: 'stripe_subscription_id', value: subscription.id };

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq(filter.column, filter.value);

        if (error) {
          console.error('[STRIPE WEBHOOK] Supabase update error (sub.deleted):', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getSubscriptionIdFromInvoice(invoice);

        if (!subscriptionId) {
          console.error('[STRIPE WEBHOOK] No subscription ID in invoice.payment_failed');
          break;
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('[STRIPE WEBHOOK] Supabase update error (payment_failed):', error);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
