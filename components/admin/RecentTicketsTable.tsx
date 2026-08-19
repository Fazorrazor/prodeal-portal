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
  new:         { label: 'New',         badge: 'border-red-200/80 bg-red-50/80 text-brand-red' },
  in_progress: { label: 'In Progress', badge: 'border-amber-200/80 bg-amber-50/80 text-amber-700' },
  quoted:      { label: 'Quoted',      badge: 'border-brand-blue/20 bg-brand-blue/10 text-brand-blue' },
  closed:      { label: 'Closed',      badge: 'border-slate-200 bg-slate-100 text-slate-500' },
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
        <h2 className="font-display font-semibold text-lg text-brand-deep-blue leading-none">Recent Inquiries</h2>
      </div>
      <Link href="/admin/tickets" className="text-xs font-semibold text-brand-blue hover:text-brand-deep-blue transition-colors">
        View all inquiries →
      </Link>
    </div>
  );

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        {header}
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-brand-deep-blue mb-1">All caught up</h3>
          <p className="text-xs text-slate-400">
            No recent inquiries assigned to your division.
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
              className="flex items-center gap-2 bg-red-50 text-brand-red px-4 py-2 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Selected
            </button>
          </div>
        )}
        {header}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100">
        {inquiries.map((inquiry, i) => {
          const s = getStatus(inquiry.status);
          return (
            <div
              key={inquiry.id}
              className={`relative flex flex-col gap-3 p-4 transition-all cursor-pointer ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/[0.03]' : 'hover:bg-slate-50/50'}`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                  router.push(`/admin/tickets/${inquiry.id}`);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ScrambledUUID uuid={inquiry.tracking_uuid} />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.badge} shrink-0`}>
                  {s.label}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-brand-deep-blue capitalize leading-tight">
                    {inquiry.contact_name}
                  </p>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue" />
                </div>
                {inquiry.company_name && (
                  <p className="text-xs text-slate-400 capitalize mt-0.5">
                    {inquiry.company_name}
                  </p>
                )}
              </div>

              <div className="flex items-end justify-between pt-1 border-t border-slate-50">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    {inquiry.divisions?.display_name || 'Industrial'}
                  </span>
                  <span 
                    className="text-xs font-semibold text-brand-deep-blue line-clamp-1 cursor-help"
                    title={inquiry.inquiry_payload?.productName || 'General Inquiry'}
                  >
                    {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                  </span>
                  <div onClick={e => e.stopPropagation()} className="p-1">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(inquiry.id)}
                      onChange={() => handleSelectOne(inquiry.id)}
                      className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue cursor-pointer"
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
                    <span 
                      className="text-sm font-semibold text-brand-deep-blue line-clamp-1 cursor-help"
                      title={inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    >
                      {inquiry.inquiry_payload?.productName || 'General Inquiry'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-brand-deep-blue">{inquiry.contact_name}</p>
                    {inquiry.company_name && (
                      <p 
                        className="text-sm text-slate-500 truncate max-w-[180px] cursor-help"
                        title={inquiry.company_name}
                      >
                        {inquiry.company_name}
                      </p>
                    )}
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
