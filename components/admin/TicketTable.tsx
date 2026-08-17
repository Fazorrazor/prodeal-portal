'use client';

import React, { useState, useOptimistic, startTransition } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { bulkDeleteInquiriesSafely } from '../../app/actions/deleteInquiry';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ConfirmModal';

function ScrambledUUID({ uuid }: { uuid: string }) {
  const { displayText } = useScrambleText(uuid.substring(0, 8).toUpperCase(), 400, 1000);
  return <span className="font-mono text-sm text-brand-deep-blue font-medium">{displayText}...</span>;
}

const STATUS_CONFIG = {
  new:         { label: 'New',         bar: 'bg-brand-red',    badge: 'border-brand-red/30 bg-brand-red/5 text-brand-red' },
  in_progress: { label: 'In Progress', bar: 'bg-amber-400',    badge: 'border-amber-400/30 bg-amber-50 text-amber-600' },
  quoted:      { label: 'Quoted',      bar: 'bg-brand-blue',   badge: 'border-brand-blue/30 bg-brand-blue/5 text-brand-blue' },
  closed:      { label: 'Closed',      bar: 'bg-brand-border', badge: 'border-brand-border/50 text-brand-deep-blue/40' },
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
    
    // Instantly hide from UI before waiting for database
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

  if (!optimisticInquiries || optimisticInquiries.length === 0) {
    return (
      <div className="border border-brand-border/20 rounded-xl bg-white shadow-sm py-16 flex flex-col items-center justify-center text-center mt-4">
        <h3 className="text-2xl font-display font-medium text-brand-deep-blue mb-2">All clear.</h3>
        <p className="text-sm text-brand-deep-blue/60">
          No tickets match your filter criteria, or all tickets have been resolved.
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
    <div className="mt-4 relative">

      {/* Bulk-delete action bar — appears above both mobile and desktop */}
      {selectedTickets.length > 0 && (
        <div className="mb-4 bg-brand-surface border border-brand-border/20 rounded-lg shadow-sm px-4 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-brand-deep-blue">
            {selectedTickets.length} Selected
          </span>
          <button
            onClick={handleBulkDeleteClick}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Selected
          </button>
        </div>
      )}

      {/* ── MOBILE: stacked card list ── */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Mobile select-all bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-brand-border/20 shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-brand-blue border-brand-border/40 focus:ring-brand-blue focus:ring-offset-1 cursor-pointer transition-all"
            />
            <span className="text-xs font-medium text-brand-deep-blue/70">Select All</span>
          </label>
          <span className="text-xs font-medium text-brand-deep-blue/40">
            {optimisticInquiries.length} ticket{optimisticInquiries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {optimisticInquiries.map((inquiry, i) => {
          const s = getStatus(inquiry.status);
          const isSelected = selectedTickets.includes(inquiry.id);
          return (
            <div
              key={inquiry.id}
              className={`relative flex flex-col gap-3 p-4 bg-white rounded-xl border border-brand-border/20 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${isSelected ? 'ring-1 ring-brand-blue bg-brand-blue/5 border-transparent' : ''}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Left status bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${s.bar}`} />

              {/* Top row: UUID + status badge + checkbox */}
              <div className="flex items-start justify-between gap-2 pl-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ScrambledUUID uuid={inquiry.tracking_uuid} />
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
                <div onClick={e => e.stopPropagation()} className="shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(inquiry.id)}
                    className="w-4 h-4 rounded text-brand-blue border-brand-border/40 focus:ring-brand-blue focus:ring-offset-1 cursor-pointer transition-all"
                  />
                </div>
              </div>

              {/* Client + company */}
              <div className="pl-2">
                <p className="text-base font-medium text-brand-deep-blue leading-tight">{inquiry.contact_name}</p>
                {inquiry.company_name && (
                  <p className="text-xs text-brand-deep-blue/60 mt-0.5">{inquiry.company_name}</p>
                )}
              </div>

              {/* Division + product */}
              <div className="pl-2">
                <span className="block text-xs font-medium text-brand-deep-blue/50 mb-0.5">
                  {inquiry.divisions?.display_name || 'Unknown Division'}
                </span>
                <span className="text-sm font-medium text-brand-deep-blue/80 line-clamp-1">
                  {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                </span>
              </div>

              {/* Bottom row: agent + time + open link */}
              <div className="flex items-end justify-between gap-2 pt-2 border-t border-brand-border/10 mt-2 pl-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium text-brand-deep-blue/50">Agent</span>
                  <span className="text-xs font-medium text-brand-deep-blue/70">
                    {inquiry.staff_members?.full_name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-deep-blue/40 whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </span>
                  <Link
                    href={`/admin/tickets/${inquiry.id}`}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-surface text-brand-deep-blue/40 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors shrink-0"
                    aria-label="Open ticket"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: full table ── */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-brand-border/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/20 bg-brand-surface/50">
              <th className="py-4 pl-6 pr-2 w-12">
                <input
                  type="checkbox"
                  checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-brand-blue border-brand-border/40 focus:ring-brand-blue focus:ring-offset-1 cursor-pointer transition-all"
                />
              </th>
              <th className="py-4 pr-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide">Ticket ID</th>
              <th className="px-4 py-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide">Product / Service</th>
              <th className="px-4 py-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide">Client</th>
              <th className="px-4 py-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide">Agent</th>
              <th className="px-4 py-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide">Status</th>
              <th className="px-4 py-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide">Received</th>
              <th className="py-4 pr-6 pl-4 text-xs font-semibold text-brand-deep-blue/60 tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/10">
            {optimisticInquiries.map((inquiry, i) => {
              const s = getStatus(inquiry.status);
              return (
                <tr
                  key={inquiry.id}
                  className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/5 hover:bg-brand-blue/10' : 'hover:bg-brand-surface'}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-4 pl-6 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(inquiry.id)}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-4 h-4 rounded text-brand-blue border-brand-border/40 focus:ring-brand-blue focus:ring-offset-1 cursor-pointer transition-all"
                    />
                  </td>
                  <td className="py-4 pr-4"><ScrambledUUID uuid={inquiry.tracking_uuid} /></td>
                  <td className="px-4 py-4">
                    <span className="block text-xs font-medium text-brand-deep-blue/50 mb-0.5">
                      {inquiry.divisions?.display_name || 'Unknown'}
                    </span>
                    <span className="text-sm font-medium text-brand-deep-blue line-clamp-1">
                      {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-brand-deep-blue">{inquiry.contact_name}</p>
                    {inquiry.company_name && <p className="text-xs text-brand-deep-blue/60">{inquiry.company_name}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-brand-deep-blue/70">
                      {inquiry.staff_members ? inquiry.staff_members.full_name : 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.badge}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-brand-deep-blue/60 whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right">
                    <Link
                      href={`/admin/tickets/${inquiry.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-full bg-brand-surface text-brand-deep-blue/40 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors"
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

      {/* Pagination — shared */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-brand-border/20 py-4 mt-4 px-1">
          <p className="text-xs font-medium text-brand-deep-blue/60">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-4 py-2 rounded-md border border-brand-border/20 text-sm font-medium text-brand-deep-blue bg-white shadow-sm hover:bg-brand-surface transition-colors"
              >
                ← Prev
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-md border border-brand-border/10 text-sm font-medium text-brand-deep-blue/30 bg-transparent cursor-not-allowed">
                ← Prev
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-4 py-2 rounded-md border border-brand-border/20 text-sm font-medium text-brand-deep-blue bg-white shadow-sm hover:bg-brand-surface transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-md border border-brand-border/10 text-sm font-medium text-brand-deep-blue/30 bg-transparent cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Tickets"
        message={`Are you sure you want to permanently delete ${selectedTickets.length} tickets? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}


