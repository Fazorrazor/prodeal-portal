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
    <div className="flex items-baseline gap-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">
        Filter By Status:
      </label>
      <select 
        value={currentStatus}
        onChange={handleStatusChange}
        className="py-1 bg-transparent border-0 border-b-2 border-brand-deep-blue text-sm font-bold text-brand-deep-blue uppercase tracking-widest outline-none focus:border-brand-blue cursor-pointer"
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
