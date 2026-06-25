'use client';

import React, { useState, useOptimistic } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { bulkDeleteInquiriesSafely } from '../../app/actions/deleteInquiry';
import { useRouter } from 'next/navigation';

function ScrambledUUID({ uuid }: { uuid: string }) {
  const { displayText } = useScrambleText(uuid.substring(0, 8).toUpperCase(), 400, 1000);
  return <span className="font-mono text-sm text-brand-deep-blue font-bold">{displayText}...</span>;
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

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedTickets.length} tickets? This cannot be undone.`)) return;

    // Instantly hide from UI before waiting for database
    setOptimisticInquiries(selectedTickets);
    setSelectedTickets([]);
    
    // We don't set isDeleting to true here because the UI already removed them!
    const result = await bulkDeleteInquiriesSafely(selectedTickets);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete tickets');
      // A router.refresh() here will restore the tickets if it failed
      router.refresh();
    } else {
      toast.success(`${selectedTickets.length} tickets permanently deleted`);
    }
  };

  if (!optimisticInquiries || optimisticInquiries.length === 0) {
    return (
      <div className="py-16 flex flex-col items-start border-t border-brand-border/60">
        <h3 className="text-2xl font-heading font-bold text-brand-deep-blue tracking-tighter mb-2">All clear.</h3>
        <p className="text-sm text-brand-deep-blue/80 font-body">
          There are currently no tickets matching your filter criteria, or all tickets have been resolved.
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
    <div className="mt-8 relative">
      {selectedTickets.length > 0 && (
        <div className="absolute -top-12 left-0 right-0 bg-brand-surface border border-brand-border/60 p-2 flex items-center justify-between z-10 animate-in fade-in slide-in-from-top-2">
          <span className="text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest pl-2">
            {selectedTickets.length} Selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/60">
              <th className="py-4 pl-4 pr-2 w-10">
                <input 
                  type="checkbox" 
                  checked={optimisticInquiries.length > 0 && selectedTickets.length === optimisticInquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                />
              </th>
              <th className="py-4 pr-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest">Ticket ID</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest">Product / Service</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest">Client</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest">Status</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest">Received</th>
              <th className="py-4 pl-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {optimisticInquiries.map((inquiry, i) => (
              <tr 
                key={inquiry.id} 
                className={`hover:bg-black/5 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/5' : ''}`}
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
                  <span className="block text-[10px] uppercase font-bold text-brand-deep-blue/80 tracking-widest mb-0.5">
                    {inquiry.divisions?.display_name || 'Unknown'}
                  </span>
                  <span className="text-sm font-semibold text-brand-deep-blue line-clamp-1">
                    {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-bold text-brand-deep-blue">{inquiry.contact_name}</p>
                  {inquiry.company_name && <p className="text-xs text-brand-deep-blue/80 font-mono">{inquiry.company_name}</p>}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center text-xs font-bold uppercase tracking-widest
                    ${inquiry.status === 'new' ? 'text-brand-red' : ''}
                    ${inquiry.status === 'in_progress' ? 'text-amber-600' : ''}
                    ${inquiry.status === 'quoted' ? 'text-brand-blue' : ''}
                    ${inquiry.status === 'closed' ? 'text-brand-deep-blue/80' : ''}
                  `}>
                    {inquiry.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-brand-deep-blue/80 font-mono">
                  {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                </td>
                <td className="py-4 pl-4 text-right">
                  <Link 
                    href={`/admin/tickets/${inquiry.id}`}
                    className="inline-flex items-center justify-center p-1.5 text-brand-deep-blue/80 group-hover:text-brand-blue transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-brand-border/60 py-4 mt-2">
          <p className="text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link 
                href={buildPageUrl(currentPage - 1)}
                className="px-4 py-2 border border-brand-border/60 text-xs font-bold uppercase tracking-widest text-brand-deep-blue hover:bg-brand-deep-blue hover:text-white transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span className="px-4 py-2 border border-brand-border/30 text-xs font-bold uppercase tracking-widest text-brand-deep-blue/80 cursor-not-allowed">
                Previous
              </span>
            )}
            
            {currentPage < totalPages ? (
              <Link 
                href={buildPageUrl(currentPage + 1)}
                className="px-4 py-2 border border-brand-border/60 text-xs font-bold uppercase tracking-widest text-brand-deep-blue hover:bg-brand-deep-blue hover:text-white transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="px-4 py-2 border border-brand-border/30 text-xs font-bold uppercase tracking-widest text-brand-deep-blue/80 cursor-not-allowed">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
