'use client';

import { MetricCard } from './MetricCard';
import { Layers, Clock, CheckCircle2, Timer } from 'lucide-react';

export function MetricsRow({
  total,
  pending,
  resolved,
  avgTime,
}: {
  total: number;
  pending: number;
  resolved: number;
  avgTime: string;
}) {
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        title="Total Inquiries"
        value={total.toLocaleString('en-US')}
        subtitle="All recorded requests"
        icon={<Layers className="w-4 h-4 text-slate-400" />}
      />
      <MetricCard
        title="Pending Review"
        value={pending.toLocaleString('en-US')}
        subtitle={pending > 0 ? 'Awaiting desk action' : 'Queue clear'}
        accent={pending > 0 ? 'amber' : 'neutral'}
        icon={<Clock className="w-4 h-4 text-amber-500" />}
      />
      <MetricCard
        title="Resolved"
        value={resolved.toLocaleString('en-US')}
        subtitle={`${resolutionRate}% completion rate`}
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      />
      <MetricCard
        title="Avg Response"
        value={avgTime}
        subtitle="Mean resolution time"
        icon={<Timer className="w-4 h-4 text-[#1A56DB]" />}
      />
    </div>
  );
}
