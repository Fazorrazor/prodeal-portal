'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Settings, AlertCircle } from 'lucide-react';

export function AdminMobileNav({ userRole = 'agent' }: { userRole?: string }) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
    ...(userRole === 'admin' ? [
      { name: 'Staff', href: '/admin/staff', icon: Users },
      { name: 'Support', href: '/admin/complaints', icon: AlertCircle },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ] : [])
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-50 flex items-center justify-around px-2 pb-safe shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center min-w-[56px] h-full py-1 transition-colors duration-200 ${
              isActive 
                ? 'text-brand-blue' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2px] scale-105' : 'stroke-[1.7px]'}`} />
            <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold text-brand-blue' : 'font-medium text-slate-400'}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
