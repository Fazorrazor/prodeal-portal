import { createServer } from '../../lib/supabase/server';
import { USER_ROLES } from '../../lib/config/roles';
import { format } from 'date-fns';
import Link from 'next/link';
import { AnimatedBorder } from './AnimatedBorder';
import { StaffActions } from './StaffActions';

export async function StaffAssignmentTable({ hideManageLink = false, search = '' }: { hideManageLink?: boolean, search?: string } = {}) {
  const supabase = await createServer();

  const { data: { user } } = await supabase.auth.getUser();

  // Supabase RLS will naturally filter this for 'agent' role
  // 'admin' role will see all staff
  let query = supabase
    .from('staff_members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,role.ilike.%${search}%,whatsapp_phone.ilike.%${search}%`);
  }

  const { data: staff, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch staff roster: ${error.message}`);
  }

  const { data: divisions } = await supabase.from('divisions').select('id, display_name');

  const header = (
    <div className="p-6 relative flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-3">
        <h2 className="font-display font-semibold text-lg text-brand-deep-blue leading-none">Active Staff Load</h2>
      </div>
      {!hideManageLink && (
        <Link href="/admin/staff" className="text-sm font-medium text-brand-blue hover:text-brand-deep-blue transition-colors">
          Manage
        </Link>
      )}
    </div>
  );

  if (!staff || staff.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        {header}
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-slate-400">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-brand-deep-blue mb-1">No Staff Found</h3>
          <p className="text-sm text-slate-500">
            No members assigned to your accessible divisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md">
        {header}
      </div>

      {/* Mobile card list */}
      <div className="mt-2 md:hidden flex flex-col divide-y divide-brand-border/30">
        {staff
          .sort((a: { auth_user_id: string }, b: { auth_user_id: string }) => {
            if (a.auth_user_id === user?.id) return -1;
            if (b.auth_user_id === user?.id) return 1;
            return 0;
          })
          .map((member: { id: string; full_name: string; auth_user_id: string; role: string; division_ids: string[] | null; whatsapp_phone: string; is_active: boolean; created_at: string }, i: number) => {
            const isCurrentUser = member.auth_user_id === user?.id;
            const divisionsList = member.division_ids && member.division_ids.length > 0
              ? member.division_ids.map((id: string) => ((divisions as any[]) || []).find((d: any) => d.id === id)?.display_name).filter(Boolean).join(', ')
              : 'Unassigned';

            return (
              <div
                key={member.id}
                className={`relative flex flex-col gap-3 py-4 pl-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${isCurrentUser ? 'bg-brand-blue/[0.04]' : ''}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Left status accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${member.is_active ? 'bg-emerald-500' : 'bg-brand-border/60'}`} />

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-brand-deep-blue leading-tight">{member.full_name}</span>
                      {isCurrentUser && <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/30 px-1">(You)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${member.role === USER_ROLES.ADMIN ? 'text-brand-red border-brand-red/30 bg-brand-red/5' : 'text-brand-blue border-brand-blue/30 bg-brand-blue/5'}`}>
                        {member.role}
                      </span>
                      <span className="text-[11px] text-brand-deep-blue/60 font-mono">{member.whatsapp_phone}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${member.is_active ? 'text-emerald-600' : 'text-brand-deep-blue/40'}`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-brand-deep-blue/40 tracking-[0.2em] mb-0.5">Assigned Divisions</span>
                    <span className="text-xs font-semibold text-brand-deep-blue/80 leading-snug">{divisionsList}</span>
                  </div>
                  <div className="shrink-0">
                    <StaffActions member={member} divisions={divisions || []} currentUserId={user?.id} />
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
              <th className="py-3 pl-6 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-3 pl-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Joined</th>
              <th className="py-3 pl-4 pr-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {staff
              .sort((a: { auth_user_id: string }, b: { auth_user_id: string }) => {
                if (a.auth_user_id === user?.id) return -1;
                if (b.auth_user_id === user?.id) return 1;
                return 0;
              })
              .map((member: { id: string; full_name: string; auth_user_id: string; role: string; division_ids: string[] | null; whatsapp_phone: string; is_active: boolean; created_at: string }, i: number) => {
                const isCurrentUser = member.auth_user_id === user?.id;
                const divisionsList = member.division_ids && member.division_ids.length > 0
                  ? member.division_ids.map((id: string) => ((divisions as any[]) || []).find((d: any) => d.id === id)?.display_name).filter(Boolean).join(', ')
                  : 'Unassigned';

                return (
                  <tr
                    key={member.id}
                    className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both border-b border-slate-50 last:border-0 ${isCurrentUser ? 'bg-brand-blue/[0.04]' : 'hover:bg-slate-50/50'}`}
                    style={{ animationDelay: `${i * 30}ms` } as React.CSSProperties}
                  >
                    <td className="py-4 pl-6 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${member.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-brand-deep-blue text-sm">{member.full_name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-medium text-brand-blue bg-brand-blue/10 rounded-md px-1.5 py-0.5">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md border ${member.role === USER_ROLES.ADMIN ? 'text-brand-red border-brand-red/20 bg-brand-red/5' : 'text-brand-blue border-brand-blue/20 bg-brand-blue/5'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 align-middle max-w-[200px]">
                      {divisionsList}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-sm align-middle">{member.whatsapp_phone}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${member.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-slate-500 text-sm text-right align-middle whitespace-nowrap">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 pl-4 pr-6 align-middle text-right">
                      <StaffActions member={member} divisions={divisions || []} currentUserId={user?.id} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
