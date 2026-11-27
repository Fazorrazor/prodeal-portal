'use client';

import React, { useState, useOptimistic, startTransition } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Loader2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { bulkDeleteInquiriesSafely } from '../../app/actions/deleteInquiry';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';
import { exportInquiriesToCsv } from '../../lib/utils/exportCsv';

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
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  currentStatus?: string;
  currentSearch?: string;
}

export function TicketTable({
  inquiries,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  currentStatus = 'all',
  currentSearch = '',
}: TicketTableProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();

  const [optimisticInquiries, setOptimisticInquiries] = useOptimistic(
    inquiries,
    (state, deletedIds: string[]) => state.filter((inquiry) => !deletedIds.includes(inquiry.id))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(optimisticInquiries.map((inq) => inq.id));
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
    const ticketsToDelete = [...selectedTickets];
    startTransition(() => {
      setOptimisticInquiries(ticketsToDelete);
    });
    setSelectedTickets([]);

    const result = await bulkDeleteInquiriesSafely(ticketsToDelete);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete inquiries');
      router.refresh();
    } else {
      toast.success(`${ticketsToDelete.length} inquiries permanently deleted`);
    }
  };

  const handleExportCsv = () => {
    const listToExport =
      selectedTickets.length > 0
        ? optimisticInquiries.filter((inq) => selectedTickets.includes(inq.id))
        : optimisticInquiries;

    const exportRows = listToExport.map((inq) => ({
      id: inq.id,
      tracking_uuid: inq.tracking_uuid,
      contact_name: inq.contact_name,
      company_name: inq.company_name,
      status: inq.status,
      division_name: inq.divisions?.display_name || 'General',
      created_at: inq.created_at,
      item_summary: (inq.inquiry_payload as any)?.productName || 'Quote Request',
    }));

    const ok = exportInquiriesToCsv(
      exportRows,
      `prodeal-inquiries-${new Date().toISOString().split('T')[0]}.csv`
    );
    if (ok) {
      toast.success(`Exported ${exportRows.length} inquiries to CSV`);
    } else {
      toast.error('No inquiries available to export');
    }
  };

  if (!optimisticInquiries || optimisticInquiries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] py-20 px-4 flex flex-col items-center justify-center text-center">
        <h3 className="text-sm font-semibold text-[#0A1628] mb-1">No inquiries found</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          No records match the current status or search filter.
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

  const displayCount = totalCount ?? optimisticInquiries.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 tabular-nums">
            Showing <strong className="font-semibold text-[#0A1628]">{optimisticInquiries.length}</strong> of{' '}
            <strong className="font-semibold text-[#0A1628]">{displayCount}</strong> inquiries
          </span>
          {selectedTickets.length > 0 && (
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
              <span>Delete ({selectedTickets.length})</span>
            </button>
          )}
        </div>

        <button
          onClick={handleExportCsv}
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-white border border-slate-200/90 text-xs font-medium text-[#0A1628] hover:bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[background-color,transform] duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {selectedTickets.length > 0 ? `Export (${selectedTickets.length}) CSV` : 'Export CSV'}
          </span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border border-slate-200/80">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={
                optimisticInquiries.length > 0 &&
                selectedTickets.length === optimisticInquiries.length
              }
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-[#1A56DB] border-slate-300 focus:ring-[#1A56DB] cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-600">Select all</span>
          </label>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {optimisticInquiries.length}
          </span>
        </div>

        {optimisticInquiries.map((inquiry) => {
          const s = getStatus(inquiry.status);
          const isSelected = selectedTickets.includes(inquiry.id);
          const shortRef = inquiry.tracking_uuid.substring(0, 8).toUpperCase();
          const productName = inquiry.inquiry_payload?.productName || 'General Inquiry';

          return (
            <div
              key={inquiry.id}
              onClick={() => router.push(`/admin/tickets/${inquiry.id}`)}
              className={`p-4 bg-white rounded-xl border shadow-[0_1px_2px_rgba(15,23,42,0.04)] cursor-pointer transition-[border-color,background-color] duration-150 space-y-3 ${
                isSelected
                  ? 'border-[#1A56DB]/50 bg-[#1A56DB]/[0.02]'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-semibold text-[#0A1628] tabular-nums">
                    #{shortRef}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${s.pill}`}
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
                    className="w-4 h-4 rounded text-[#1A56DB] border-slate-300 focus:ring-[#1A56DB] cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0A1628] leading-snug">
                  {inquiry.contact_name}
                </p>
                {inquiry.company_name && (
                  <p className="text-xs text-slate-500 mt-0.5">{inquiry.company_name}</p>
                )}
              </div>

              <div>
                <span className="block text-[11px] text-slate-400">
                  {inquiry.divisions?.display_name || 'Industrial'}
                </span>
                <span
                  className="text-xs font-medium text-[#0A1628] line-clamp-1 cursor-help"
                  title={productName}
                >
                  {productName}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                <span className="text-slate-400 tabular-nums">
                  {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                </span>
                <span className="inline-flex items-center gap-1 text-[#1A56DB] font-medium">
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Hairline Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <th className="py-3 pl-5 pr-2 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all inquiries"
                  checked={
                    optimisticInquiries.length > 0 &&
                    selectedTickets.length === optimisticInquiries.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-[#1A56DB] border-slate-300 focus:ring-[#1A56DB] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Ref ID</th>
              <th className="py-3 px-3">Division / Product</th>
              <th className="py-3 px-3">Client</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Received</th>
              <th className="py-3 pl-3 pr-5 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {optimisticInquiries.map((inquiry) => {
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
                      className="w-4 h-4 rounded text-[#1A56DB] border-slate-300 focus:ring-[#1A56DB] cursor-pointer"
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
                    <p
                      className="text-sm font-medium text-[#0A1628] line-clamp-1 max-w-[260px] cursor-help"
                      title={productName}
                    >
                      {productName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {inquiry.divisions?.display_name || 'Industrial'}
                    </p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-medium text-[#0A1628]">{inquiry.contact_name}</p>
                    {inquiry.company_name && (
                      <p
                        className="text-xs text-slate-500 truncate max-w-[180px] cursor-help"
                        title={inquiry.company_name}
                      >
                        {inquiry.company_name}
                      </p>
                    )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 tabular-nums">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="h-8 px-3 inline-flex items-center rounded-lg border border-slate-200/90 text-xs font-medium text-[#0A1628] bg-white hover:bg-slate-50 transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span className="h-8 px-3 inline-flex items-center rounded-lg border border-slate-100 text-xs font-medium text-slate-300 cursor-not-allowed">
                Previous
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="h-8 px-3 inline-flex items-center rounded-lg border border-slate-200/90 text-xs font-medium text-[#0A1628] bg-white hover:bg-slate-50 transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="h-8 px-3 inline-flex items-center rounded-lg border border-slate-100 text-xs font-medium text-slate-300 cursor-not-allowed">
                Next
              </span>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Inquiries"
        message={`Permanently delete ${selectedTickets.length} inquiry record${selectedTickets.length > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
