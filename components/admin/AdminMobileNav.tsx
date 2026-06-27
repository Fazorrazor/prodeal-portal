'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Settings, Activity } from 'lucide-react';
import { AnimatedBorder } from './AnimatedBorder';

export function AdminMobileNav({ userRole = 'agent' }: { userRole?: string }) {
  const pathname = usePathname();

  const links = [
    { name: 'Dash', href: '/admin', icon: LayoutDashboard },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
    ...(userRole === 'admin' ? [
      { name: 'Staff', href: '/admin/staff', icon: Users },
      { name: 'Logs', href: '/admin/system-logs', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ] : [])
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-surface z-50 flex items-center justify-around px-2 pb-safe shrink-0">
      <AnimatedBorder direction="top" />
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive 
                ? 'text-brand-blue' 
                : 'text-brand-deep-blue/60 hover:text-brand-deep-blue'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-widest uppercase">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
