'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useRfqStore, RfqItem } from '@/lib/store/rfqStore';

interface QuickRfqButtonProps {
  item: Omit<RfqItem, 'quantity'> & { quantity?: number };
  className?: string;
  variant?: 'icon' | 'badge' | 'button';
}

export function QuickRfqButton({ item, className = '', variant = 'button' }: QuickRfqButtonProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useRfqStore();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAdd}
        title="Add to RFQ Tray"
        className={`p-2 rounded-full bg-white/90 backdrop-blur-md text-brand-deep-blue shadow-md hover:bg-brand-blue hover:text-white transition-all active:scale-95 ${className}`}
      >
        {added ? <Check className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        onClick={handleAdd}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border transition-all ${
          added
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-white/80 hover:bg-white text-brand-deep-blue border-brand-border/40 hover:border-brand-blue'
        } ${className}`}
      >
        {added ? (
          <>
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Added</span>
          </>
        ) : (
          <>
            <Plus className="w-3 h-3 text-brand-blue" />
            <span>+ RFQ</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        added
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-brand-surface hover:bg-brand-border/20 text-brand-deep-blue border border-brand-border/40 hover:border-brand-blue/40'
      } ${className}`}
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Added to RFQ</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5 text-brand-blue" />
          <span>Add to RFQ</span>
        </>
      )}
    </button>
  );
}
