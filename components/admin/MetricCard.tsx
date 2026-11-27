'use client';

import type { ReactNode } from 'react';

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accent = 'neutral',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accent?: 'neutral' | 'amber';
}) {
  return (
    <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color] duration-150 hover:border-slate-300/80">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium text-slate-500 truncate">{title}</h3>
        <span className="shrink-0">{icon}</span>
      </div>

      <div className="space-y-1">
        <p className="text-2xl sm:text-[28px] font-semibold text-[#0A1628] tracking-tight tabular-nums leading-none">
          {value}
        </p>
        {subtitle && (
          <p
            className={`text-[11px] truncate ${
              accent === 'amber' ? 'text-amber-700 font-medium' : 'text-slate-400'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
