'use client';

import { Search } from 'lucide-react';
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

  const isStaffView = pathname.startsWith('/admin/staff');
  const placeholder = isStaffView ? 'Search team members...' : 'Search inquiries, clients, or ref ID...';
  const targetRoute = isStaffView ? '/admin/staff' : '/admin/tickets';

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
    <header className="h-14 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20">
      <div className="flex-1 max-w-md">
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1A56DB] transition-colors duration-150">
            <Search className="h-3.5 w-3.5" />
          </div>
          <label htmlFor="global-search" className="sr-only">
            Search workspace
          </label>
          <input
            ref={inputRef}
            id="global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="w-full h-9 pl-8 pr-12 bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/15 rounded-lg outline-none transition-[background-color,border-color,box-shadow] duration-150 text-sm sm:text-[13px] font-medium text-[#0A1628] placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-0 items-center pr-2.5 pointer-events-none hidden sm:flex">
            <kbd className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-slate-400">
              ⌘K
            </kbd>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-4">
        <div id="tour-alerts">
          <AlertsPanel />
        </div>

        <div className="h-5 w-px bg-slate-200/80 hidden sm:block" />

        <div
          className="flex items-center gap-2.5 pl-1 cursor-default"
          title={email || 'Signed-in staff account'}
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[#0A1628] font-semibold text-xs shrink-0">
            {email ? email.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-[#0A1628] truncate max-w-[160px] leading-tight">
              {email || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
