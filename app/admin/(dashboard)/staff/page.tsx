import { Suspense } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { StaffAssignmentTable } from '../../../../components/admin/StaffAssignmentTable';
import { StaffAssignmentTableSkeleton } from '../../../../components/admin/StaffAssignmentTableSkeleton';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { AddStaffPanel } from '../../../../components/admin/AddStaffPanel';
import { getVerifiedActiveStaff } from '../../../../lib/supabase/requireStaff';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function StaffPage(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const auth = await getVerifiedActiveStaff();
  if (!auth.ok) {
    redirect('/admin/login');
  }
  const { staff, supabase } = auth.context;
  if (staff.role !== 'admin') {
    redirect('/admin');
  }

  const { data: divisions } = await supabase.from('divisions').select('id, display_name');
  const search = searchParams?.search || '';

  return (
    <div className="space-y-6 pb-10">
      <div className="pb-6 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0A1628]">Team</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage staff access, authorization roles, and division assignments.
          </p>
        </div>
        <div id="tour-add-staff" className="self-start sm:self-auto">
          <AddStaffPanel divisions={divisions || []} />
        </div>
      </div>

      {search && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-lg border border-slate-200/80 text-xs">
          <span className="text-slate-600">
            Filtering members for{' '}
            <strong className="font-semibold text-[#0A1628]">&ldquo;{search}&rdquo;</strong>
          </span>
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-[#0A1628] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </Link>
        </div>
      )}

      <DivisionErrorBoundary>
        <div id="tour-staff-table">
          <Suspense fallback={<StaffAssignmentTableSkeleton />}>
            <StaffAssignmentTable hideManageLink={true} search={search} />
          </Suspense>
        </div>
      </DivisionErrorBoundary>
    </div>
  );
}
