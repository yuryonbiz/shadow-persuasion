'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, Edit, Users, Swords, ClipboardList, BookOpen, Trophy, Upload, LogOut, Sun, Moon, ChevronUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';

const ADMIN_EMAILS = ['ybyalik@gmail.com'];

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/analyze', icon: Search, label: 'Analyze' },
  { href: '/app/chat', icon: MessageSquare, label: 'Strategic Coach' },
  { href: '/app/rewrite', icon: Edit, label: 'Message Optimizer' },
  { href: '/app/people', icon: Users, label: 'People' },
  { href: '/app/training', icon: Swords, label: 'Training Arena' },
  { href: '/app/field-ops', icon: ClipboardList, label: 'Field Ops' },
  { href: '/app/techniques', icon: BookOpen, label: 'Techniques' },
  { href: '/app/score', icon: Trophy, label: 'Persuasion Score' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkClass = (href: string) =>
    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
      isActive(href)
        ? 'bg-[#D4A017] text-[#0A0A0A]'
        : 'text-gray-700 dark:text-gray-300 hover:bg-[#E5E2DB] dark:hover:bg-[#222222]'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#F5F2EB] dark:bg-[#1A1A1A] p-4 border-r border-[#E5E2DB] dark:border-[#333333]">
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-center font-mono tracking-wider text-gray-900 dark:text-white">SHADOW.OPS</h1>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={linkClass(item.href)}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            {user?.email && ADMIN_EMAILS.includes(user.email) && (
              <Link href="/app/admin" className={linkClass('/app/admin')}>
                <Upload className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Compact user footer with popup menu */}
        <div className="relative pt-3 border-t border-gray-200 dark:border-[#333333]" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#E5E2DB] dark:hover:bg-[#222] transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-[#0A0A0A] text-xs font-bold shrink-0">
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm truncate text-gray-600 dark:text-gray-400 flex-1 text-left">
              {user?.displayName || user?.email}
            </span>
            <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#333333] flex justify-around p-2 z-50">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center p-2 rounded-md ${
              isActive(item.href) ? 'text-[#D4A017]' : 'text-gray-500'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
