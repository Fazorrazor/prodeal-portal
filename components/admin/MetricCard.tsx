'use client';

import { ReactNode } from 'react';
import { useScrambleText } from '../../lib/hooks/useScrambleText';

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: ReactNode; 
  trend?: string; 
}) {
  const { displayText } = useScrambleText(value, 300, 1000);
  return (
    <div className="relative flex flex-col justify-between gap-2.5 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400">
        {icon}
        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">
          {title}
        </h3>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-deep-blue tracking-tight leading-none">
          {displayText}
        </p>
        {trend && (
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200/60 whitespace-nowrap">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
