'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { bulkDeleteInquiriesSafely } from '../../app/actions/deleteInquiry';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';

const STATUS_CONFIG = {
  new: {
    label: 'New',
    dot: 'bg-rose-500',
    pill: 'bg-rose-50/70 text-rose-700 border-rose-200/70',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-amber-500',
    pill: 'bg-amber-50/70 text-amber-700 border-amber-200/70',
  },
  quoted: {
    label: 'Quoted',
    dot: 'bg-[#1A56DB]',
    pill: 'bg-blue-50/70 text-[#1A56DB] border-blue-200/70',
  },
  closed: {
    label: 'Closed',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50/70 text-emerald-700 border-emerald-200/70',
  },
} as const;

function getStatus(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.closed;
}

export function RecentTicketsTable({
  inquiries,
}: {
  inquiries: {
    id: string;
    tracking_uuid: string;
    status: string;
    created_at: string;
    contact_name: string;
    company_name?: string | null;
    divisions?: { display_name: string } | null;
    inquiry_payload?: { productName?: string; [key: string]: unknown } | null;
  }[];
}) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(inquiries.map((inq) => inq.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedTickets.includes(id)) {
      setSelectedTickets(selectedTickets.filter((ticketId) => ticketId !== id));
    } else {
      setSelectedTickets([...selectedTickets, id]);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedTickets.length === 0) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);
    const result = await bulkDeleteInquiriesSafely(selectedTickets);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete inquiries');
    } else {
      toast.success(`${selectedTickets.length} inquiries permanently deleted`);
      setSelectedTickets([]);
      router.refresh();
    }
    setIsDeleting(false);
  };

  const header = (
    <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-semibold text-[#0A1628] tracking-tight">Recent Inquiries</h2>
        <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
          {inquiries.length}
        </span>
      </div>
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1 text-xs font-medium text-[#1A56DB] hover:text-[#0A1628] transition-colors whitespace-nowrap"
      >
        <span>View all</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
        {header}
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-1">All caught up</h3>
          <p className="text-xs text-slate-400">
            No recent inquiries assigned to your division.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      {selectedTickets.length > 0 && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <span className="text-xs font-medium text-[#0A1628] tabular-nums">
            {selectedTickets.length} selected
          </span>
          <button
            type="button"
            onClick={handleBulkDeleteClick}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-medium transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Delete selected</span>
          </button>
        </div>
      )}

      {header}

      {/* Mobile stacked rows */}
      <div className="md:hidden divide-y divide-slate-100">
        {inquiries.map((inquiry) => {
          const s = getStatus(inquiry.status);
          const isSelected = selectedTickets.includes(inquiry.id);
          const shortRef = inquiry.tracking_uuid.substring(0, 8).toUpperCase();
          return (
            <div
              key={inquiry.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                  router.push(`/admin/tickets/${inquiry.id}`);
                }
              }}
              className={`p-4 space-y-3 transition-colors duration-150 cursor-pointer ${
                isSelected ? 'bg-[#1A56DB]/[0.03]' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-semibold text-[#0A1628] tabular-nums">
                    #{shortRef}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${s.pill}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="p-1.5 -mr-1.5">
                  <input
                    type="checkbox"
                    aria-label={`Select inquiry ${shortRef}`}
                    checked={isSelected}
                    onChange={() => handleSelectOne(inquiry.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1A56DB] focus:ring-[#1A56DB] cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0A1628] leading-snug">
                  {inquiry.contact_name}
                </p>
                {inquiry.company_name && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{inquiry.company_name}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <span
                  className="text-slate-600 truncate cursor-help"
                  title={inquiry.inquiry_payload?.productName || inquiry.divisions?.display_name || 'General Inquiry'}
                >
                  {inquiry.divisions?.display_name || 'Industrial'} ·{' '}
                  {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                  {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop hairline table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/70">
              <th className="py-3 pl-5 pr-2 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all recent inquiries"
                  checked={inquiries.length > 0 && selectedTickets.length === inquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#1A56DB] focus:ring-[#1A56DB] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Ref ID
              </th>
              <th className="py-3 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Client
              </th>
              <th className="py-3 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Division / Product
              </th>
              <th className="py-3 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Received
              </th>
              <th className="py-3 pl-3 pr-5 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">
                Open
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.map((inquiry) => {
              const s = getStatus(inquiry.status);
              const isSelected = selectedTickets.includes(inquiry.id);
              const shortRef = inquiry.tracking_uuid.substring(0, 8).toUpperCase();
              const productName = inquiry.inquiry_payload?.productName || 'General Inquiry';

              return (
                <tr
                  key={inquiry.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                      router.push(`/admin/tickets/${inquiry.id}`);
                    }
                  }}
                  className={`group transition-colors duration-150 cursor-pointer ${
                    isSelected ? 'bg-[#1A56DB]/[0.04]' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3.5 pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select inquiry ${shortRef}`}
                      checked={isSelected}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1A56DB] focus:ring-[#1A56DB] cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className="font-mono text-xs font-semibold text-[#0A1628] tabular-nums cursor-help"
                      title={inquiry.tracking_uuid}
                    >
                      #{shortRef}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-sm font-medium text-[#0A1628] leading-snug">
                      {inquiry.contact_name}
                    </p>
                    {inquiry.company_name && (
                      <p
                        className="text-xs text-slate-500 truncate max-w-[200px] cursor-help"
                        title={inquiry.company_name}
                      >
                        {inquiry.company_name}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <p
                      className="text-sm font-medium text-[#0A1628] line-clamp-1 max-w-[240px] cursor-help"
                      title={productName}
                    >
                      {productName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {inquiry.divisions?.display_name || 'Industrial'}
                    </p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border whitespace-nowrap ${s.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-3.5 pl-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/tickets/${inquiry.id}`}
                      aria-label={`Open inquiry ${shortRef}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 group-hover:text-[#1A56DB] group-hover:bg-slate-100 transition-colors duration-150"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Inquiries"
        message={`Permanently delete ${selectedTickets.length} selected inquiry record${selectedTickets.length > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
