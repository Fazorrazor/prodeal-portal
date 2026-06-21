import { createServer } from '../../lib/supabase/server';
import { USER_ROLES } from '../../lib/config/roles';
import { format } from 'date-fns';
import Link from 'next/link';
import { AnimatedBorder } from './AnimatedBorder';
import { StaffActions } from './StaffActions';

export async function StaffAssignmentTable({ hideManageLink = false }: { hideManageLink?: boolean } = {}) {
  const supabase = createServer();

  const { data: { user } } = await supabase.auth.getUser();

  // Supabase RLS will naturally filter this for 'agent' role
  // 'admin' role will see all staff
  const { data: staff, error } = await supabase
    .from('staff_members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch staff roster: ${error.message}`);
  }

  const { data: divisions } = await supabase.from('divisions').select('id, display_name');

  const header = (
    <div className="pb-4 relative flex items-end justify-between">
      <AnimatedBorder direction="bottom" delay={0.4} className="!bg-brand-deep-blue" />
      <h2 className="font-heading font-bold text-xl text-brand-deep-blue leading-none tracking-tighter">Active Staff Load</h2>
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
        <div className="py-16 flex flex-col items-start">
          <h3 className="text-2xl font-heading font-bold text-brand-deep-blue tracking-tighter mb-2">No Staff Found.</h3>
          <p className="text-sm text-brand-deep-blue/60 font-body">
            There are currently no staff members assigned to your accessible divisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {header}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/60">
              <th className="py-4 pr-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest align-bottom">Name</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest align-bottom">Role</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest align-bottom">Service</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest align-bottom">WhatsApp<br/>Phone</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest align-bottom">Status</th>
              <th className="py-4 pl-4 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest text-right align-bottom">Joined</th>
              <th className="py-4 pl-4 pr-2 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest text-right align-bottom">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {staff
              .sort((a: { auth_user_id: string }, b: { auth_user_id: string }) => {
                if (a.auth_user_id === user?.id) return -1;
                if (b.auth_user_id === user?.id) return 1;
                return 0;
              })
              .map((member: { id: string; full_name: string; auth_user_id: string; role: string; division_ids: string[] | null; whatsapp_phone: string; is_active: boolean; created_at: string }, i: number) => {
                const isCurrentUser = member.auth_user_id === user?.id;
                return (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-black/5 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ${isCurrentUser ? 'bg-brand-blue/5' : ''}`}
                    style={{ animationDelay: `${i * 30}ms` } as React.CSSProperties}
                  >
                    <td className="py-4 pr-4 font-bold text-brand-deep-blue text-sm align-middle">
                      <div className="flex items-center gap-2">
                        {member.full_name}
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest ml-2">
                            (You)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                  <span className={`text-[10px] font-bold uppercase tracking-widest
                    ${member.role === USER_ROLES.ADMIN ? 'text-brand-red' : 'text-brand-blue'}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-brand-deep-blue align-middle">
                  {member.division_ids && member.division_ids.length > 0 
                    ? member.division_ids.map((id: string) => divisions?.find((d: { id: string; display_name: string }) => d.id === id)?.display_name).filter(Boolean).join(', ')
                    : 'Unassigned'}
                </td>
                <td className="px-4 py-4 text-brand-deep-blue/60 font-mono text-xs align-middle">
                  {member.whatsapp_phone}
                </td>
                <td className="px-4 py-4 align-middle">
                  <span className={`text-[10px] font-bold uppercase tracking-widest
                    ${member.is_active ? 'text-emerald-600' : 'text-gray-400'}
                  `}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 pl-4 text-brand-deep-blue/60 text-xs font-mono text-right align-middle">
                  {format(new Date(member.created_at), 'MMM d, yyyy')}
                </td>
                <td className="py-4 pl-4 pr-2 align-middle">
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
