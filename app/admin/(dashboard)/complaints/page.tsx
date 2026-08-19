import { createServer } from '../../../../lib/supabase/server';
import { format } from 'date-fns';
import { AlertCircle, Mail, Clock, MessageSquareWarning } from 'lucide-react';
import { redirect } from 'next/navigation';
import { DeleteComplaintButton } from './DeleteComplaintButton';

export const revalidate = 0;

export default async function ComplaintsPage() {
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: staff } = await supabase
    .from('staff_members')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (staff?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <h2 className="text-xl font-bold font-display text-brand-red mb-1">Access Restricted</h2>
        <p className="text-slate-500 text-sm">Only system administrators can access the support complaints log.</p>
      </div>
    );
  }

  const { data: complaints, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-brand-red bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-semibold text-sm">Error loading complaints: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-deep-blue tracking-tight leading-tight mb-1">
            Complaints & Support Tickets
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {complaints?.length || 0} total support record{(complaints?.length || 0) !== 1 ? 's' : ''} logged
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!complaints || complaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] py-20 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-brand-deep-blue mb-1">All Clear</h3>
            <p className="text-xs text-slate-400">No unresolved customer complaints or support escalations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((ticket: any) => (
              <div
                key={ticket.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
              >
                {/* Header Row: Sender, Timestamp, Delete */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100/80">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquareWarning className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-brand-deep-blue break-all">
                          {ticket.email}
                        </span>
                        {ticket.status === 'new' && (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-brand-red text-[10px] font-semibold uppercase tracking-wider rounded-full">
                            New Escalation
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <DeleteComplaintButton ticketId={ticket.id} />
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/70">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Customer Message & Feedback
                  </span>
                  <p className="text-xs sm:text-sm text-brand-deep-blue leading-relaxed whitespace-pre-wrap font-medium">
                    {ticket.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
