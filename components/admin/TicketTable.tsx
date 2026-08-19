'use client';

import React, { useState, useOptimistic, startTransition } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Loader2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { bulkDeleteInquiriesSafely } from '../../app/actions/deleteInquiry';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';
import { exportInquiriesToCsv } from '../../lib/utils/exportCsv';

function ScrambledUUID({ uuid }: { uuid: string }) {
  const { displayText } = useScrambleText(uuid.substring(0, 8).toUpperCase(), 400, 1000);
  return <span className="font-mono text-xs sm:text-sm text-brand-deep-blue font-bold tracking-tight">{displayText}...</span>;
}

const STATUS_CONFIG = {
  new:         { label: 'New',         badge: 'border-red-200/80 bg-red-50/80 text-brand-red' },
  in_progress: { label: 'In Progress', badge: 'border-amber-200/80 bg-amber-50/80 text-amber-700' },
  quoted:      { label: 'Quoted',      badge: 'border-brand-blue/20 bg-brand-blue/10 text-brand-blue' },
  closed:      { label: 'Closed',      badge: 'border-slate-200 bg-slate-100 text-slate-500' },
} as const;

function getStatus(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.closed;
}

interface TicketTableProps {
  inquiries: {
    id: string;
    tracking_uuid: string;
    contact_name: string;
    company_name?: string | null;
    status: string;
    created_at: string;
    divisions?: { display_name: string } | null;
    inquiry_payload?: { productName?: string; [key: string]: unknown } | null;
    staff_members?: { full_name: string } | null;
  }[];
  currentPage?: number;
  totalPages?: number;
  currentStatus?: string;
  currentSearch?: string;
}

