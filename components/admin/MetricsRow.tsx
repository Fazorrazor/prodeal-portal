'use client';

import { MetricCard } from './MetricCard';
import { Inbox, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export function MetricsRow({
  total,
  pending,
  resolved,
  avgTime
}: {
  total: number;
  pending: number;
  resolved: number;
  avgTime: string;
}) {
  return (
    <div className="relative mb-8">
      {/* Animated top border */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] bg-brand-deep-blue/10"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'circOut' }}
      />
      <div className="pt-6 grid grid-cols-2 xl:grid-cols-4 gap-[1px] bg-brand-border/30">
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500" style={{ animationDelay: '100ms' }}>
          <MetricCard title="Total Inquiries" value={total} icon={<BarChart3 className="w-4 h-4" />} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500" style={{ animationDelay: '200ms' }}>
          <MetricCard title="Pending Review" value={pending} icon={<Inbox className="w-4 h-4" />} trend="Needs action" />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500" style={{ animationDelay: '300ms' }}>
          <MetricCard title="Resolved Tickets" value={resolved} icon={<CheckCircle className="w-4 h-4" />} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500" style={{ animationDelay: '400ms' }}>
          <MetricCard title="Avg Response Time" value={avgTime} icon={<Clock className="w-4 h-4" />} />
        </div>
      </div>
      {/* Bottom border */}
      <motion.div
        className="h-[2px] bg-brand-deep-blue/10 mt-[1px]"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: 'circOut', delay: 0.2 }}
      />
    </div>
  );
}
