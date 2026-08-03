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
      <div className="p-6 text-brand-red bg-red-50 border border-red-200 rounded-xl">
        <p className="font-semibold">Error loading complaints: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-display font-semibold text-brand-deep-blue leading-none mb-1.5">
            Complaints Log
          </h1>
          <p className="text-slate-500 text-sm">
            {complaints?.length || 0} total record{(complaints?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!complaints || complaints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 py-20 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-brand-deep-blue mb-1">No Complaints</h3>
            <p className="text-sm text-slate-500">All clear — no complaints have been submitted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((ticket: any) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-6 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
              >
                {ticket.status === 'new' && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-brand-red text-white text-xs font-semibold rounded-full">
                    New
                  </span>
                )}
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  
                  {/* Meta Column */}
                  <div className="w-full md:w-56 shrink-0 space-y-4 relative">
                    <div className="absolute top-0 right-0 md:-right-4">
                      <DeleteComplaintButton ticketId={ticket.id} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sender</span>
                      </div>
                      <p className="text-sm font-semibold text-brand-deep-blue break-all pr-8">
                        {ticket.email}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Received</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {/* Message Column */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Message</p>
                    <p className="text-sm text-brand-deep-blue leading-relaxed whitespace-pre-wrap">
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
