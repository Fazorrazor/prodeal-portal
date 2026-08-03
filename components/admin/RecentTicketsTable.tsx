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
    <div className="p-6 relative flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-3">
        <h2 className="font-display font-semibold text-lg text-brand-deep-blue leading-none">Recent Tickets</h2>
      </div>
      <Link href="/admin/tickets" className="text-sm font-medium text-brand-blue hover:text-brand-deep-blue transition-colors">
        View all
      </Link>
    </div>
  );

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        {header}
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-slate-400">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-brand-deep-blue mb-1">All caught up</h3>
          <p className="text-sm text-slate-500">
            No recent tickets assigned to your division.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md">
        {selectedTickets.length > 0 && (
          <div className="bg-brand-blue/5 border-b border-brand-blue/10 p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-semibold text-brand-deep-blue">
              {selectedTickets.length} Selected
            </span>
            <button
              onClick={handleBulkDeleteClick}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red-50 text-brand-red px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-3 pl-6 pr-3 w-12">
                <input
                  type="checkbox"
                  checked={inquiries.length > 0 && selectedTickets.length === inquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                />
              </th>
              <th className="py-3 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product / Service</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Received</th>
              <th className="py-3 pl-4 pr-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {inquiries.map((inquiry, i) => {
              const s = getStatus(inquiry.status);
              return (
                <tr
                  key={inquiry.id}
                  className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both border-b border-slate-50 last:border-0 ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/[0.04]' : 'hover:bg-slate-50/50'}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="py-4 pl-6 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(inquiry.id)}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                    />
                  </td>
                  <td className="py-4 pr-4"><ScrambledUUID uuid={inquiry.tracking_uuid} /></td>
                  <td className="px-4 py-4">
                    <span className="block text-xs text-slate-500 font-medium mb-0.5">
                      {inquiry.divisions?.display_name || 'Unknown'}
                    </span>
                    <span className="text-sm font-semibold text-brand-deep-blue line-clamp-1">
                      {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-brand-deep-blue">{inquiry.contact_name}</p>
                    {inquiry.company_name && <p className="text-sm text-slate-500">{inquiry.company_name}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md border ${s.badge}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-4 pl-4 pr-6 text-right">
                    <Link
                      href={`/admin/tickets/${inquiry.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-colors"
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