export function TicketTable({ 
  inquiries, 
  currentPage = 1, 
  totalPages = 1, 
  currentStatus = 'all', 
  currentSearch = '' 
}: TicketTableProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Optimistic UI for instant visual feedback
  const [optimisticInquiries, setOptimisticInquiries] = useOptimistic(
    inquiries,
    (state, deletedIds: string[]) => state.filter((inquiry) => !deletedIds.includes(inquiry.id))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(optimisticInquiries.map(inq => inq.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedTickets.includes(id)) {
      setSelectedTickets(selectedTickets.filter(ticketId => ticketId !== id));
    } else {
      setSelectedTickets([...selectedTickets, id]);
    }
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleBulkDeleteClick = () => {
    if (selectedTickets.length === 0) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    
    const ticketsToDelete = [...selectedTickets];
    startTransition(() => {
      setOptimisticInquiries(ticketsToDelete);
    });
    setSelectedTickets([]);
    
    const result = await bulkDeleteInquiriesSafely(ticketsToDelete);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete tickets');
      router.refresh();
    } else {
      toast.success(`${ticketsToDelete.length} tickets permanently deleted`);
    }
  };

  const handleExportCsv = () => {
    const listToExport = selectedTickets.length > 0 
      ? optimisticInquiries.filter(inq => selectedTickets.includes(inq.id))
      : optimisticInquiries;

    const exportRows = listToExport.map(inq => ({
      id: inq.id,
      tracking_uuid: inq.tracking_uuid,
      contact_name: inq.contact_name,
      company_name: inq.company_name,
      status: inq.status,
      division_name: inq.divisions?.display_name || 'General',
      created_at: inq.created_at,
      item_summary: (inq.inquiry_payload as any)?.productName || 'Quote Request'
    }));

    const ok = exportInquiriesToCsv(exportRows, `prodeal-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    if (ok) {
      toast.success(`Exported ${exportRows.length} inquiries to CSV`);
    } else {
      toast.error('No inquiries available to export');
    }
  };

  if (!optimisticInquiries || optimisticInquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] py-16 flex flex-col items-center justify-center text-center mt-4">
        <h3 className="text-xl font-display font-semibold text-brand-deep-blue mb-1">No Inquiries Found</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          No inquiries match your current filter criteria.
        </p>
      </div>
    );
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (currentStatus !== 'all') params.set('status', currentStatus);
    if (currentSearch) params.set('search', currentSearch);
    params.set('page', page.toString());
    return `/admin/tickets?${params.toString()}`;
  };

  return (
    <div className="mt-4 relative space-y-4">
      {/* Table Action Bar with Export & Bulk Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {selectedTickets.length > 0 && (
            <button
              onClick={handleBulkDeleteClick}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete ({selectedTickets.length})
            </button>
          )}
        </div>

        <button
          onClick={handleExportCsv}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-brand-deep-blue hover:bg-slate-50 transition-all shadow-2xs active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          {selectedTickets.length > 0 ? `Export (${selectedTickets.length}) CSV` : 'Export CSV'}
        </button>
      </div>

      {/* ── MOBILE: Luxury Stacked Cards ── */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Mobile select-all bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-600">Select All</span>
          </label>
          <span className="text-xs font-mono text-slate-400">
            {optimisticInquiries.length} item{optimisticInquiries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {optimisticInquiries.map((inquiry, i) => {
          const s = getStatus(inquiry.status);
          const isSelected = selectedTickets.includes(inquiry.id);
          return (
            <div
              key={inquiry.id}
              onClick={() => router.push(`/admin/tickets/${inquiry.id}`)}
              className={`relative flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-md transition-all active:scale-[0.99] ${
                isSelected ? 'ring-2 ring-brand-blue/30 bg-brand-blue/[0.02]' : ''
              }`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Top row: UUID + status badge + checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ScrambledUUID uuid={inquiry.tracking_uuid} />
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
                <div onClick={e => e.stopPropagation()} className="shrink-0 pt-0.5 p-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(inquiry.id)}
                    className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                  />
                </div>
              </div>

              {/* Client + company */}
              <div>
                <p className="text-base font-semibold text-brand-deep-blue leading-tight">{inquiry.contact_name}</p>
                {inquiry.company_name && (
                  <p className="text-xs text-slate-400 mt-0.5">{inquiry.company_name}</p>
                )}
              </div>

              {/* Division + product */}
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                  {inquiry.divisions?.display_name || 'Industrial'}
                </span>
                <span 
                  className="text-xs font-semibold text-brand-deep-blue line-clamp-1 cursor-help"
                  title={inquiry.inquiry_payload?.productName || 'General Inquiry'}
                >
                  {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                </span>
              </div>

              {/* Bottom row: time + chevron */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                </span>
                <div className="flex items-center gap-1 text-brand-blue font-semibold text-xs">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: Borderless Luxury Table ── */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-2 w-12">
                <input
                  type="checkbox"
                  checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                />
              </th>
              <th className="py-3.5 pr-4">Ticket ID</th>
              <th className="px-4 py-3.5">Product / RFQ</th>
              <th className="px-4 py-3.5">Client</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Received</th>
              <th className="py-3.5 pr-6 pl-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {optimisticInquiries.map((inquiry, i) => {
              const s = getStatus(inquiry.status);
              const isSelected = selectedTickets.includes(inquiry.id);
              return (
                <tr
                  key={inquiry.id}
                  className={`group transition-colors hover:bg-slate-50/50 ${
                    isSelected ? 'bg-brand-blue/[0.03]' : ''
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-4 pl-6 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
                    />
                  </td>
                  <td className="py-4 pr-4"><ScrambledUUID uuid={inquiry.tracking_uuid} /></td>
                  <td className="px-4 py-4">
                    <span className="block text-xs font-medium text-slate-400 mb-0.5">
                      {inquiry.divisions?.display_name || 'Industrial'}
                    </span>
                    <span 
                      className="text-sm font-semibold text-brand-deep-blue line-clamp-1 cursor-help"
                      title={inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    >
                      {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-brand-deep-blue">{inquiry.contact_name}</p>
                    {inquiry.company_name && (
                      <p 
                        className="text-xs text-slate-400 truncate max-w-[180px] cursor-help"
                        title={inquiry.company_name}
                      >
                        {inquiry.company_name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${s.badge}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right">
                    <Link
                      href={`/admin/tickets/${inquiry.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-brand-blue hover:text-white text-slate-400 transition-colors shadow-2xs"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 px-1">
          <p className="text-xs text-slate-400 font-mono">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-deep-blue bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                ← Prev
              </Link>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-300 bg-transparent cursor-not-allowed">
                ← Prev
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-brand-deep-blue bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Next →
              </Link>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-300 bg-transparent cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Inquiries"
        message={`Are you sure you want to permanently delete ${selectedTickets.length} inquiry tickets?`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
