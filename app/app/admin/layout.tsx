'use client';

/* ════════════════════════════════════════════════════════════
   /admin/layout.tsx — Shared admin layout with sidebar navigation.
   Supports both light and dark themes (follows the app's global theme).
   Enforces admin access on every child page.
   ════════════════════════════════════════════════════════════ */

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  UserPlus,
  BookOpen,
  Shuffle,
  FolderTree,
  Mail,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useAdmin } from '@/lib/hooks/useAdmin';

const NAV = [
  { href: '/app/admin',            label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/admin/members',    label: 'Members',   icon: Users },
  { href: '/app/admin/orders',     label: 'Orders',    icon: ShoppingBag },
  { href: '/app/admin/leads',      label: 'Leads',     icon: UserPlus },
  { href: '/app/admin/emails',     label: 'Emails',    icon: Mail },
  { href: '/app/admin/books',      label: 'Books',     icon: BookOpen },
  { href: '/app/admin/techniques', label: 'Techniques', icon: Shuffle },
  { href: '/app/admin/taxonomy',   label: 'Taxonomy',  icon: FolderTree },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, adminLoading } = useAdmin();

  useEffect(() => {
    if (!loading && !adminLoading && !isAdmin) {
      router.replace('/app');
    }
  }, [loading, adminLoading, isAdmin, router]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <p className="font-mono text-sm text-[#D4A017]">Verifying access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-[#F4ECD8]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-[#D4A017]/20 min-h-screen sticky top-0">
          <div className="p-5 border-b border-gray-200 dark:border-[#D4A017]/20">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-1">
              // ADMIN //
            </p>
            <p className="font-mono font-bold text-[#D4A017] text-sm">
              Shadow Persuasion
            </p>
          </div>
          <nav className="p-3 space-y-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/app/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 font-mono text-sm uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-[#D4A017] text-black font-bold'
                      : 'text-gray-700 dark:text-[#F4ECD8]/80 hover:bg-[#D4A017]/10 hover:text-[#D4A017]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 mt-8 border-t border-gray-200 dark:border-[#D4A017]/10">
            <Link
              href="/app"
              className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 dark:text-[#F4ECD8]/50 hover:text-[#D4A017]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Back to app
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
