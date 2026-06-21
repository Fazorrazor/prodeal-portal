'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Settings, LogOut, Activity } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { AnimatedBorder } from './AnimatedBorder';

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
      { name: 'System Logs', href: '/admin/system-logs', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ] : [])
  ];

  return (
    <aside id="tour-sidebar" className="w-56 bg-transparent text-brand-deep-blue flex flex-col h-full shrink-0 relative">
      <AnimatedBorder direction="right" />
      <div className="h-16 flex items-center px-6 relative">
        <AnimatedBorder direction="bottom" />
        <h1 className="font-display text-xl tracking-tighter flex items-baseline">
          <strong className="font-extrabold text-brand-deep-blue mr-1.5">Prodeal</strong>
          <span className="text-xs text-brand-blue/60 font-body uppercase tracking-widest ml-2">Admin</span>
        </h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link, i) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold transition-all duration-300 rounded-md animate-in fade-in slide-in-from-left-4 fill-mode-both ${
                isActive 
                  ? 'bg-brand-blue/10 text-brand-blue' 
                  : 'text-brand-deep-blue/70 hover:bg-black/5 hover:text-brand-deep-blue'
              }`}
              style={{ animationDelay: `${100 + i * 50}ms` }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 relative">
        <AnimatedBorder direction="top" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-brand-deep-blue/70 hover:bg-brand-red/10 hover:text-brand-red transition-colors w-full rounded-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
