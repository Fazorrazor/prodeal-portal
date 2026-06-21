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

function ScrambledUUID({ uuid }: { uuid: string }) {
  const { displayText } = useScrambleText(uuid.substring(0, 8).toUpperCase(), 400, 1000);
  return <span className="font-mono text-sm text-brand-deep-blue font-bold">{displayText}...</span>;
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

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedTickets.length} tickets? This cannot be undone.`)) return;

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
    <div className="pb-4 relative flex items-end justify-between">
      <AnimatedBorder direction="bottom" delay={0.3} className="!bg-brand-deep-blue" />
      <h2 className="font-heading font-bold text-xl text-brand-deep-blue leading-none tracking-tighter">Recent Tickets</h2>
      <Link href="/admin/tickets" className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:text-brand-deep-blue transition-colors">
        View all
      </Link>
    </div>
  );

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="mt-8">
        {header}
        <div className="py-16 flex flex-col items-start">
          <h3 className="text-2xl font-heading font-bold text-brand-deep-blue tracking-tighter mb-2">All clear.</h3>
          <p className="text-sm text-brand-deep-blue/60 font-body">
            There are currently no recent tickets assigned to your division.
          </p>
        </div>
      </div>
    );
  }

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

      {header}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/60">
              <th className="py-4 pl-4 pr-2 w-10">
                <input 
                  type="checkbox" 
                  checked={inquiries.length > 0 && selectedTickets.length === inquiries.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue cursor-pointer"
                />
              </th>
              <th className="py-4 pr-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Ticket ID</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Product / Service</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Client</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Status</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Received</th>
              <th className="py-4 pl-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {inquiries.map((inquiry, i) => (
              <tr 
                key={inquiry.id} 
                className={`hover:bg-black/5 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${selectedTickets.includes(inquiry.id) ? 'bg-brand-blue/5' : ''}`}
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
                  <span className="block text-[10px] uppercase font-bold text-brand-deep-blue/60 tracking-widest mb-0.5">
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
                  <span className={`inline-flex items-center text-xs font-bold uppercase tracking-widest
                    ${inquiry.status === 'new' ? 'text-brand-red' : ''}
                    ${inquiry.status === 'in_progress' ? 'text-amber-600' : ''}
                    ${inquiry.status === 'quoted' ? 'text-brand-blue' : ''}
                    ${inquiry.status === 'closed' ? 'text-brand-deep-blue/40' : ''}
                  `}>
                    {inquiry.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-brand-deep-blue/70 font-mono">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
