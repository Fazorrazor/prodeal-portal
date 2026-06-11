'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function ChemicalSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [localTerm, setLocalTerm] = useState(searchParams.get('q') || '');

  // Debounce the URL update to prevent excessive renders
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (localTerm.trim()) {
        current.set('q', localTerm.trim());
      } else {
        current.delete('q');
      }
      // using router.replace to avoid building up a huge history stack for every keystroke
      router.replace(`${pathname}?${current.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [localTerm, pathname, router, searchParams]);

  return (
    <div className="relative max-w-xl mx-auto mb-12">
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-brand-deep-blue/40">
        <Search className="w-5 h-5" />
      </div>
      <label htmlFor="chemical-search" className="sr-only">Search Chemicals</label>
      <input
        id="chemical-search"
        type="text"
        placeholder="SEARCH BY CHEMICAL NAME OR CAS NUMBER..."
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-4 bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue outline-none transition-all text-brand-deep-blue font-bold text-sm tracking-widest uppercase placeholder:text-brand-deep-blue/30"
      />
    </div>
  );
}
