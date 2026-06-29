'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrambleText } from '../../lib/hooks/useScrambleText';

export function MetricCard({ title, value, icon, trend, accentColor = 'brand-blue' }: { title: string, value: string | number, icon: ReactNode, trend?: string, accentColor?: string }) {
  const { displayText } = useScrambleText(value, 300, 1000);
  return (
    <div className="relative flex flex-col gap-2 p-4 sm:p-5 bg-black/[0.025] border-l-[3px] border-brand-deep-blue group">
      {/* Animated top rule */}
      <motion.div
        className="absolute top-0 left-0 h-px bg-brand-deep-blue/20"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.7, ease: 'circOut', delay: 0.15 }}
      />
      <div className="flex items-center gap-2 text-brand-deep-blue/60">
        {icon}
        <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] truncate">{title}</h3>
      </div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <p className="text-2xl sm:text-4xl font-mono font-bold text-brand-deep-blue tracking-tighter leading-none">
          {displayText}
        </p>
        {trend && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-red border border-brand-red/30 px-1.5 py-0.5">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
