import { createServer } from '../../lib/supabase/server';
import { USER_ROLES } from '../../lib/config/roles';
import { format } from 'date-fns';
import Link from 'next/link';
import { AnimatedBorder } from './AnimatedBorder';
import { StaffAssignmentClientList } from './StaffAssignmentClientList';

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
    <div className="py-6 relative flex items-center justify-between border-b-2 border-brand-border/60 bg-transparent">
      <div className="flex items-center gap-3">
        <h2 className="font-heading font-bold text-xl tracking-tighter text-brand-deep-blue leading-none">Active Staff Load</h2>
      </div>
      {!hideManageLink && (
        <Link href="/admin/staff" className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:text-brand-deep-blue transition-colors">
          Manage
        </Link>
      )}
    </div>
  );

  if (!staff || staff.length === 0) {
    return (
      <div className="mt-12 bg-transparent border-t border-brand-border/60">
        {header}
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <h3 className="text-3xl font-heading font-bold tracking-tighter text-brand-deep-blue/40 mb-1">ALL CLEAR</h3>
          <p className="text-[10px] uppercase font-bold tracking-widest text-brand-deep-blue/60">
            No members assigned to your accessible divisions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-transparent">
      {header}
      <StaffAssignmentClientList staff={staff} user={user} divisions={divisions || []} />
    </div>
  );
}
