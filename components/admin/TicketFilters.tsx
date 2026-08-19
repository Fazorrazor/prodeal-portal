'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const STATUSES = [
  { id: 'all', label: 'All Inquiries' },
  { id: 'new', label: 'New' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'closed', label: 'Closed' }
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
    params.delete('page'); // Reset to page 1 on filter switch
    router.push(`/admin/tickets?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
        {STATUSES.map((s) => {
          const isActive = currentStatus === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.id)}
              className={`h-9 px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? 'bg-white text-brand-deep-blue shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-brand-deep-blue hover:bg-white/50'
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
