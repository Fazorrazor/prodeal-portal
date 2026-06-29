import { createServer } from '../../../../lib/supabase/server';
import { format } from 'date-fns';
import { AlertCircle, Mail, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';
import { DeleteComplaintButton } from './DeleteComplaintButton';

export const revalidate = 0;

export default async function ComplaintsPage() {
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Check admin role
  const { data: staff } = await supabase
    .from('staff_members')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (staff?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-bold font-heading text-brand-red mb-2 uppercase">Access Denied</h2>
        <p className="text-brand-deep-blue/70">Only administrators can view the complaints log.</p>
      </div>
    );
  }

  const { data: complaints, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-brand-red border border-brand-red/30 bg-brand-red/5">
        <p className="font-bold">Error loading complaints: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-brand-deep-blue pb-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-black text-brand-deep-blue uppercase tracking-tighter leading-none mb-2">
            Complaints <span className="text-brand-red">Log</span>
          </h1>
          <p className="text-xs font-mono font-bold text-brand-deep-blue/60 uppercase tracking-widest">
            {complaints?.length || 0} Total Records
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!complaints || complaints.length === 0 ? (
          <div className="border-t border-brand-border/40 pt-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-black/[0.03] border border-brand-border/40 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-brand-deep-blue/40" />
            </div>
            <h3 className="font-heading font-bold text-xl uppercase tracking-widest text-brand-deep-blue mb-1">No Complaints</h3>
            <p className="text-xs font-mono text-brand-deep-blue/60 uppercase tracking-widest">All clear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((ticket: any) => (
              <div key={ticket.id} className="border border-brand-border/40 bg-white p-6 relative group hover:border-brand-blue/50 transition-colors">
                {ticket.status === 'new' && (
                  <div className="absolute top-0 right-0 px-2 py-1 bg-brand-red text-white text-[9px] font-bold uppercase tracking-widest">
                    NEW
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                  
                  {/* Meta Column */}
                  <div className="w-full md:w-64 shrink-0 space-y-4 relative">
                    <div className="absolute top-0 right-0 md:-right-4">
                      <DeleteComplaintButton ticketId={ticket.id} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-3.5 h-3.5 text-brand-deep-blue/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">Sender</span>
                      </div>
                      <p className="text-sm font-mono font-bold text-brand-deep-blue break-all pr-8">
                        {ticket.email}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-brand-deep-blue/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">Received</span>
                      </div>
                      <p className="text-sm font-mono text-brand-deep-blue">
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {/* Message Column */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-brand-border/20 pt-4 md:pt-0 md:pl-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">Message</p>
                    <p className="text-sm text-brand-deep-blue leading-relaxed whitespace-pre-wrap font-body">
                      {ticket.message}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
