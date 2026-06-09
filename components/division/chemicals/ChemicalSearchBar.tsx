'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useQuoteStore } from '../../../store/quoteStore';

export function ChemicalSearchBar() {
  const setSearchTerm = useQuoteStore((state) => state.setSearchTerm);
  const [localTerm, setLocalTerm] = useState('');

  // Debounce the global state update to prevent excessive renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [localTerm, setSearchTerm]);

  return (
    <div className="relative max-w-xl mx-auto mb-12">
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-brand-deep-blue/40">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder="SEARCH BY CHEMICAL NAME OR CAS NUMBER..."
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-4 bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue outline-none transition-all text-brand-deep-blue font-bold text-sm tracking-widest uppercase placeholder:text-brand-deep-blue/30"
      />
    </div>
  );
}
