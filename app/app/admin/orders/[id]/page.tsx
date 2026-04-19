'use client';

/* ════════════════════════════════════════════════════════════
   /admin/orders/[id] — Single order detail with actions
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  CircleAlert,
  Clock,
  RefreshCw,
  Mail,
  AlertTriangle,
  ExternalLink,
  Users,
  FileCheck,
  Pencil,
} from 'lucide-react';

type OrderDetail = {
  order: {
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
  };
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
  relatedOrders: Array<{
    id: string;
    items: string[];
    amount_cents: number;
    status: string;
    created_at: string;
  }>;
  subscription: {
    id: string;
    stripe_subscription_id: string | null;
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
};

const ITEM_LABELS: Record<string, string> = {
  book: 'Shadow Persuasion (Book)',
  briefing: 'The Pre-Conversation Briefing',
  playbooks: 'The Situation Playbooks',
  vault: 'The Shadow Persuasion Vault',
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
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

  async function act(action: string, body: Record<string, unknown> = {}) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
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
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const fmtUnix = (s: number) =>
    new Date(s * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">Loading order…</p>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="p-6 md:p-10">
        <Link href="/app/admin/orders" className="inline-flex items-center gap-2 text-[#D4A017] mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <p className="text-red-400 font-mono text-sm">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const { order, paymentIntent, charges, relatedOrders, subscription } = data;
  const canRefund = order.status === 'paid' && !!order.stripe_payment_intent_id;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Back + header */}
      <Link href="/app/admin/orders" className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // ORDER //
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            {order.email}
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-[#F4ECD8]/50 mt-2">
            ID {order.id.slice(0, 13)}…  ·  {fmtDate(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}
      {flash && (
        <div className="bg-green-900/20 border border-green-600 text-green-300 p-3 mb-5 font-mono text-sm">
          ✓ {flash}
        </div>
      )}

      {/* ─────────── Summary ─────────── */}
      <Section title="Summary">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          <Field label="Email" value={order.email} />
          <Field label="Amount" value={fmt(order.amount_cents, order.currency)} highlight />
          <Field label="Status" value={order.status} />
          <Field label="Currency" value={order.currency.toUpperCase()} />
          <Field label="Created" value={fmtDate(order.created_at)} />
          <Field label="Updated" value={fmtDate(order.updated_at)} />
          <Field label="Delivered" value={order.delivered_at ? fmtDate(order.delivered_at) : 'Not marked'} />
          <Field label="Refunded" value={order.refunded_at ? fmtDate(order.refunded_at) : '—'} />
        </div>
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 font-mono mb-2">Items</p>
          <div className="space-y-1.5">
            {order.items.map((slug) => (
              <div
                key={slug}
                className="flex items-center gap-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 px-3 py-2 font-mono text-sm"
              >
                <FileCheck className="h-4 w-4 text-[#D4A017]" />
                <span className="text-gray-900 dark:text-[#F4ECD8]">{ITEM_LABELS[slug] || slug}</span>
                <span className="ml-auto text-gray-400 dark:text-[#F4ECD8]/40 text-xs uppercase">{slug}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────── Stripe ─────────── */}
      <Section title="Stripe">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          <Field label="Customer ID" value={order.stripe_customer_id || '—'} mono />
          <Field label="Payment Intent" value={order.stripe_payment_intent_id || '—'} mono />
          {paymentIntent && (
            <>
              <Field label="PI Status" value={paymentIntent.status} />
              <Field label="PI Created" value={fmtUnix(paymentIntent.created)} />
            </>
          )}
        </div>
        {charges.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50 font-mono mb-2">
              Charges ({charges.length})
            </p>
            <div className="space-y-2">
              {charges.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 px-3 py-2 text-xs font-mono"
                >
                  <span className="text-gray-900 dark:text-[#F4ECD8]">{fmt(c.amount)}</span>
                  <span
                    className={`px-2 py-0.5 uppercase tracking-wider ${
                      c.status === 'succeeded'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.refunded && (
                    <span className="px-2 py-0.5 uppercase tracking-wider bg-red-600/20 text-red-400">
                      Refunded {fmt(c.amount_refunded)}
                    </span>
                  )}
                  <span className="text-gray-400 dark:text-[#F4ECD8]/40 ml-auto">{fmtUnix(c.created)}</span>
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
        {order.stripe_payment_intent_id && (
          <a
            href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#D4A017] hover:underline mt-4 font-mono uppercase tracking-wider"
          >
            Open in Stripe <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </Section>

      {/* ─────────── Member / Subscription ─────────── */}
      <Section title="Member / Subscription">
        {subscription ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              <Field label="Plan" value={subscription.plan} highlight />
              <Field label="Status" value={subscription.status} />
              <Field
                label="Current Period End"
                value={fmtDate(subscription.current_period_end)}
              />
              <Field label="Stripe Sub ID" value={subscription.stripe_subscription_id || '—'} mono />
            </div>
            <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-200 dark:border-[#D4A017]/10">
              <button
                onClick={() => cancelSub('period_end')}
                disabled={busy === 'cancel_sub' || subscription.status === 'cancelled'}
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
                disabled={busy === 'cancel_sub' || subscription.status === 'cancelled'}
                className="px-3 py-1.5 bg-red-900/30 border border-red-600 text-red-300 hover:bg-red-900/50 disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
              >
                Cancel Immediately
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">
            This buyer does not have a SaaS subscription.
          </p>
        )}
      </Section>

      {/* ─────────── Customer History ─────────── */}
      {relatedOrders.length > 0 && (
        <Section title="Other orders from this customer">
          <div className="space-y-2">
            {relatedOrders.map((r) => (
              <Link
                key={r.id}
                href={`/app/admin/orders/${r.id}`}
                className="flex items-center gap-3 bg-gray-50 dark:bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 hover:border-[#D4A017] px-3 py-2 text-xs font-mono"
              >
                <span className="text-gray-500 dark:text-[#F4ECD8]/60">{fmtDate(r.created_at)}</span>
                <span className="text-gray-900 dark:text-[#F4ECD8]">{(r.items || []).join(' + ')}</span>
                <span className="ml-auto text-[#D4A017] font-bold">{fmt(r.amount_cents)}</span>
                <StatusBadge status={r.status} small />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ─────────── Actions ─────────── */}
      <Section title="Actions">
        {/* Resend email */}
        <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-[#D4A017]/10">
          <Mail className="h-5 w-5 text-[#D4A017] mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-[#F4ECD8] text-sm mb-1">Resend delivery email</p>
            <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mb-3">
              Send the download links to {order.email} again. Useful if they say it didn&apos;t arrive.
            </p>
            <button
              onClick={() => act('resend_email')}
              disabled={busy === 'resend_email'}
              className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
            >
              {busy === 'resend_email' ? 'Sending…' : 'Resend'}
            </button>
          </div>
        </div>

        {/* Mark delivered */}
        <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-[#D4A017]/10">
          <FileCheck className="h-5 w-5 text-[#D4A017] mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-[#F4ECD8] text-sm mb-1">Mark as delivered</p>
            <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mb-3">
              Stamps delivered_at now. Use for manual fulfillment outside the webhook flow.
            </p>
            <button
              onClick={() => act('mark_delivered')}
              disabled={busy === 'mark_delivered'}
              className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
            >
              {busy === 'mark_delivered' ? 'Marking…' : 'Mark Delivered'}
            </button>
          </div>
        </div>

        {/* Refund */}
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-[#F4ECD8] text-sm mb-1">Refund</p>
            <p className="text-xs text-gray-600 dark:text-[#F4ECD8]/60 mb-3">
              Issues a full refund via Stripe and marks the order as refunded. Cannot be undone.
              {!canRefund && (
                <span className="block mt-1 text-red-400">
                  (Unavailable: order must be &quot;paid&quot; and have a Stripe payment intent.)
                </span>
              )}
            </p>
            {!refundOpen ? (
              <button
                onClick={() => setRefundOpen(true)}
                disabled={!canRefund || busy === 'refund'}
                className="px-3 py-1.5 bg-red-900/30 border border-red-600 text-red-300 hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs uppercase tracking-wider"
              >
                Start Refund
              </button>
            ) : (
              <div className="space-y-2">
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
                      if (confirm(`Refund ${fmt(order.amount_cents)} to ${order.email}? This cannot be undone.`)) {
                        act('refund', { reason: refundReason });
                        setRefundOpen(false);
                      }
                    }}
                    disabled={busy === 'refund'}
                    className="px-3 py-1.5 bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 font-mono text-xs uppercase tracking-wider font-bold"
                  >
                    {busy === 'refund' ? 'Refunding…' : `Confirm Refund ${fmt(order.amount_cents)}`}
                  </button>
                  <button
                    onClick={() => {
                      setRefundOpen(false);
                      setRefundReason('');
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-gray-600 dark:text-[#F4ECD8]/60 hover:text-gray-900 dark:hover:text-[#F4ECD8] font-mono text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ─────────── Raw data ─────────── */}
      <Section title="Raw metadata" collapsed>
        <pre className="text-[10px] text-gray-700 dark:text-[#F4ECD8]/70 font-mono overflow-x-auto bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#D4A017]/20 p-3">
          {JSON.stringify(order.metadata || {}, null, 2)}
        </pre>
      </Section>
    </div>
  );
}

/* ─────────── Helpers ─────────── */

function Section({ title, children, collapsed }: { title: string; children: React.ReactNode; collapsed?: boolean }) {
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
      <p className={`text-sm ${highlight ? 'text-[#D4A017] font-bold' : 'text-gray-900 dark:text-[#F4ECD8]'} ${mono ? 'font-mono break-all' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string; label: string }> = {
    paid:     { icon: CircleCheck, cls: 'bg-green-600/20 border-green-600 text-green-400', label: 'Paid' },
    pending:  { icon: Clock,       cls: 'bg-yellow-600/20 border-yellow-600 text-yellow-300', label: 'Pending' },
    refunded: { icon: CircleX,     cls: 'bg-red-600/20 border-red-600 text-red-400', label: 'Refunded' },
    failed:   { icon: CircleAlert, cls: 'bg-red-800/20 border-red-800 text-red-500', label: 'Failed' },
  };
  const cfg = map[status] || { icon: CircleAlert, cls: 'bg-gray-200 dark:bg-[#333] text-gray-600 dark:text-[#F4ECD8]/70', label: status };
  const Icon = cfg.icon;
  const padding = small ? 'px-2 py-0.5' : 'px-3 py-1';
  const text = small ? 'text-[10px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-wider ${cfg.cls} ${padding} ${text}`}>
      <Icon className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {cfg.label}
    </span>
  );
}
