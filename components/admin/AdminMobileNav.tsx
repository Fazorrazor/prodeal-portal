'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Settings, Activity, AlertCircle } from 'lucide-react';
import { AnimatedBorder } from './AnimatedBorder';
import { motion } from 'framer-motion';

export function AdminMobileNav({ userRole = 'agent' }: { userRole?: string }) {
  const pathname = usePathname();

  const links = [
    { name: 'Dash', href: '/admin', icon: LayoutDashboard },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
    ...(userRole === 'admin' ? [
      { name: 'Staff', href: '/admin/staff', icon: Users },
      { name: 'Issues', href: '/admin/complaints', icon: AlertCircle },
      { name: 'Logs', href: '/admin/system-logs', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ] : [])
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-surface border-t border-brand-border/40 z-50 flex pb-safe shrink-0">
      <AnimatedBorder direction="top" />
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex-1 relative flex flex-col items-center justify-center h-full space-y-1.5 transition-colors pt-2 ${
              isActive 
                ? 'text-brand-blue' 
                : 'text-brand-deep-blue/40 hover:text-brand-deep-blue/80'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 flex justify-center">
                <motion.div 
                  layoutId="mobileNavActiveIndicator"
                  className="w-8 h-[3px] bg-brand-blue" 
                />
              </div>
            )}
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[9px] font-bold tracking-widest uppercase">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
