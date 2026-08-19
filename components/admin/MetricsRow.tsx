'use client';

import { MetricCard } from './MetricCard';
import { Inbox, Clock, CheckCircle, BarChart3 } from 'lucide-react';

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
    <div className="relative mb-6">
      {/* 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-300" style={{ animationDelay: '50ms' }}>
          <MetricCard title="Total Inquiries" value={total} icon={<BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue" />} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-300" style={{ animationDelay: '100ms' }}>
          <MetricCard title="Pending Review" value={pending} icon={<Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />} trend="Needs action" />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-300" style={{ animationDelay: '150ms' }}>
          <MetricCard title="Resolved Tickets" value={resolved} icon={<CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-300" style={{ animationDelay: '200ms' }}>
          <MetricCard title="Avg Response" value={avgTime} icon={<Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />} />
        </div>
      </div>
    </div>
  );
}
