'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Eye, MessageSquare, FileText, BookOpen, Upload, Edit, Brain, Zap, Shield, Target, Swords, Layers, Trophy, UserSearch, ClipboardList, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';

const ADMIN_EMAILS = ['ybyalik@gmail.com'];

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/decode', icon: Eye, label: 'Conversation Intelligence' },
  { href: '/app/chat', icon: MessageSquare, label: 'Strategic Coach' },
  { href: '/app/rewrite', icon: Edit, label: 'Message Optimizer' },
  { href: '/app/conversations', icon: Brain, label: 'Relationship Memory' },
  { href: '/app/scenarios', icon: FileText, label: 'Practice Scenarios' },
  { href: '/app/library', icon: BookOpen, label: 'Technique Library' },
];

const newFeatureItems = [
  { href: '/app/quickfire', icon: Zap, label: 'Quick-Fire' },
  { href: '/app/profiler', icon: UserSearch, label: 'Person Profiler' },
  { href: '/app/scanner', icon: Shield, label: 'Defense Scanner' },
  { href: '/app/journal', icon: ClipboardList, label: 'Field Reports' },
  { href: '/app/missions', icon: Target, label: 'Daily Missions' },
  { href: '/app/sparring', icon: Swords, label: 'Sparring' },
  { href: '/app/stacking', icon: Layers, label: 'Technique Stacking' },
  { href: '/app/score', icon: Trophy, label: 'Persuasion Score' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#F5F2EB] dark:bg-[#1A1A1A] p-4 border-r border-[#E5E2DB] dark:border-[#333333]">
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-center font-mono tracking-wider text-white dark:text-white">SHADOW.OPS</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive(item.href)
                      ? 'bg-[#D4A017] text-[#0A0A0A]'
                      : 'text-gray-300 hover:bg-[#222222] dark:hover:bg-[#222222] hover:bg-[#E5E2DB]'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            {user?.email && ADMIN_EMAILS.includes(user.email) && (
              <Link
                href="/app/admin"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive('/app/admin')
                      ? 'bg-[#D4A017] text-[#0A0A0A]'
                      : 'text-gray-300 hover:bg-[#222222] dark:hover:bg-[#222222] hover:bg-[#E5E2DB]'
                  }
                `}
              >
                <Upload className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}
          </nav>
          <div className="mt-6 pt-4 border-t border-[#333333]">
            <p className="px-3 mb-2 text-xs font-bold uppercase tracking-widest text-[#D4A017]">New Features</p>
            <nav className="space-y-1">
              {newFeatureItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${
                      isActive(item.href)
                        ? 'bg-[#D4A017] text-[#0A0A0A]'
                        : 'hover:bg-[#222222]'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="pt-4 border-t border-[#333333] space-y-2">
           {user && (
             <div className="flex items-center space-x-3 px-3 py-2">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
               ) : (
                 <div className="w-7 h-7 rounded-full bg-[#D4A017] flex items-center justify-center text-[#0A0A0A] text-xs font-bold">
                   {(user.displayName || user.email || '?')[0].toUpperCase()}
                 </div>
               )}
               <span className="text-sm truncate text-[#888888]">{user.displayName || user.email}</span>
             </div>
           )}
           <button
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="w-full flex items-center justify-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#222222] dark:hover:bg-[#222222] hover:bg-[#E5E2DB] transition-colors"
           >
             {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             <span className="font-medium">Toggle Theme</span>
           </button>
           <button
             onClick={signOut}
             className="w-full flex items-center justify-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#222222] transition-colors text-red-400 hover:text-red-300"
           >
             <LogOut className="h-5 w-5" />
             <span className="font-medium">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333333] flex justify-around p-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center p-2 rounded-md
              ${
                isActive(item.href)
                  ? 'text-[#D4A017]'
                  : 'text-gray-500'
              }
            `}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
