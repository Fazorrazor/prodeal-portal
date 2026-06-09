'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrambleText } from '../../lib/hooks/useScrambleText';

export function MetricCard({ title, value, icon, trend }: { title: string, value: string | number, icon: ReactNode, trend?: string }) {
  const { displayText } = useScrambleText(value, 300, 1000);
  return (
    <div className="relative flex flex-col pl-5 py-1 group">
      {/* Animated Left Border */}
      <motion.div 
        className="absolute left-0 top-0 w-px bg-brand-border/60 group-hover:bg-brand-deep-blue transition-colors"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 0.6, ease: "circOut", delay: 0.2 }}
      />
      <div className="flex items-center gap-2 mb-1 opacity-70">
        <div className="text-brand-deep-blue">
          {icon}
        </div>
        <h3 className="text-brand-deep-blue text-[10px] font-bold uppercase tracking-widest">{title}</h3>
      </div>
      <div className="flex items-baseline gap-3 mt-1">
        <p className="text-3xl font-mono font-bold text-brand-deep-blue tracking-tighter leading-none">{displayText}</p>
        {trend && (
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{trend}</p>
        )}
      </div>
    </div>
  );
}
