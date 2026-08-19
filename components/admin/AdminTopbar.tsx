'use client';

import { Search, Bell, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertsPanel } from './AlertsPanel';

export function AdminTopbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? null);
    });
  }, [supabase.auth]);

  let placeholder = "Search inquiries...";
  let targetRoute = "/admin/tickets";
  
  if (pathname.startsWith('/admin/staff')) {
    placeholder = "Search staff roster...";
    targetRoute = "/admin/staff";
  } else if (pathname.startsWith('/admin/system-logs')) {
    placeholder = "Search logs & telemetry...";
    targetRoute = "/admin/system-logs";
  } else if (pathname.startsWith('/admin/settings')) {
    placeholder = "Search settings...";
    targetRoute = "/admin/settings";
  }

  // Keyboard shortcut ( / or Cmd+K )
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.target !== inputRef.current) return;
      }

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <header className="h-16 bg-white/60 backdrop-blur-md border-b border-slate-100/80 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20">
      <div className="flex-1 max-w-lg">
        <form 
          className="relative group"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`${targetRoute}?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
              router.push(targetRoute);
            }
          }}
        >
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <label htmlFor="global-search" className="sr-only">Global Search</label>
          <input 
            ref={inputRef}
            id="global-search"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="w-full pl-9 pr-14 py-2 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200/50 focus:border-brand-blue/40 rounded-full outline-none transition-all text-xs sm:text-sm font-medium text-brand-deep-blue placeholder:text-slate-400 shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none hidden sm:flex">
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500">
              ⌘K
            </span>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 ml-4">
        <div id="tour-alerts">
          <AlertsPanel />
        </div>
        
        <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs shrink-0">
            {email ? email.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest leading-none mb-0.5">Admin</p>
            <p className="text-xs font-mono text-slate-500 truncate max-w-[140px]">{email || 'Loading...'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
