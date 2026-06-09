'use client';
import { useState } from 'react';
import { cn } from '../../../lib/utils';

const CATEGORIES = ['All Grades', 'Industrial', 'Laboratory', 'Specialty', 'Food Grade'];

export function ChemicalFilters() {
  const [active, setActive] = useState('All Grades');

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={cn(
            "px-6 py-3 border-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
            active === cat 
              ? "border-brand-red bg-brand-red text-white"
              : "border-brand-border/60 bg-transparent text-brand-deep-blue/60 hover:border-brand-deep-blue hover:text-brand-deep-blue"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
