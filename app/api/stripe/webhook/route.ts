import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendDeliveryEmail } from '@/lib/email';
import type { ProductSlug } from '@/lib/pricing';

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
        const plan = session.metadata?.plan || 'unknown';
        const customerEmail = session.customer_details?.email || session.customer_email || null;
        const userId = session.client_reference_id || session.metadata?.userId || null;

        // Retrieve the subscription to get period details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const subscriptionData: any = {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          status: subscription.status === 'trialing' ? 'trialing' : 'active',
          current_period_end: getSubscriptionPeriodEnd(subscription),
          email: customerEmail,
          updated_at: new Date().toISOString(),
        };

        if (userId) {
          // User was logged in during checkout
          subscriptionData.user_id = userId;
          const { error } = await supabase.from('subscriptions').upsert(
            subscriptionData,
            { onConflict: 'user_id' }
          );
          if (error) console.error('[STRIPE WEBHOOK] Supabase upsert error (checkout):', error);
        } else {
          // User paid without logging in — store by stripe_customer_id
          // Will be linked to their account when they sign up with the same email
          subscriptionData.user_id = `stripe_${session.customer}`;
          const { error } = await supabase.from('subscriptions').insert(subscriptionData);
          if (error) console.error('[STRIPE WEBHOOK] Supabase insert error (checkout):', error);
        }
        break;
      }

      case 'customer.subscription.created': {
        // Fires when a subscription is created via API (e.g. the /api/checkout/upsell-app
        // one-click flow). Checkout Sessions already flow through
        // `checkout.session.completed`, so we only handle the API-created case here.
        const subscription = event.data.object as Stripe.Subscription;
        const funnel = subscription.metadata?.funnel;
        if (funnel !== 'upsell_app') {
          // Not our funnel — let `checkout.session.completed` handle it above
          break;
        }

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // Pull email from customer
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail =
          !customer.deleted && 'email' in customer ? customer.email || null : null;

        const userId = `stripe_${customerId}`;
        const { error } = await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            plan: subscription.metadata?.plan || 'monthly',
            status: subscription.status === 'active' ? 'active' : subscription.status,
            current_period_end: getSubscriptionPeriodEnd(subscription),
            email: customerEmail,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        if (error) {
          console.error('[STRIPE WEBHOOK] Supabase insert error (upsell sub.created):', error);
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

      /* ──────────────── One-time product flow (book funnel) ──────────────── */
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const funnel = intent.metadata?.funnel;

        // Only handle our funnel payments. Subscription checkout flows through
        // `checkout.session.completed` above; we don't want to double-handle.
        if (funnel !== 'book_checkout' && funnel !== 'upsell_playbooks') {
          break;
        }

        const itemsCsv = intent.metadata?.items || '';
        const items = itemsCsv.split(',').filter(Boolean) as ProductSlug[];
        const email =
          intent.receipt_email ||
          (typeof intent.customer === 'string'
            ? (await stripe.customers.retrieve(intent.customer).then((c) =>
                !c.deleted && 'email' in c ? c.email || '' : ''
              ))
            : '');

        // Flip the existing order row to paid (book_checkout pre-creates it).
        // For upsells the row may already exist from the API route; upsert is safe.
        const { error: updateErr } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_method_id:
              typeof intent.payment_method === 'string'
                ? intent.payment_method
                : intent.payment_method?.id || null,
            delivered_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', intent.id);

        if (updateErr) {
          console.error('[STRIPE WEBHOOK] Order update failed:', updateErr);
        }

        // Fallback: if update didn't match (e.g. race with API insert), insert
        if (updateErr || !email) {
          // Try to upsert by payment_intent_id
          await supabase.from('orders').upsert(
            {
              email: email || 'unknown@unknown.com',
              stripe_customer_id:
                typeof intent.customer === 'string' ? intent.customer : null,
              stripe_payment_intent_id: intent.id,
              items,
              amount_cents: intent.amount,
              currency: intent.currency,
              status: 'paid',
              stripe_payment_method_id:
                typeof intent.payment_method === 'string'
                  ? intent.payment_method
                  : intent.payment_method?.id || null,
              delivered_at: new Date().toISOString(),
              metadata: { funnel },
            },
            { onConflict: 'stripe_payment_intent_id' }
          );
        }

        // Deliver the goods via Resend
        if (email && items.length > 0) {
          const result = await sendDeliveryEmail({ to: email, items });
          if (!result.ok) {
            console.error('[STRIPE WEBHOOK] Delivery email failed:', result.error);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (pi) {
          await supabase
            .from('orders')
            .update({ status: 'refunded', refunded_at: new Date().toISOString() })
            .eq('stripe_payment_intent_id', pi);
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
