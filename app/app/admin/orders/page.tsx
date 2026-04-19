'use client';

/* ════════════════════════════════════════════════════════════
   /admin/orders — Orders list with filters + funnel metrics
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, RefreshCw, CircleCheck, CircleX, CircleAlert, Clock, ExternalLink, Users, TrendingDown } from 'lucide-react';

type OrderListItem = {
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
  created_at: string;
  member: {
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
};

type Funnel = {
  bookBuyers: number;
  bumpTakers: number;
  upsell1Takers: number;
  upsell2Takers: number;
};

const ITEM_LABELS: Record<string, { label: string; color: string }> = {
  book:      { label: 'Book',       color: 'bg-[#D4A017] text-black' },
  briefing:  { label: 'Bump',       color: 'bg-[#5C3A1E] text-[#F4ECD8]' },
  playbooks: { label: 'Playbooks',  color: 'bg-[#8B0000] text-[#F4ECD8]' },
  vault:     { label: 'Vault',      color: 'bg-[#1A1A1A] text-[#D4A017]' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [total, setTotal] = useState(0);
  const [totalRevenueCents, setTotalRevenueCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [product, setProduct] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (product !== 'all') params.set('product', product);
    if (search) params.set('search', search);
    params.set('limit', '200');
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setFunnel(data.funnel ?? null);
    setTotal(data.total ?? 0);
    setTotalRevenueCents(data.totalRevenueCents ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, product]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

  const conversionRates = useMemo(() => {
    if (!funnel || funnel.bookBuyers === 0) return null;
    return {
      bump: (funnel.bumpTakers / funnel.bookBuyers) * 100,
      upsell1: (funnel.upsell1Takers / funnel.bookBuyers) * 100,
      upsell2: (funnel.upsell2Takers / funnel.bookBuyers) * 100,
    };
  }, [funnel]);

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // ORDERS //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Orders
          </h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-[#D4A017] hover:border-[#D4A017] font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Funnel metrics */}
      {funnel && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <FunnelCard label="Book Buyers" value={funnel.bookBuyers} subvalue="100%" primary />
          <FunnelCard
            label="Bump Takers"
            value={funnel.bumpTakers}
            subvalue={conversionRates ? `${conversionRates.bump.toFixed(0)}%` : '-'}
          />
          <FunnelCard
            label="Upsell #1"
            value={funnel.upsell1Takers}
            subvalue={conversionRates ? `${conversionRates.upsell1.toFixed(0)}%` : '-'}
          />
          <FunnelCard
            label="Upsell #2 (SaaS)"
            value={funnel.upsell2Takers}
            subvalue={conversionRates ? `${conversionRates.upsell2.toFixed(0)}%` : '-'}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-60">
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-1">
            Search email
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-[#F4ECD8]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="user@example.com"
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-1">
            Product
          </label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          >
            <option value="all">All</option>
            <option value="book">Book</option>
            <option value="briefing">Briefing (bump)</option>
            <option value="playbooks">Playbooks</option>
            <option value="vault">Vault</option>
          </select>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-[#D4A017] text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#C4901A]"
        >
          <Filter className="h-3.5 w-3.5 inline mr-1.5" />
          Apply
        </button>
      </div>

      {/* Summary */}
      <div className="mb-4 text-xs text-gray-500 dark:text-[#F4ECD8]/60 font-mono">
        Showing {orders.length} of {total} · Revenue (filtered view): {fmt(totalRevenueCents)}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Date</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Email</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Items</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#D4A017]/80 font-mono text-right">Amount</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Status</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Member?</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A]">
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-[#F4ECD8]/70 font-mono whitespace-nowrap">
                    {fmtDate(o.created_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-[#F4ECD8] text-sm">
                    {o.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {o.items.map((slug) => {
                        const cfg = ITEM_LABELS[slug] || { label: slug, color: 'bg-gray-300 dark:bg-[#333] text-gray-800 dark:text-[#F4ECD8]' };
                        return (
                          <span
                            key={slug}
                            className={`${cfg.color} px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider font-bold`}
                          >
                            {cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#D4A017]">
                    {fmt(o.amount_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    {o.member ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#D4A017]">
                        <Users className="h-3 w-3" />
                        {o.member.plan}
                        <span className="text-gray-500 dark:text-[#F4ECD8]/50 ml-1">({o.member.status})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-[#F4ECD8]/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FunnelCard({
  label,
  value,
  subvalue,
  primary,
}: {
  label: string;
  value: number;
  subvalue: string;
  primary?: boolean;
}) {
  return (
    <div className={`border p-4 ${primary ? 'border-[#D4A017] bg-[#D4A017]/10' : 'border-gray-200 dark:border-[#D4A017]/20 bg-white dark:bg-[#111]'}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60">{label}</p>
        {!primary && <TrendingDown className="h-3 w-3 text-[#D4A017]/50" />}
      </div>
      <p className="font-mono text-2xl font-black text-[#D4A017]">{value}</p>
      <p className="font-mono text-xs text-gray-500 dark:text-[#F4ECD8]/60">{subvalue}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; className: string; label: string }> = {
    paid:     { icon: CircleCheck, className: 'bg-green-600/20 border-green-600 text-green-400', label: 'Paid' },
    pending:  { icon: Clock,       className: 'bg-yellow-600/20 border-yellow-600 text-yellow-300', label: 'Pending' },
    refunded: { icon: CircleX,     className: 'bg-red-600/20 border-red-600 text-red-400', label: 'Refunded' },
    failed:   { icon: CircleAlert, className: 'bg-red-800/20 border-red-800 text-red-500', label: 'Failed' },
  };
  const cfg = map[status] || { icon: CircleAlert, className: 'bg-gray-200 dark:bg-[#333] text-gray-600 dark:text-[#F4ECD8]/70', label: status };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
