'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { bulkDeleteInquiriesSafely } from '../../app/actions/deleteInquiry';
import { useRouter } from 'next/navigation';
import { AnimatedBorder } from './AnimatedBorder';
import { ConfirmModal } from './ConfirmModal';

function ScrambledUUID({ uuid }: { uuid: string }) {
  const { displayText } = useScrambleText(uuid.substring(0, 8).toUpperCase(), 400, 1000);
  return <span className="font-mono text-sm text-brand-deep-blue font-bold tracking-tight">{displayText}...</span>;
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-brand-red',       bar: 'bg-brand-red',    badge: 'border-brand-red/30 bg-brand-red/5 text-brand-red' },
  in_progress: { label: 'In Progress', color: 'text-amber-600',       bar: 'bg-amber-400',    badge: 'border-amber-400/30 bg-amber-50 text-amber-600' },
  quoted:      { label: 'Quoted',      color: 'text-brand-blue',      bar: 'bg-brand-blue',   badge: 'border-brand-blue/30 bg-brand-blue/5 text-brand-blue' },
  closed:      { label: 'Closed',      color: 'text-brand-deep-blue/40', bar: 'bg-brand-border', badge: 'border-brand-border/50 text-brand-deep-blue/40' },
} as const;

function getStatus(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.closed;
}

export function RecentTicketsTable({ inquiries }: { inquiries: { id: string, tracking_uuid: string, status: string, created_at: string, contact_name: string, company_name?: string | null, divisions?: { display_name: string } | null, inquiry_payload?: { productName?: string; [key: string]: unknown } | null }[] }) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTickets(inquiries.map(inq => inq.id));
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
    setIsDeleting(true);
    const result = await bulkDeleteInquiriesSafely(selectedTickets);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete tickets');
    } else {
      toast.success(`${selectedTickets.length} tickets permanently deleted`);
      setSelectedTickets([]);
      router.refresh();
    }
    setIsDeleting(false);
  };

  const header = (
    <div className="pb-4 relative flex items-center justify-between bg-brand-surface z-20">
      <AnimatedBorder direction="bottom" delay={0.3} className="!bg-brand-deep-blue" />
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-brand-red shrink-0" />
        <h2 className="font-heading font-bold text-xl text-brand-deep-blue leading-none tracking-tighter">Recent Tickets</h2>
      </div>
      <Link href="/admin/tickets" className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:text-brand-deep-blue transition-colors">
        View all
      </Link>
    </div>
  );

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="mt-8">
        {header}
        <div className="border-t border-brand-border/40 py-14 flex flex-col items-start">
          <h3 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-2">All clear.</h3>
          <p className="text-sm text-brand-deep-blue/60 font-mono uppercase tracking-widest mt-2">
            No recent tickets assigned to your division.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative">
      <div className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-md pt-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        {selectedTickets.length > 0 && (
          <div className="mb-3 bg-brand-deep-blue/5 border border-brand-border/60 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
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
        {header}
      </div>

      {/* Mobile card list */}
      <div className="mt-2 md:hidden flex flex-col divide-y divide-brand-border/30">
        {inquiries.map((inquiry, i) => {
          const s = getStatus(inquiry.status);
          return (
            <div
              key={inquiry.id}
              className={`relative flex flex-col gap-3 py-4 pl-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both cursor-pointer ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/[0.04]' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                  router.push(`/admin/tickets/${inquiry.id}`);
                }
              }}
            >
              {/* Left status accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.bar}`} />

              <div className="flex items-start justify-between gap-2">
                <ScrambledUUID uuid={inquiry.tracking_uuid} />
                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${s.badge} shrink-0`}>
                  {s.label}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-brand-deep-blue leading-tight">{inquiry.contact_name}</p>
                {inquiry.company_name && <p className="text-xs text-brand-deep-blue/60 font-mono leading-tight mt-0.5">{inquiry.company_name}</p>}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-brand-deep-blue/40 tracking-[0.2em] mb-0.5">
                    {inquiry.divisions?.display_name || 'Unknown'}
                  </span>
                  <span className="text-xs font-semibold text-brand-deep-blue/80 line-clamp-1">
                    {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-brand-deep-blue/40 font-mono whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </span>
                  <div onClick={e => e.stopPropagation()} className="p-1">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(inquiry.id)}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-5 h-5 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-deep-blue/20">
              <th className="py-3 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={inquiries.length > 0 && selectedTickets.length === inquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                />
              </th>
              <th className="py-3 pr-4 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Ticket ID</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Product / Service</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Client</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Status</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Received</th>
              <th className="py-3 pl-4 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {inquiries.map((inquiry, i) => {
              const s = getStatus(inquiry.status);
              return (
                <tr
                  key={inquiry.id}
                  className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/[0.04] hover:bg-brand-blue/[0.07]' : 'hover:bg-black/[0.025]'}`}
                  style={{ animationDelay: `${i * 50}ms` }}
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
