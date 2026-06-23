'use client';
import { Search, Bell, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AnimatedBorder } from './AnimatedBorder';
import { AlertsPanel } from './AlertsPanel';

export function AdminTopbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? null);
    });
  }, [supabase.auth]);

  // Keyboard shortcut ( / or Cmd+K )
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input/textarea
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
            <Search className="h-4 w-4 text-brand-deep-blue/80 group-focus-within:text-brand-blue transition-colors" />
          </div>
          <label htmlFor="global-search" className="sr-only">Global Search</label>
          <input 
            ref={inputRef}
            id="global-search"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search ticket ID, client, or phone..." 
            className="w-full pl-8 pr-16 py-1.5 bg-transparent border-0 border-b border-brand-border/60 focus:border-brand-blue outline-none transition-all font-mono text-brand-deep-blue text-sm placeholder:text-brand-deep-blue/30"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-0 sm:opacity-100">
            <span className="text-[10px] font-bold font-mono tracking-widest text-brand-deep-blue/30">PRESS /</span>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-6 ml-6">
        <div id="tour-alerts">
          <AlertsPanel />
        </div>
        
        <div className="flex items-center gap-3 pl-6 relative">
          <AnimatedBorder direction="left" delay={0.4} />
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest mb-0">Admin</p>
            <p className="text-xs font-mono text-brand-deep-blue/80 truncate max-w-[150px]">{email || 'Loading...'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
