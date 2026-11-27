'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Inbox, Users, LogOut } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NetworkPresence } from './NetworkPresence';
import { STORAGE_LAST_ACTIVITY, STORAGE_LOGOUT_EVENT } from '../../hooks/useIdleTimeout';

export function AdminSidebar({ userRole = 'agent' }: { userRole?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    try {
      localStorage.removeItem(STORAGE_LAST_ACTIVITY);
      localStorage.setItem(STORAGE_LOGOUT_EVENT, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
    await Promise.allSettled([
      fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'same-origin' }),
      supabase.auth.signOut(),
    ]);
    router.push('/admin/login');
    router.refresh();
  };

  const links = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Inquiries', href: '/admin/tickets', icon: Inbox },
    ...(userRole === 'admin' ? [{ name: 'Team', href: '/admin/staff', icon: Users }] : []),
  ];

  return (
    <aside
      id="tour-sidebar"
      className="hidden lg:flex w-[232px] bg-white text-[#0A1628] flex-col h-full shrink-0 border-r border-slate-200/80"
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200/60 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 group outline-none">
          <span className="w-6 h-6 rounded-md bg-[#0A1628] text-white flex items-center justify-center text-[11px] font-bold tracking-tight shrink-0">
            P
          </span>
          <span className="font-semibold text-sm tracking-tight text-[#0A1628]">Prodeal</span>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/70">
            Desk
          </span>
        </Link>
      </div>

      {/* Focused Navigation */}
      <nav aria-label="Admin navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-2.5 pt-1 pb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        {links.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 text-[13px] rounded-lg transition-[color,background-color] duration-150 ease-out ${
                isActive
                  ? 'bg-slate-100 text-[#0A1628] font-semibold'
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-[#0A1628]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#1A56DB]' : 'text-slate-400'
                }`}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Online Presence */}
      <NetworkPresence />

      {/* Sign Out Footer */}
      <div className="p-3 border-t border-slate-200/60 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.98] w-full rounded-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
