'use client';

/* ════════════════════════════════════════════════════════════
   /admin/orders — Customer sessions (grouped by email)

   A "session" aggregates everything one customer bought in the funnel:
   book + bump + upsell #1 + upsell #2 subscription. One row per customer.
   Click the row → detail page shows the individual Stripe charges.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, RefreshCw, CircleCheck, CircleX, CircleAlert, Clock, ExternalLink, Users, TrendingDown } from 'lucide-react';

type OrderRow = {
  id: string;
  email: string;
  stripe_payment_intent_id: string | null;
  items: string[];
  amount_cents: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  created_at: string;
};

type CustomerSession = {
  email: string;
  customer_id: string | null;
  items: string[];
  order_count: number;
  total_cents: number;
  pending_cents: number;
  refunded_cents: number;
  statusCounts: Record<string, number>;
  rolled_up_status: 'paid' | 'pending' | 'refunded' | 'mixed';
  has_subscription: boolean;
  subscription: {
    id: string;
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
  first_at: string;
  latest_at: string;
  orders: OrderRow[];
  is_test: boolean;
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

export default function OrdersPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 md:p-10 text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">Loading…</div>}>
      <OrdersPage />
    </Suspense>
  );
}

function OrdersPage() {
  const searchParams = useSearchParams();
  // Read ?search= and ?email= from the URL so links from /admin/members
  // land on the filtered view. `email` is treated as an exact-match hint
  // that gets forwarded to the API as the existing `search` filter —
  // substring matching is already safe here because full email addresses
  // don't substring-match each other (e.g. "y.byalik@gmail.com" is NOT
  // a substring of "ybyalik@gmail.com").
  const initialSearch =
    searchParams.get('search') || searchParams.get('email') || '';

  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [total, setTotal] = useState(0);
  const [rawOrderCount, setRawOrderCount] = useState(0);
  const [totalRevenueCents, setTotalRevenueCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [product, setProduct] = useState('all');
  const [search, setSearch] = useState(initialSearch);
  // Test orders are hidden by default. Toggle on to review flagged
  // test data (e.g. to unmark one that was flagged by mistake).
  const [includeTest, setIncludeTest] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (product !== 'all') params.set('product', product);
    if (search) params.set('search', search);
    if (includeTest) params.set('includeTest', '1');
    params.set('limit', '300');
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setSessions(data.sessions ?? []);
    setFunnel(data.funnel ?? null);
    setTotal(data.total ?? 0);
    setRawOrderCount(data.rawOrderCount ?? 0);
    setTotalRevenueCents(data.totalRevenueCents ?? 0);
    setLoading(false);
  }

  // Reload whenever a filter changes. Search is debounced 300ms so typing
  // in the search box doesn't hammer the API.
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, product, search, includeTest]);

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
            // CUSTOMER SESSIONS //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Orders
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            Each row aggregates one customer&apos;s full funnel journey (book + bump + upsells + subscription). Drill in to see individual Stripe charges.
          </p>
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
            <option value="paid">Paid (all)</option>
            <option value="pending">Has pending</option>
            <option value="mixed">Mixed</option>
            <option value="refunded">Refunded</option>
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
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70 self-end pb-2">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(e) => setIncludeTest(e.target.checked)}
            className="accent-[#D4A017]"
          />
          Include test orders
        </label>
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
        Showing {sessions.length} of {total} sessions · {rawOrderCount} individual Stripe charges underlying · Revenue (filtered view): {fmt(totalRevenueCents)}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Latest</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Email</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Items purchased</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Paid</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Status</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Subscription</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">Loading…</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono text-sm">No customer sessions match these filters.</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.email} className={`border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A] ${s.is_test ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-[#F4ECD8]/70 font-mono whitespace-nowrap">
                    {fmtDate(s.latest_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-[#F4ECD8] text-sm">
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      {s.email}
                      {s.is_test && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-purple-600 text-white font-bold">
                          Test
                        </span>
                      )}
                    </span>
                    {s.order_count > 1 && (
                      <div className="text-[10px] text-gray-500 dark:text-[#F4ECD8]/50 font-mono mt-0.5">
                        {s.order_count} charges
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.items.length === 0 && s.has_subscription && (
                        <span className="text-xs text-gray-500 dark:text-[#F4ECD8]/50 italic">SaaS only</span>
                      )}
                      {s.items.map((slug) => {
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
                    {fmt(s.total_cents)}
                    {s.pending_cents > 0 && (
                      <div className="text-[10px] text-yellow-600 dark:text-yellow-400 font-normal">
                        + {fmt(s.pending_cents)} pending
                      </div>
                    )}
                    {s.refunded_cents > 0 && (
                      <div className="text-[10px] text-red-600 dark:text-red-400 font-normal">
                        − {fmt(s.refunded_cents)} refunded
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.rolled_up_status} />
                  </td>
                  <td className="px-4 py-3">
                    {s.subscription ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#D4A017]">
                        <Users className="h-3 w-3" />
                        {s.subscription.plan}
                        <span className="text-gray-500 dark:text-[#F4ECD8]/50 ml-1">({s.subscription.status})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-[#F4ECD8]/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.orders.length > 0 ? (
                      <Link
                        href={`/app/admin/orders/${s.orders[0].id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
                      >
                        Open
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-[#F4ECD8]/30">—</span>
                    )}
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
    paid:     { icon: CircleCheck, className: 'bg-green-600/20 border-green-600 text-green-700 dark:text-green-400', label: 'Paid' },
    pending:  { icon: Clock,       className: 'bg-yellow-600/20 border-yellow-600 text-yellow-700 dark:text-yellow-300', label: 'Pending' },
    refunded: { icon: CircleX,     className: 'bg-red-600/20 border-red-600 text-red-700 dark:text-red-400', label: 'Refunded' },
    mixed:    { icon: CircleAlert, className: 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400', label: 'Mixed' },
    failed:   { icon: CircleAlert, className: 'bg-red-800/20 border-red-800 text-red-700 dark:text-red-500', label: 'Failed' },
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
