'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const STATUSES = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'closed', label: 'Closed' },
] as const;

export function TicketFilters({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (statusId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (statusId === 'all') {
      params.delete('status');
    } else {
      params.set('status', statusId);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `/admin/tickets?${qs}` : '/admin/tickets');
  };

  return (
    <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
      <div
        role="tablist"
        aria-label="Filter inquiries by status"
        className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/70"
      >
        {STATUSES.map((s) => {
          const isActive = currentStatus === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(s.id)}
              className={`h-8 px-3 text-xs rounded-md whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0A1628] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                  : 'text-slate-500 font-medium hover:text-[#0A1628]'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
