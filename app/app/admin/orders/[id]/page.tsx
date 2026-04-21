'use client';

/* ════════════════════════════════════════════════════════════
   /admin/orders/[id] — Full CUSTOMER SESSION detail.

   Renders every order this buyer placed (book + bumps + upsells)
   on a single page, plus their subscription. Each order card has
   its own inline actions (refund, resend delivery, mark delivered)
   that POST to /api/admin/orders/[that-order-id]. No more
   bouncing between admin URLs for products bought in the same flow.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  CircleAlert,
  Clock,
  Mail,
  AlertTriangle,
  ExternalLink,
  FileCheck,
} from 'lucide-react';

type OrderRow = {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  items: string[];
  amount_cents: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  delivered_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  is_test: boolean;
};

type RelatedOrderRow = {
  id: string;
  email: string;
  items: string[];
  amount_cents: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  stripe_payment_intent_id: string | null;
  delivered_at: string | null;
  refunded_at: string | null;
  created_at: string;
};

type OrderDetail = {
  order: OrderRow;
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    amount_received: number;
    currency: string;
    created: number;
  } | null;
  charges: Array<{
    id: string;
    amount: number;
    status: string;
    refunded: boolean;
    amount_refunded: number;
    created: number;
    receipt_url: string | null;
  }>;
  relatedOrders: RelatedOrderRow[];
  subscription: {
    id: string;
    stripe_subscription_id: string | null;
    plan: string;
    status: string;
    current_period_end: string | null;
    created_at: string | null;
  } | null;
  // Stripe detail keyed by Supabase order id. Covers the primary order
  // AND every related order, so the detail page can show Stripe info
  // for book + bump + playbooks + vault in one place.
  stripeByOrderId?: Record<
    string,
    {
      paymentIntent: {
        id: string;
        status: string;
        amount: number;
        amount_received: number;
        currency: string;
        created: number;
      } | null;
      charges: Array<{
        id: string;
        amount: number;
        status: string;
        refunded: boolean;
        amount_refunded: number;
        created: number;
        receipt_url: string | null;
      }>;
    }
  >;
  // Recent invoices for the recurring subscription (if any).
  subscriptionInvoices?: Array<{
    id: string;
    status: string | null;
    amount_paid: number;
    amount_due: number;
    currency: string;
    created: number;
    hosted_invoice_url: string | null;
    charge_id: string | null;
  }>;
};

const ITEM_LABELS: Record<string, string> = {
  book: 'Shadow Persuasion (Book)',
  briefing: 'The Pre-Conversation Briefing',
  playbooks: 'The Situation Playbooks',
  vault: 'The Shadow Persuasion Vault',
};

// Inline pricing for the recurring plans so the subscription card can
// show its amount. Must stay in sync with lib/pricing and the upsell-app
// API. (Plan amounts are not stored on the subscriptions row — Stripe
// holds the Price object, we just stamp the plan key.)
const PLAN_PRICING: Record<string, { cents: number; intervalLabel: string }> = {
  weekly:  { cents: 995,   intervalLabel: '/wk'  },
  monthly: { cents: 3495,  intervalLabel: '/mo'  },
  yearly:  { cents: 19595, intervalLabel: '/yr'  },
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [refundOpenFor, setRefundOpenFor] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load');
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(
    orderId: string,
    action: string,
    body: Record<string, unknown> = {}
  ) {
    const key = `${action}:${orderId}`;
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Action failed');
      setFlash(`${action.replace('_', ' ')} succeeded`);
      await load();
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function cancelSub(when: 'immediately' | 'period_end') {
    if (!data?.subscription) return;
    setBusy('cancel_sub');
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${data.subscription.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', when }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Cancel failed');
      setFlash(when === 'immediately' ? 'Subscription cancelled' : 'Cancellation scheduled');
      await load();
      setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const fmt = (cents: number, currency = 'usd') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(
      cents / 100
    );

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const fmtUnix = (s: number) =>
    new Date(s * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">Loading session…</p>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="p-6 md:p-10">
        <Link href="/app/admin/orders" className="inline-flex items-center gap-2 text-[#D4A017] mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <p className="text-red-600 dark:text-red-400 font-mono text-sm">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  // Stripe detail for the primary order is accessed via stripeByOrderId
  // below; relatedOrders provides the rest of the session; subscription
  // owns the recurring side.
  const { order, relatedOrders, subscription } = data;
  const stripeByOrderId = data.stripeByOrderId || {};
  const subscriptionInvoices = data.subscriptionInvoices || [];

  // Build the full session: primary + related, chronological.
  const allOrders: OrderRow[] = [order, ...(relatedOrders as OrderRow[])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );

  // Build a unified timeline of one-time orders + the recurring
  // subscription (if any) so the page shows ONE picture of everything
  // the customer bought. Each item has a sortable `at` timestamp.
  type TimelineItem =
    | { kind: 'order'; at: string; order: OrderRow }
    | { kind: 'subscription'; at: string };
  const timeline: TimelineItem[] = allOrders.map((o) => ({
    kind: 'order' as const,
    at: o.created_at,
    order: o,
  }));
  if (subscription) {
    timeline.push({
      kind: 'subscription' as const,
      at: subscription.created_at || allOrders[allOrders.length - 1]?.created_at || new Date().toISOString(),
    });
  }
  timeline.sort((a, b) => a.at.localeCompare(b.at));

  // Session totals (one-time orders only; recurring shown separately)
  const paidCents = allOrders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount_cents, 0);
  const pendingCents = allOrders.filter((o) => o.status === 'pending').reduce((s, o) => s + o.amount_cents, 0);
  const refundedCents = allOrders.filter((o) => o.status === 'refunded').reduce((s, o) => s + o.amount_cents, 0);
  const sessionCurrency = allOrders[0]?.currency || 'usd';

  // Subscription display helpers (amount + interval lookup)
  const subPricing = subscription ? PLAN_PRICING[subscription.plan] : null;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Back + header */}
      <Link href="/app/admin/orders" className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // CUSTOMER SESSION //
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8] flex items-center gap-3 flex-wrap">
            {order.email}
            {order.is_test && (
              <span className="px-2 py-1 text-xs font-mono uppercase tracking-wider bg-purple-600 text-white font-bold">
                Test Order
              </span>
            )}
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-[#F4ECD8]/50 mt-2">
            {allOrders.length} order{allOrders.length === 1 ? '' : 's'}
            {' · '}first {fmtDate(allOrders[0].created_at)}
          </p>
        </div>
        {/* Mark-as-test toggle lives in the header so it's findable
            from any order detail. Cascade hits every order tied to
            this email plus the associated sub + lead row. */}
        <button
          onClick={async () => {
            const next = !order.is_test;
            if (!confirm(next
              ? `Mark this whole customer session as TEST? All orders (${allOrders.length}), the subscription (if any), and the checkout lead for ${order.email} will be excluded from dashboard metrics.`
              : `Un-mark this customer session as test? It will start counting in revenue, leads, and conversions again.`)) return;
            try {
              const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_test', isTest: next }),
              });
              const d = await res.json();
              if (!res.ok) throw new Error(d.error || 'Failed');
              setFlash(next ? 'Marked as test' : 'Unmarked test');
              await load();
              setTimeout(() => setFlash(null), 3000);
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs uppercase tracking-wider border ${
            order.is_test
              ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
              : 'bg-white dark:bg-[#111] border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-purple-600'
          }`}
        >
          {order.is_test ? 'Unmark Test' : 'Mark As Test'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 text-green-700 dark:text-green-300 p-3 mb-5 font-mono text-sm">
          ✓ {flash}
        </div>
      )}

      {/* ─────────── Session totals ─────────── */}
      <Section title="Session totals">
        <div className="grid md:grid-cols-4 gap-x-8 gap-y-3">
          <Field label="Paid (one-time)" value={fmt(paidCents, sessionCurrency)} highlight />
          <Field label="Pending" value={fmt(pendingCents, sessionCurrency)} />
          <Field label="Refunded" value={fmt(refundedCents, sessionCurrency)} />
          <Field label="Purchases" value={String(timeline.length)} />
          {subscription && subPricing && (
            <Field
              label="Recurring"
              value={`${fmt(subPricing.cents)}${subPricing.intervalLabel}`}
              highlight
            />
          )}
          {subscription && (
            <Field
              label="Sub status"
              value={`${subscription.status}${subscription.plan ? ` · ${subscription.plan}` : ''}`}
            />
          )}
          <Field label="Customer" value={order.stripe_customer_id || '—'} mono />
          <Field label="Email" value={order.email} />
        </div>
      </Section>

      {/* ─────────── Unified purchase timeline ─────────── */}
      <Section title={`Purchases (${timeline.length})`}>
        <div className="space-y-4">
          {timeline.map((item, idx) => {
            if (item.kind === 'subscription' && subscription) {
              const amountLabel = subPricing
                ? `${fmt(subPricing.cents)}${subPricing.intervalLabel}`
                : subscription.plan;
              const subCancelled =
                subscription.status === 'cancelled' || subscription.status === 'canceled';
              return (
                <div
                  key={`sub-${subscription.id}`}
                  className="border border-[#D4A017]/40 dark:border-[#D4A017]/30 bg-[#D4A017]/5 dark:bg-[#D4A017]/5 p-4"
                >
                  {/* Subscription header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={subscription.status} />
                        <span className="text-[#D4A017] font-bold">
                          {amountLabel}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 dark:text-[#F4ECD8]/50">
                          {subscription.created_at ? fmtDate(subscription.created_at) : '—'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#D4A017] text-[#0A0A0A] font-bold">
                          Subscription
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-gray-400 dark:text-[#F4ECD8]/40 mt-1">
                        {subscription.stripe_subscription_id?.slice(0, 13) || subscription.id.slice(0, 13)}…
                      </p>
                    </div>
                    {subscription.stripe_subscription_id && (
                      <a
                        href={`https://dashboard.stripe.com/subscriptions/${subscription.stripe_subscription_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
                      >
                        Stripe <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* What they got */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/10 px-3 py-2 font-mono text-sm">
                      <FileCheck className="h-4 w-4 text-[#D4A017]" />
                      <span className="text-gray-900 dark:text-[#F4ECD8]">
                        Shadow Persuasion App — {subscription.plan} plan
                      </span>
                      <span className="ml-auto text-gray-400 dark:text-[#F4ECD8]/40 text-xs uppercase">
                        recurring
                      </span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 mb-3 text-xs">
                    <Field label="Plan" value={subscription.plan} />
                    <Field
                      label={subCancelled ? 'Ends' : 'Current period end'}
                      value={fmtDate(subscription.current_period_end)}
                    />
                  </div>

                  {/* Sub action row */}
                  <div className="flex gap-2 flex-wrap pt-3 border-t border-[#D4A017]/20">
                    <button
                      onClick={() => cancelSub('period_end')}
                      disabled={busy === 'cancel_sub' || subCancelled}
                      className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
                    >
                      Cancel at Period End
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Cancel subscription IMMEDIATELY? This cannot be undone.')) {
                          cancelSub('immediately');
                        }
                      }}
                      disabled={busy === 'cancel_sub' || subCancelled}
                      className="px-3 py-1.5 bg-red-600 text-white dark:bg-red-900/30 dark:text-red-300 border border-red-600 hover:bg-red-700 dark:hover:bg-red-900/50 disabled:opacity-50 font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Cancel Immediately
                    </button>
                  </div>
                </div>
              );
            }

            if (item.kind !== 'order') return null;
            const o = item.order;
            const canRefund = o.status === 'paid' && !!o.stripe_payment_intent_id;
            const isRefundOpen = refundOpenFor === o.id;
            const isPrimary = o.id === order.id;

            return (
              <div
                key={`order-${o.id}-${idx}`}
                className="border border-gray-200 dark:border-[#D4A017]/20 bg-gray-50 dark:bg-[#0A0A0A] p-4"
              >
                {/* Order header */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusBadge status={o.status} />
                      <span className="text-[#D4A017] font-bold">
                        {fmt(o.amount_cents, o.currency)}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500 dark:text-[#F4ECD8]/50">
                        {fmtDate(o.created_at)}
                      </span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">
                          Linked
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-gray-400 dark:text-[#F4ECD8]/40 mt-1">
                      {o.id.slice(0, 13)}…
                    </p>
                  </div>
                  {o.stripe_payment_intent_id && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${o.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
                    >
                      Stripe <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3">
                  {(o.items || []).map((slug) => (
                    <div
                      key={slug}
                      className="flex items-center gap-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/10 px-3 py-2 font-mono text-sm"
                    >
                      <FileCheck className="h-4 w-4 text-[#D4A017]" />
                      <span className="text-gray-900 dark:text-[#F4ECD8]">
                        {ITEM_LABELS[slug] || slug}
                      </span>
                      <span className="ml-auto text-gray-400 dark:text-[#F4ECD8]/40 text-xs uppercase">
                        {slug}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Timestamps row */}
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 mb-3 text-xs">
                  <Field
                    label="Delivered"
                    value={o.delivered_at ? fmtDate(o.delivered_at) : 'Not marked'}
                  />
                  <Field label="Refunded" value={o.refunded_at ? fmtDate(o.refunded_at) : '—'} />
                </div>

                {/* Per-order action row */}
                <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-200 dark:border-[#D4A017]/10">
                  <button
                    onClick={() => act(o.id, 'resend_email')}
                    disabled={busy === `resend_email:${o.id}`}
                    className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <Mail className="h-3 w-3" />
                    {busy === `resend_email:${o.id}` ? 'Sending…' : 'Resend'}
                  </button>
                  <button
                    onClick={() => act(o.id, 'mark_delivered')}
                    disabled={busy === `mark_delivered:${o.id}`}
                    className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <FileCheck className="h-3 w-3" />
                    {busy === `mark_delivered:${o.id}` ? 'Marking…' : 'Mark Delivered'}
                  </button>
                  {!isRefundOpen ? (
                    <button
                      onClick={() => {
                        setRefundOpenFor(o.id);
                        setRefundReason('');
                      }}
                      disabled={!canRefund || busy === `refund:${o.id}`}
                      className="px-3 py-1.5 bg-red-600 text-white dark:bg-red-900/30 dark:text-red-300 border border-red-600 hover:bg-red-700 dark:hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Start Refund
                    </button>
                  ) : null}
                </div>

                {/* Refund confirm area (inline) */}
                {isRefundOpen && (
                  <div className="mt-3 space-y-2 p-3 border border-red-400 dark:border-red-600/40 bg-red-50 dark:bg-red-900/10">
                    <input
                      type="text"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Internal note (optional)"
                      className="w-full px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Refund ${fmt(o.amount_cents, o.currency)} to ${o.email}? This cannot be undone.`
                            )
                          ) {
                            act(o.id, 'refund', { reason: refundReason });
                            setRefundOpenFor(null);
                          }
                        }}
                        disabled={busy === `refund:${o.id}`}
                        className="px-3 py-1.5 bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 font-mono text-xs uppercase tracking-wider font-bold"
                      >
                        {busy === `refund:${o.id}`
                          ? 'Refunding…'
                          : `Confirm Refund ${fmt(o.amount_cents, o.currency)}`}
                      </button>
                      <button
                        onClick={() => {
                          setRefundOpenFor(null);
                          setRefundReason('');
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-gray-600 dark:text-[#F4ECD8]/60 hover:text-gray-900 dark:hover:text-[#F4ECD8] font-mono text-xs uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                    {!canRefund && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                        Order must be &quot;paid&quot; and have a Stripe payment intent to refund.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─────────── Stripe detail for EVERY order + the subscription ───
          Each Supabase order has its own Stripe payment intent (book+bump
          share one PI; playbooks/vault use a second PI); the subscription
          has its own recurring invoices. Render all of them so the admin
          can audit the whole session's Stripe activity without clicking
          around. */}
      <Section title="Stripe detail" collapsed>
        <div className="space-y-6">
          {/* Per-order Stripe detail */}
          {allOrders.map((o) => {
            const s = stripeByOrderId[o.id];
            const itemLabels = (o.items || [])
              .map((slug) => ITEM_LABELS[slug] || slug)
              .join(' + ');
            return (
              <div
                key={`stripe-${o.id}`}
                className="border border-gray-200 dark:border-[#D4A017]/20 p-4"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#D4A017]">
                    {itemLabels || 'Order'}
                  </p>
                  <p className="font-mono text-[10px] text-gray-400 dark:text-[#F4ECD8]/40">
                    {fmtDate(o.created_at)}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mb-3">
                  <Field
                    label="Payment Intent"
                    value={o.stripe_payment_intent_id || '—'}
                    mono
                  />
                  {s?.paymentIntent ? (
                    <>
                      <Field label="PI Status" value={s.paymentIntent.status} />
                      <Field label="PI Amount" value={fmt(s.paymentIntent.amount, s.paymentIntent.currency)} />
                      <Field label="PI Created" value={fmtUnix(s.paymentIntent.created)} />
                    </>
                  ) : (
                    <Field label="Stripe lookup" value="unavailable" />
                  )}
                </div>
                {s && s.charges.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 font-mono mb-2">
                      Charges ({s.charges.length})
                    </p>
                    <div className="space-y-2">
                      {s.charges.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 px-3 py-2 text-xs font-mono"
                        >
                          <span className="text-gray-900 dark:text-[#F4ECD8]">
                            {fmt(c.amount)}
                          </span>
                          <span
                            className={`px-2 py-0.5 uppercase tracking-wider ${
                              c.status === 'succeeded'
                                ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {c.status}
                          </span>
                          {c.refunded && (
                            <span className="px-2 py-0.5 uppercase tracking-wider bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400">
                              Refunded {fmt(c.amount_refunded)}
                            </span>
                          )}
                          <span className="text-gray-400 dark:text-[#F4ECD8]/40 ml-auto">
                            {fmtUnix(c.created)}
                          </span>
                          {c.receipt_url && (
                            <a
                              href={c.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#D4A017] hover:underline inline-flex items-center gap-1"
                            >
                              Receipt <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {o.stripe_payment_intent_id && (
                  <a
                    href={`https://dashboard.stripe.com/payments/${o.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
                  >
                    Open PI in Stripe <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}

          {/* Subscription invoices */}
          {subscription && (
            <div className="border border-[#D4A017]/40 dark:border-[#D4A017]/30 p-4 bg-[#D4A017]/5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                <p className="font-mono text-xs uppercase tracking-wider text-[#D4A017]">
                  Subscription — {subscription.plan}
                </p>
                <p className="font-mono text-[10px] text-gray-400 dark:text-[#F4ECD8]/40">
                  {subscription.created_at ? fmtDate(subscription.created_at) : '—'}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mb-3">
                <Field
                  label="Subscription ID"
                  value={subscription.stripe_subscription_id || '—'}
                  mono
                />
                <Field label="Status" value={subscription.status} />
              </div>
              {subscriptionInvoices.length > 0 ? (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 font-mono mb-2">
                    Invoices ({subscriptionInvoices.length})
                  </p>
                  <div className="space-y-2">
                    {subscriptionInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center gap-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 px-3 py-2 text-xs font-mono"
                      >
                        <span className="text-gray-900 dark:text-[#F4ECD8]">
                          {fmt(
                            inv.amount_paid > 0 ? inv.amount_paid : inv.amount_due,
                            inv.currency
                          )}
                        </span>
                        <span
                          className={`px-2 py-0.5 uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                              : inv.status === 'open'
                              ? 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#F4ECD8]/70'
                          }`}
                        >
                          {inv.status || 'unknown'}
                        </span>
                        <span className="text-gray-400 dark:text-[#F4ECD8]/40 ml-auto">
                          {fmtUnix(inv.created)}
                        </span>
                        {inv.hosted_invoice_url && (
                          <a
                            href={inv.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#D4A017] hover:underline inline-flex items-center gap-1"
                          >
                            Invoice <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                  No invoices found yet (new subscription, or Stripe lookup failed).
                </p>
              )}
              {subscription.stripe_subscription_id && (
                <a
                  href={`https://dashboard.stripe.com/subscriptions/${subscription.stripe_subscription_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
                >
                  Open Sub in Stripe <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* ─────────── Raw metadata ─────────── */}
      <Section title="Raw metadata (linked order)" collapsed>
        <pre className="text-[10px] text-gray-700 dark:text-[#F4ECD8]/70 font-mono overflow-x-auto bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 p-3">
          {JSON.stringify(order.metadata || {}, null, 2)}
        </pre>
      </Section>
    </div>
  );
}

/* ─────────── Helpers ─────────── */

function Section({
  title,
  children,
  collapsed,
}: {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 text-left"
      >
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4A017]">{title}</h2>
        {collapsed && <span className="text-xs text-[#D4A017]/50">{open ? '−' : '+'}</span>}
      </button>
      {open && children}
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 font-mono mb-1">
        {label}
      </p>
      <p
        className={`text-sm ${highlight ? 'text-[#D4A017] font-bold' : 'text-gray-900 dark:text-[#F4ECD8]'} ${
          mono ? 'font-mono break-all' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const map: Record<
    string,
    { icon: React.ComponentType<{ className?: string }>; cls: string; label: string }
  > = {
    paid: {
      icon: CircleCheck,
      cls:
        'bg-green-100 dark:bg-green-600/20 border-green-500 dark:border-green-600 text-green-700 dark:text-green-400',
      label: 'Paid',
    },
    pending: {
      icon: Clock,
      cls:
        'bg-yellow-100 dark:bg-yellow-600/20 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300',
      label: 'Pending',
    },
    refunded: {
      icon: CircleX,
      cls:
        'bg-red-100 dark:bg-red-600/20 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400',
      label: 'Refunded',
    },
    failed: {
      icon: CircleAlert,
      cls:
        'bg-red-200 dark:bg-red-800/20 border-red-700 dark:border-red-800 text-red-800 dark:text-red-500',
      label: 'Failed',
    },
  };
  const cfg =
    map[status] || {
      icon: CircleAlert,
      cls: 'bg-gray-200 dark:bg-[#333] text-gray-600 dark:text-[#F4ECD8]/70 border-gray-400 dark:border-[#555]',
      label: status,
    };
  const Icon = cfg.icon;
  const padding = small ? 'px-2 py-0.5' : 'px-3 py-1';
  const text = small ? 'text-[10px]' : 'text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-wider ${cfg.cls} ${padding} ${text}`}
    >
      <Icon className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {cfg.label}
    </span>
  );
}
