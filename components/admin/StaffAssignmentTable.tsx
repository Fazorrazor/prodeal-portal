import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createServer } from '../../lib/supabase/server';
import { StaffAssignmentClientList } from './StaffAssignmentClientList';

export async function StaffAssignmentTable({
  hideManageLink = false,
  search = '',
}: { hideManageLink?: boolean; search?: string } = {}) {
  const supabase = await createServer();

  let query = supabase
    .from('staff_members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,role.ilike.%${search}%,whatsapp_phone.ilike.%${search}%`
    );
  }

  const [{ data: { user } }, { data: staff, error }, { data: divisions }] = await Promise.all([
    supabase.auth.getUser(),
    query,
    supabase.from('divisions').select('id, display_name'),
  ]);

  if (error) {
    throw new Error(`Failed to fetch staff roster: ${error.message}`);
  }

  const members = staff || [];

  const header = (
    <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-semibold text-[#0A1628] tracking-tight">Team Directory</h2>
        <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
          {members.length}
        </span>
      </div>
      {!hideManageLink && (
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#1A56DB] hover:text-[#0A1628] transition-colors whitespace-nowrap"
        >
          <span>Manage team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
        {header}
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-1">No team members found</h3>
          <p className="text-xs text-slate-400">
            No staff accounts match your accessible divisions or search query.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      {header}
      <StaffAssignmentClientList staff={members} user={user} divisions={divisions || []} />
    </div>
  );
}
