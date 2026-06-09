'use client';

import Link from 'next/link';
import { ChevronRight, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { AnimatedBorder } from './AnimatedBorder';

function ScrambledUUID({ uuid }: { uuid: string }) {
  const { displayText } = useScrambleText(uuid.substring(0, 8).toUpperCase(), 400, 1000);
  return <span className="font-mono text-sm text-brand-deep-blue font-bold">{displayText}...</span>;
}

export function RecentTicketsTable({ inquiries }: { inquiries: any[] }) {
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
    <div className="mt-8">
      {header}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/60">
              <th className="py-4 pr-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Tracking ID</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest">Division</th>
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
                className="hover:bg-black/5 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="py-4 pr-4"><ScrambledUUID uuid={inquiry.tracking_uuid} /></td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-brand-deep-blue">
                    {inquiry.divisions?.display_name || 'Unknown'}
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
