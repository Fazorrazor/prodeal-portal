'use client';
import { Search, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AnimatedBorder } from './AnimatedBorder';
import { AlertsPanel } from './AlertsPanel';

export function AdminTopbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? null);
    });
  }, [supabase.auth]);

  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-6 lg:px-8 shrink-0 relative">
      <AnimatedBorder direction="bottom" delay={0.2} />
      
      <div className="flex-1 max-w-xl">
        <form 
          className="relative group"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/admin/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
              router.push(`/admin/tickets`);
            }
          }}
        >
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-blue">
            <Search className="h-4 w-4 text-brand-deep-blue/40 group-focus-within:text-brand-blue transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking ID, client, or phone..." 
            className="w-full pl-8 pr-4 py-1.5 bg-transparent border-0 border-b border-brand-border/60 focus:border-brand-blue outline-none transition-all font-mono text-brand-deep-blue text-sm placeholder:text-brand-deep-blue/30"
          />
        </form>
      </div>

      <div className="flex items-center gap-6 ml-6">
        <AlertsPanel />
        
        <div className="flex items-center gap-3 pl-6 relative">
          <AnimatedBorder direction="left" delay={0.4} />
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest mb-0">Admin</p>
            <p className="text-xs font-mono text-brand-deep-blue/60 truncate max-w-[150px]">{email || 'Loading...'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
