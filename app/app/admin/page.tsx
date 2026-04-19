'use client';

/* ════════════════════════════════════════════════════════════
   /admin — Dashboard
   Top-level overview with key metrics + links to each section.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  BookOpen,
  Shuffle,
  FolderTree,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';

type DashboardStats = {
  ordersTotal: number;
  ordersPaid: number;
  ordersRefunded: number;
  revenueCents: number;
  membersTotal: number;
  membersActive: number;
  booksTotal: number;
  chunksTotal: number;
  last24hOrders: number;
  last24hRevenueCents: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((data) => setStats(data.stats ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDollars = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
          // DASHBOARD //
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
          Admin Overview
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard
          icon={DollarSign}
          label="Revenue (All-Time)"
          value={stats ? fmtDollars(stats.revenueCents) : '…'}
          loading={loading}
        />
        <MetricCard
          icon={TrendingUp}
          label="Revenue (24h)"
          value={stats ? fmtDollars(stats.last24hRevenueCents) : '…'}
          loading={loading}
        />
        <MetricCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats ? String(stats.ordersTotal) : '…'}
          sublabel={stats ? `${stats.ordersPaid} paid · ${stats.ordersRefunded} refunded` : undefined}
          loading={loading}
        />
        <MetricCard
          icon={Activity}
          label="Orders (24h)"
          value={stats ? String(stats.last24hOrders) : '…'}
          loading={loading}
        />
        <MetricCard
          icon={Users}
          label="Members"
          value={stats ? String(stats.membersTotal) : '…'}
          sublabel={stats ? `${stats.membersActive} active` : undefined}
          loading={loading}
        />
        <MetricCard
          icon={BookOpen}
          label="Books Ingested"
          value={stats ? String(stats.booksTotal) : '…'}
          loading={loading}
        />
        <MetricCard
          icon={Shuffle}
          label="Technique Chunks"
          value={stats ? String(stats.chunksTotal) : '…'}
          loading={loading}
        />
      </div>

      {/* Navigation cards */}
      <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-4">
          // SECTIONS //
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NavCard
            href="/app/admin/members"
            icon={Users}
            title="Members"
            body="All registered users, SaaS subscribers, activity metrics, plan management."
          />
          <NavCard
            href="/app/admin/orders"
            icon={ShoppingBag}
            title="Orders"
            body="Every one-time purchase, order bump + upsell tracking, refund actions."
          />
          <NavCard
            href="/app/admin/books"
            icon={BookOpen}
            title="Books"
            body="Upload PDFs, ingest chunks, browse the knowledge base."
          />
          <NavCard
            href="/app/admin/techniques"
            icon={Shuffle}
            title="Techniques"
            body="Find and merge duplicate technique names across the knowledge base."
          />
          <NavCard
            href="/app/admin/taxonomy"
            icon={FolderTree}
            title="Taxonomy"
            body="Manage categories and use cases that classify techniques."
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/60">
          {label}
        </p>
        <Icon className="h-4 w-4 text-[#D4A017]/70" />
      </div>
      <p className={`font-mono text-2xl font-black text-[#D4A017] ${loading ? 'animate-pulse' : ''}`}>
        {value}
      </p>
      {sublabel && (
        <p className="font-mono text-[10px] text-gray-500 dark:text-[#F4ECD8]/50 mt-1">{sublabel}</p>
      )}
    </div>
  );
}

function NavCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-5 hover:border-[#D4A017] transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <Icon className="h-5 w-5 text-[#D4A017]" />
        <h3 className="font-mono font-bold uppercase tracking-wider text-[#D4A017]">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/70 leading-relaxed mb-3">{body}</p>
      <div className="flex items-center gap-1 text-xs text-[#D4A017] group-hover:gap-2 transition-all">
        Open
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
