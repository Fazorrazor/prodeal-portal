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
    <div className="pb-4 relative flex items-center justify-between bg-brand-surface z-20">
      <AnimatedBorder direction="bottom" delay={0.4} className="!bg-brand-deep-blue" />
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-brand-blue shrink-0" />
        <h2 className="font-heading font-bold text-xl text-brand-deep-blue leading-none tracking-tighter">Active Staff Load</h2>
      </div>
      {!hideManageLink && (
        <Link href="/admin/staff" className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:text-brand-deep-blue transition-colors">
          Manage
        </Link>
      )}
    </div>
  );

  if (!staff || staff.length === 0) {
    return (
      <div className="mt-8">
        {header}
        <div className="border-t border-brand-border/40 py-14 flex flex-col items-start">
          <h3 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-2">No Staff Found.</h3>
          <p className="text-sm text-brand-deep-blue/60 font-mono uppercase tracking-widest mt-2">
            No members assigned to your accessible divisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative">
      <div className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-md pt-2 -mx-2 px-2 sm:mx-0 sm:px-0">
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
            <tr className="border-b-2 border-brand-deep-blue/20">
              <th className="py-3 pr-4 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Name</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Role</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Service</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">WhatsApp</th>
              <th className="px-4 py-3 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em]">Status</th>
              <th className="py-3 pl-4 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em] text-right">Joined</th>
              <th className="py-3 pl-4 pr-2 text-[10px] font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em] text-right">Actions</th>
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
                    className={`group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${isCurrentUser ? 'bg-brand-blue/[0.04] hover:bg-brand-blue/[0.07]' : 'hover:bg-black/[0.025]'}`}
                    style={{ animationDelay: `${i * 30}ms` } as React.CSSProperties}
                  >
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-2">
                        {/* Status dot */}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.is_active ? 'bg-emerald-500' : 'bg-brand-border/60'}`} />
                        <span className="font-bold text-brand-deep-blue text-sm">{member.full_name}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/30 px-1">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border ${member.role === USER_ROLES.ADMIN ? 'text-brand-red border-brand-red/30 bg-brand-red/5' : 'text-brand-blue border-brand-blue/30 bg-brand-blue/5'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-brand-deep-blue/80 align-middle max-w-[200px]">
                      {divisionsList}
                    </td>
                    <td className="px-4 py-4 text-brand-deep-blue/60 font-mono text-xs align-middle">{member.whatsapp_phone}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${member.is_active ? 'text-emerald-600' : 'text-brand-deep-blue/40'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-brand-deep-blue/60 text-xs font-mono text-right align-middle whitespace-nowrap">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 pl-4 pr-2 align-middle text-right">
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
