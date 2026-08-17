'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrambleText } from '../../lib/hooks/useScrambleText';

export function MetricCard({ title, value, icon, trend, accentColor = 'brand-blue' }: { title: string, value: string | number, icon: ReactNode, trend?: string, accentColor?: string }) {
  const { displayText } = useScrambleText(value, 300, 1000);
  return (
    <div className="relative flex flex-col gap-3 p-6 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-wider truncate">{title}</h3>
      </div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <p className="text-3xl sm:text-4xl font-display font-bold text-brand-deep-blue tracking-tight leading-none">
          {displayText}
        </p>
        {trend && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            trend.toLowerCase().includes('healthy') 
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
              : 'text-amber-600 bg-amber-50 border-amber-100'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
