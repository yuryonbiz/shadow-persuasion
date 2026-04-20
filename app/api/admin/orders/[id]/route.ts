/**
 * GET  /api/admin/orders/[id] — Get single order with full Stripe timeline
 * POST /api/admin/orders/[id] — Perform actions: refund, resend_email, mark_delivered
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { sendDeliveryEmail } from '@/lib/email';
import type { ProductSlug } from '@/lib/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ─────────────────────── GET ─────────────────────── */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Enrich with Stripe data
    let paymentIntent = null;
    let charges: Array<{
      id: string;
      amount: number;
      status: string;
      refunded: boolean;
      amount_refunded: number;
      created: number;
      receipt_url: string | null;
    }> = [];

    if (order.stripe_payment_intent_id) {
      try {
        const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        paymentIntent = {
          id: pi.id,
          status: pi.status,
          amount: pi.amount,
          amount_received: pi.amount_received,
          currency: pi.currency,
          created: pi.created,
        };

        // Fetch the charges for this PI
        const charges_ = await stripe.charges.list({
          payment_intent: order.stripe_payment_intent_id,
          limit: 10,
        });
        charges = charges_.data.map((c) => ({
          id: c.id,
          amount: c.amount,
          status: c.status,
          refunded: c.refunded,
          amount_refunded: c.amount_refunded,
          created: c.created,
          receipt_url: c.receipt_url,
        }));
      } catch (err) {
        console.warn('[admin/orders GET] stripe fetch failed:', err);
      }
    }

    // Find any related orders (same customer OR same email) so the detail
    // page can render the full customer session on one screen.
    let relatedOrders: Array<{
      id: string;
      email: string;
      items: unknown;
      amount_cents: number;
      currency: string;
      status: string;
      stripe_payment_intent_id: string | null;
      delivered_at: string | null;
      refunded_at: string | null;
      created_at: string;
    }> = [];
    {
      // Prefer matching by email (most reliable across PIs); fall back to customer id.
      const filters: string[] = [];
      if (order.email) filters.push(`email.eq.${order.email}`);
      if (order.stripe_customer_id)
        filters.push(`stripe_customer_id.eq.${order.stripe_customer_id}`);
      if (filters.length > 0) {
        const { data: rel } = await supabase
          .from('orders')
          .select(
            'id, email, items, amount_cents, currency, status, stripe_payment_intent_id, delivered_at, refunded_at, created_at'
          )
          .or(filters.join(','))
          .neq('id', id)
          .order('created_at', { ascending: true });
        relatedOrders = rel ?? [];
      }
    }

    // Find subscription for this customer / email
    let subscription = null;
    if (order.email || order.stripe_customer_id) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .or(
          [
            order.email ? `email.eq.${order.email}` : '',
            order.stripe_customer_id
              ? `stripe_customer_id.eq.${order.stripe_customer_id}`
              : '',
          ]
            .filter(Boolean)
            .join(',')
        )
        .maybeSingle();
      subscription = sub;
    }

    return NextResponse.json({
      order,
      paymentIntent,
      charges,
      relatedOrders,
      subscription,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/orders/:id GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ─────────────────────── POST (actions) ─────────────────────── */

type ActionBody =
  | { action: 'refund'; reason?: string }
  | { action: 'resend_email' }
  | { action: 'mark_delivered' }
  | { action: 'update_note'; note: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as ActionBody;

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    switch (body.action) {
      case 'refund': {
        if (!order.stripe_payment_intent_id) {
          return NextResponse.json(
            { error: 'No Stripe payment_intent on this order' },
            { status: 400 }
          );
        }
        if (order.status === 'refunded') {
          return NextResponse.json(
            { error: 'Order already refunded' },
            { status: 400 }
          );
        }
        const refund = await stripe.refunds.create({
          payment_intent: order.stripe_payment_intent_id,
          reason: 'requested_by_customer',
          metadata: {
            admin_note: body.reason || '',
            order_id: order.id,
          },
        });
        await supabase
          .from('orders')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
            metadata: {
              ...(order.metadata || {}),
              refund: {
                stripe_refund_id: refund.id,
                reason: body.reason || '',
                at: new Date().toISOString(),
              },
            },
          })
          .eq('id', id);

        return NextResponse.json({ ok: true, refund });
      }

      case 'resend_email': {
        if (!order.email) {
          return NextResponse.json({ error: 'Order has no email' }, { status: 400 });
        }
        const items = (order.items as ProductSlug[]) ?? [];
        if (items.length === 0) {
          return NextResponse.json({ error: 'Order has no items' }, { status: 400 });
        }
        const result = await sendDeliveryEmail({ to: order.email, items });
        if (!result.ok) {
          return NextResponse.json(
            { error: result.error || 'Email failed' },
            { status: 500 }
          );
        }
        return NextResponse.json({ ok: true, emailId: result.id });
      }

      case 'mark_delivered': {
        await supabase
          .from('orders')
          .update({ delivered_at: new Date().toISOString() })
          .eq('id', id);
        return NextResponse.json({ ok: true });
      }

      case 'update_note': {
        await supabase
          .from('orders')
          .update({
            metadata: { ...(order.metadata || {}), admin_note: body.note },
          })
          .eq('id', id);
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/orders/:id POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
