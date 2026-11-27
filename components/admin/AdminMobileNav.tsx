'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Users } from 'lucide-react';

export function AdminMobileNav({ userRole = 'agent' }: { userRole?: string }) {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Inquiries', href: '/admin/tickets', icon: Inbox },
    ...(userRole === 'admin' ? [{ name: 'Team', href: '/admin/staff', icon: Users }] : []),
  ];

  return (
    <nav
      aria-label="Mobile admin navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 z-50 flex items-center justify-around px-3 pb-safe shrink-0"
    >
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center min-w-[68px] min-h-[44px] py-1 transition-colors duration-150 ${
              isActive ? 'text-[#1A56DB]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.75px]'}`} />
            <span className={`text-[11px] tracking-tight mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
