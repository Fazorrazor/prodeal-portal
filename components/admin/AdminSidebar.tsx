'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Settings, LogOut, Activity, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { NetworkPresence } from './NetworkPresence';

export function AdminSidebar({ userRole = 'agent' }: { userRole?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
    ...(userRole === 'admin' ? [
      { name: 'Staff', href: '/admin/staff', icon: Users },
      { name: 'Analytics', href: '/admin/analytics', icon: Activity },
      { name: 'Complaints', href: '/admin/complaints', icon: AlertCircle },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ] : [])
  ];

  return (
    <aside id="tour-sidebar" className="hidden lg:flex w-56 bg-brand-surface/50 text-brand-deep-blue flex-col h-full shrink-0 relative border-r border-slate-200/60">
      <div className="h-20 flex items-center px-6 relative">
        <h1 className="font-display text-xl tracking-tight flex items-baseline">
          <strong className="font-extrabold text-brand-deep-blue mr-1.5">Prodeal</strong>
          <span className="text-xs text-brand-blue/80 font-body uppercase tracking-widest ml-2">Admin</span>
        </h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link, i) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-xl ${
                isActive 
                  ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-2xs' 
                  : 'text-slate-500 hover:bg-white hover:shadow-2xs hover:text-brand-deep-blue'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <NetworkPresence />

      <div className="p-4 relative">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-brand-red transition-all w-full rounded-xl"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
