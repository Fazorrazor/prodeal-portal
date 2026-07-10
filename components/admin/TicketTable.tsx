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
  return <span className="font-mono text-sm text-brand-deep-blue font-bold tracking-tight">{displayText}...</span>;
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
      <div className="border-t border-brand-border/40 py-14 flex flex-col items-start">
        <h3 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-2">All clear.</h3>
        <p className="text-sm text-brand-deep-blue/60 font-mono uppercase tracking-widest mt-2">
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
        <div className="mb-3 bg-brand-deep-blue/5 border border-brand-border/60 px-4 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest">
            {selectedTickets.length} Selected
          </span>
          <button
            onClick={handleBulkDeleteClick}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete Selected
          </button>
        </div>
      )}

      {/* ── MOBILE: stacked card list ── */}
      <div className="md:hidden flex flex-col divide-y divide-brand-border/30">
        {/* Mobile select-all bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/[0.025] border-b border-brand-border/30">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/50">Select All</span>
          </label>
          <span className="text-[10px] font-mono text-brand-deep-blue/30">
            {optimisticInquiries.length} ticket{optimisticInquiries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {optimisticInquiries.map((inquiry, i) => {
          const s = getStatus(inquiry.status);
          const isSelected = selectedTickets.includes(inquiry.id);
          return (
            <div
              key={inquiry.id}
              className={`relative flex flex-col gap-3 py-4 pl-4 pr-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${isSelected ? 'bg-brand-blue/[0.04]' : ''}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Left status bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.bar}`} />

              {/* Top row: UUID + status badge + checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ScrambledUUID uuid={inquiry.tracking_uuid} />
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
                <div onClick={e => e.stopPropagation()} className="shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(inquiry.id)}
                    className="w-5 h-5 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                  />
                </div>
              </div>

              {/* Client + company */}
              <div>
                <p className="text-base font-bold text-brand-deep-blue leading-tight">{inquiry.contact_name}</p>
                {inquiry.company_name && (
                  <p className="text-xs font-mono text-brand-deep-blue/50 mt-0.5">{inquiry.company_name}</p>
                )}
              </div>

              {/* Division + product */}
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/40 mb-0.5">
                  {inquiry.divisions?.display_name || 'Unknown Division'}
                </span>
                <span className="text-sm font-semibold text-brand-deep-blue/80 line-clamp-1">
                  {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                </span>
              </div>

              {/* Bottom row: agent + time + open link */}
              <div className="flex items-end justify-between gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/40">Agent</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 border border-brand-border/40 px-1.5 py-0.5 w-fit">
                    {inquiry.staff_members?.full_name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-brand-deep-blue/40 whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </span>
                  <Link
                    href={`/admin/tickets/${inquiry.id}`}
                    className="flex items-center justify-center w-10 h-10 border border-brand-border/40 text-brand-deep-blue/40 hover:border-brand-blue hover:text-brand-blue transition-colors shrink-0"
                    aria-label="Open ticket"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: full table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-deep-blue/20">
              <th className="py-3 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                />
              </th>
              <th className="py-3 pr-4 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Ticket ID</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Product / Service</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Client</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Agent</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Status</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Received</th>
              <th className="py-3 pl-4 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {optimisticInquiries.map((inquiry, i) => {
              const s = getStatus(inquiry.status);
              return (
                <tr
                  key={inquiry.id}
                  className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/[0.04] hover:bg-brand-blue/[0.07]' : 'hover:bg-black/[0.025]'}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-4 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(inquiry.id)}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-4 h-4 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                    />
                  </td>
                  <td className="py-4 pr-4"><ScrambledUUID uuid={inquiry.tracking_uuid} /></td>
                  <td className="px-4 py-4">
                    <span className="block text-[10px] uppercase font-bold text-brand-deep-blue/50 tracking-[0.15em] mb-0.5">
                      {inquiry.divisions?.display_name || 'Unknown'}
                    </span>
                    <span className="text-sm font-semibold text-brand-deep-blue line-clamp-1">
                      {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-brand-deep-blue">{inquiry.contact_name}</p>
                    {inquiry.company_name && <p className="text-xs text-brand-deep-blue/60 font-mono">{inquiry.company_name}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest border border-brand-border/40 px-1.5 py-0.5">
                      {inquiry.staff_members ? inquiry.staff_members.full_name : 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${s.badge}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-brand-deep-blue/60 font-mono whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <Link
                      href={`/admin/tickets/${inquiry.id}`}
                      className="inline-flex items-center justify-center p-1.5 text-brand-deep-blue/40 group-hover:text-brand-blue transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
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
        <div className="flex items-center justify-between border-t border-brand-border/60 py-4 mt-2 px-1">
          <p className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-4 py-2.5 border border-brand-border/60 text-xs font-bold uppercase tracking-widest text-brand-deep-blue hover:bg-brand-deep-blue hover:text-white transition-colors"
              >
                ← Prev
              </Link>
            ) : (
              <span className="px-4 py-2.5 border border-brand-border/20 text-xs font-bold uppercase tracking-widest text-brand-deep-blue/30 cursor-not-allowed">
                ← Prev
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-4 py-2.5 border border-brand-border/60 text-xs font-bold uppercase tracking-widest text-brand-deep-blue hover:bg-brand-deep-blue hover:text-white transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2.5 border border-brand-border/20 text-xs font-bold uppercase tracking-widest text-brand-deep-blue/30 cursor-not-allowed">
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


