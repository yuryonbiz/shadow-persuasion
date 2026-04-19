'use client';

/* ════════════════════════════════════════════════════════════
   /admin/members — Users & Subscriptions
   Extracted from the former monolithic admin page.
   Enhanced with per-user order count + total $ spent cross-reference.
   ════════════════════════════════════════════════════════════ */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, Users, Search, ShoppingBag, DollarSign } from 'lucide-react';

type UserRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  registered_at: string | null;
  last_active: string | null;
  total_sessions: number;
  total_messages: number;
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
};

type OrderSummary = {
  email: string;
  orderCount: number;
  totalCents: number;
};

export default function MembersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [orderSummaries, setOrderSummaries] = useState<Map<string, OrderSummary>>(new Map());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);

      // Also fetch orders to aggregate counts per email
      const ordersRes = await fetch('/api/admin/orders?limit=500');
      const ordersData = await ordersRes.json();
      const byEmail = new Map<string, OrderSummary>();
      for (const o of ordersData.orders ?? []) {
        if (!o.email) continue;
        const email = o.email.toLowerCase();
        const s = byEmail.get(email) || { email, orderCount: 0, totalCents: 0 };
        s.orderCount += 1;
        if (o.status === 'paid') s.totalCents += o.amount_cents;
        byEmail.set(email, s);
      }
      setOrderSummaries(byEmail);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.user_id.includes(q)
    );
  }, [users, search]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  async function act(userId: string, action: string, plan?: string) {
    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, plan }),
      });
      loadUsers();
    } catch {}
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // MEMBERS //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Members & Subscribers
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            {users.length} total · Cross-referenced with orders for full customer view.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-[#D4A017] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-[#F4ECD8]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, or user ID…"
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">User</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Registered</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Last Active</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Sessions</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Messages</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Plan</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Status</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Period End</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Orders</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Spent</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">No users.</td></tr>
            ) : (
              filtered.map((u) => {
                const summary = u.email ? orderSummaries.get(u.email.toLowerCase()) : null;
                return (
                  <tr key={u.user_id} className="border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A]">
                    <td className="px-3 py-2.5" title={u.user_id}>
                      <div className="text-gray-900 dark:text-[#F4ECD8] text-xs">{u.email || u.user_id.slice(0, 12) + '…'}</div>
                      {u.display_name && <div className="text-gray-500 dark:text-[#F4ECD8]/50 text-[10px]">{u.display_name}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-[#F4ECD8]/70 text-xs">{fmtDate(u.registered_at)}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-[#F4ECD8]/70 text-xs">{fmtDate(u.last_active)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-900 dark:text-[#F4ECD8] font-mono text-xs">{u.total_sessions}</td>
                    <td className="px-3 py-2.5 text-right text-gray-900 dark:text-[#F4ECD8] font-mono text-xs">{u.total_messages}</td>
                    <td className="px-3 py-2.5 text-gray-900 dark:text-[#F4ECD8] capitalize text-xs">
                      {u.subscription_plan || <span className="text-gray-400 dark:text-[#F4ECD8]/40">Free</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                        u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' :
                        u.subscription_status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                        u.subscription_status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        u.subscription_status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#F4ECD8]/50'
                      }`}>
                        {u.subscription_status || 'none'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-[#F4ECD8]/70 text-xs">{fmtDate(u.subscription_period_end)}</td>
                    <td className="px-3 py-2.5 text-right text-xs">
                      {summary ? (
                        <span className="inline-flex items-center gap-1 text-[#D4A017]">
                          <ShoppingBag className="h-3 w-3" />
                          {summary.orderCount}
                        </span>
                      ) : <span className="text-gray-400 dark:text-[#F4ECD8]/30">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs">
                      {summary ? (
                        <span className="text-[#D4A017] font-bold font-mono">{fmt(summary.totalCents)}</span>
                      ) : <span className="text-gray-400 dark:text-[#F4ECD8]/30">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.email && summary && (
                          <Link
                            href={`/app/admin/orders?search=${encodeURIComponent(u.email)}`}
                            className="text-[10px] text-[#D4A017] hover:underline font-mono"
                          >
                            View
                          </Link>
                        )}
                        {u.subscription_status !== 'active' ? (
                          <select
                            className="text-[10px] bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 px-1 py-0.5 text-gray-900 dark:text-[#F4ECD8] font-mono"
                            defaultValue=""
                            onChange={async (e) => {
                              const plan = e.target.value;
                              if (!plan) return;
                              if (!confirm(`Grant ${plan} access to ${(u.email || u.user_id.slice(0, 8))}?`)) {
                                e.target.value = ''; return;
                              }
                              await act(u.user_id, 'grant', plan);
                              e.target.value = '';
                            }}
                          >
                            <option value="">Grant…</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        ) : (
                          <>
                            <select
                              className="text-[10px] bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 px-1 py-0.5 text-gray-900 dark:text-[#F4ECD8] font-mono"
                              defaultValue=""
                              onChange={async (e) => {
                                const plan = e.target.value;
                                if (!plan) return;
                                if (!confirm(`Change to ${plan}?`)) { e.target.value = ''; return; }
                                await act(u.user_id, 'change_plan', plan);
                                e.target.value = '';
                              }}
                            >
                              <option value="">Plan…</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                            <button
                              onClick={async () => {
                                if (!confirm('Revoke access?')) return;
                                await act(u.user_id, 'revoke');
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 border border-red-500/30"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
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
