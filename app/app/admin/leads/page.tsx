'use client';

/* ════════════════════════════════════════════════════════════
   /admin/leads — Checkout leads + recovery sequence tracking
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useMemo } from 'react';
import {
  Search, RefreshCw, Filter, Mail, UserPlus, CircleCheck, CircleX,
  TrendingUp, DollarSign, Users, Activity,
} from 'lucide-react';

type Lead = {
  id: string;
  email: string;
  first_name: string | null;
  funnel: string;
  include_bump: boolean;
  amount_cents: number | null;
  status:
    | 'created'
    | 'recovery_sent_1'
    | 'recovery_sent_2'
    | 'recovery_sent_3'
    | 'converted'
    | 'recovered'
    | 'abandoned';
  converted_at: string | null;
  recovery_emails: Array<{ step: number; sent_at: string; email_id: string | null }> | null;
  recovered_by_email_step: number | null;
  stripe_payment_intent_id: string | null;
  is_test: boolean;
  created_at: string;
  updated_at: string;
};

type Stats = {
  total: number;
  byStatus: Record<string, number>;
  converted: number;
  conversionRate: number;
  recoveryRate: number;
  conversionRevenueCents: number;
  recoveryRevenueCents: number;
  recoveryByStep: Record<string, number>;
  last24h: number;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  created:         { label: 'Pending',        cls: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  recovery_sent_1: { label: 'Email 1 sent',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  recovery_sent_2: { label: 'Email 2 sent',   cls: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  recovery_sent_3: { label: 'Email 3 sent',   cls: 'bg-blue-300 text-blue-900 dark:bg-blue-900/70 dark:text-blue-200' },
  converted:       { label: 'Converted',      cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  recovered:       { label: 'Recovered',      cls: 'bg-[#D4A017]/20 text-[#D4A017]' },
  abandoned:       { label: 'Abandoned',      cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [includeTest, setIncludeTest] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    if (includeTest) params.set('includeTest', '1');
    params.set('limit', '500');
    try {
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setStats(data.stats ?? null);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, includeTest]);

  const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
  const fmtDateOnly = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  const funnelRate = useMemo(() => {
    if (!stats) return null;
    const emailsSent =
      stats.byStatus.recovery_sent_1 +
      stats.byStatus.recovery_sent_2 +
      stats.byStatus.recovery_sent_3 +
      stats.byStatus.abandoned +
      stats.byStatus.recovered;
    return {
      created: stats.total,
      sentAnyEmail: emailsSent,
      recovered: stats.byStatus.recovered,
      recoveryRate: stats.recoveryRate,
    };
  }, [stats]);

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // LEADS //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Checkout Leads
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            Captured emails from <code className="font-mono text-xs">/checkout/book</code> before payment. Recovery sequence runs hourly via cron.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-[#D4A017] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ═════════ TOP STATS ═════════ */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Users}
            label="Total leads"
            value={String(stats.total)}
            sub={`${stats.last24h} in last 24h`}
          />
          <StatCard
            icon={CircleCheck}
            label="Total conversions"
            value={String(stats.converted)}
            sub={`${stats.conversionRate.toFixed(1)}% overall`}
          />
          <StatCard
            icon={TrendingUp}
            label="Recovered"
            value={String(stats.byStatus.recovered ?? 0)}
            sub={`${stats.recoveryRate.toFixed(1)}% of recovery-sent`}
          />
          <StatCard
            icon={DollarSign}
            label="Revenue from recovery"
            value={fmt$(stats.recoveryRevenueCents)}
            sub={`+${fmt$(stats.conversionRevenueCents)} organic`}
          />
        </div>
      )}

      {/* ═════════ RECOVERY FUNNEL ═════════ */}
      {funnelRate && (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5 mb-6">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/70 mb-4">
            // RECOVERY EMAIL FUNNEL //
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <FunnelStep label="Leads captured" value={funnelRate.created} />
            <FunnelStep label="Got at least 1 email" value={funnelRate.sentAnyEmail} />
            <FunnelStep label="Recovered" value={funnelRate.recovered} />
            <FunnelStep
              label="Recovery rate"
              value={`${funnelRate.recoveryRate.toFixed(1)}%`}
              emphasized
            />
          </div>
          {stats && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#D4A017]/10 text-xs font-mono text-gray-600 dark:text-[#F4ECD8]/60">
              Recovered by email step:&nbsp;
              <span className="text-[#D4A017] font-bold">Email 1:</span> {stats.recoveryByStep['1']}
              &nbsp;·&nbsp;
              <span className="text-[#D4A017] font-bold">Email 2:</span> {stats.recoveryByStep['2']}
              &nbsp;·&nbsp;
              <span className="text-[#D4A017] font-bold">Email 3:</span> {stats.recoveryByStep['3']}
            </div>
          )}
        </div>
      )}

      {/* ═════════ FILTERS ═════════ */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-60">
          <label className="block text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-1">
            Search email
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
            <option value="created">Pending (created)</option>
            <option value="recovery_sent_1">Sent Email 1</option>
            <option value="recovery_sent_2">Sent Email 2</option>
            <option value="recovery_sent_3">Sent Email 3</option>
            <option value="converted">Converted (organic)</option>
            <option value="recovered">Recovered (post-email)</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70 self-end pb-2">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(e) => setIncludeTest(e.target.checked)}
            className="accent-[#D4A017]"
          />
          Include test leads
        </label>
        <button
          onClick={load}
          className="px-4 py-2 bg-[#D4A017] text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#C4901A]"
        >
          <Filter className="h-3.5 w-3.5 inline mr-1.5" />
          Apply
        </button>
      </div>

      {/* ═════════ TABLE ═════════ */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Captured</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Email</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Intent</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Status</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Emails</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Converted</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading && leads.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">Loading…</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">No leads match these filters.</td></tr>
            ) : (
              leads.map((l) => {
                const meta = STATUS_META[l.status] || { label: l.status, cls: 'bg-gray-200 text-gray-700' };
                const emailsSent = (l.recovery_emails?.length ?? 0);
                return (
                  <tr key={l.id} className={`border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A] ${l.is_test ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-[#F4ECD8]/70 font-mono whitespace-nowrap">
                      {fmtDate(l.created_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-gray-900 dark:text-[#F4ECD8] flex items-center gap-2 flex-wrap">
                        {l.email}
                        {l.is_test && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-purple-600 text-white font-bold">
                            Test
                          </span>
                        )}
                      </div>
                      {l.first_name && (
                        <div className="text-xs text-gray-500 dark:text-[#F4ECD8]/50">{l.first_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className="bg-[#D4A017] text-black px-2 py-0.5 font-mono uppercase tracking-wider font-bold mr-1">
                        Book
                      </span>
                      {l.include_bump && (
                        <span className="bg-[#5C3A1E] text-[#F4ECD8] px-2 py-0.5 font-mono uppercase tracking-wider font-bold">
                          Bump
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {l.recovered_by_email_step && (
                        <div className="text-[10px] text-[#D4A017] font-mono mt-1">
                          Closed by Email {l.recovered_by_email_step}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono">
                      {emailsSent > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#D4A017]">
                          <Mail className="h-3 w-3" /> {emailsSent}/3
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-[#F4ECD8]/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-[#F4ECD8]/70 font-mono">
                      {fmtDateOnly(l.converted_at)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-mono font-bold text-[#D4A017]">
                      {l.amount_cents ? fmt$(l.amount_cents) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60">
          {label}
        </p>
        <Icon className="h-4 w-4 text-[#D4A017]/70" />
      </div>
      <p className="font-mono text-2xl font-black text-[#D4A017]">{value}</p>
      {sub && <p className="font-mono text-[10px] text-gray-500 dark:text-[#F4ECD8]/50 mt-1">{sub}</p>}
    </div>
  );
}

function FunnelStep({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: number | string;
  emphasized?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60 mb-1">
        {label}
      </p>
      <p className={`font-mono font-black ${emphasized ? 'text-3xl text-[#D4A017]' : 'text-2xl text-gray-900 dark:text-[#F4ECD8]'}`}>
        {value}
      </p>
    </div>
  );
}
