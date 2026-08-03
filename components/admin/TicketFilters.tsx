'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function TicketFilters({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'all') {
      params.delete('status');
    } else {
      params.set('status', e.target.value);
    }
    router.push(`/admin/tickets?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
      <label htmlFor="status-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
        Filter:
      </label>
      <select 
        id="status-filter"
        value={currentStatus}
        onChange={handleStatusChange}
        className="py-0.5 bg-transparent border-0 text-sm font-semibold text-brand-deep-blue outline-none cursor-pointer focus:ring-0"
      >
        <option value="all">All Tickets</option>
        <option value="new">New</option>
        <option value="in_progress">In Progress</option>
        <option value="quoted">Quoted</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
}
