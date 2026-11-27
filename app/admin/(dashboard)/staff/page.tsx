import { Suspense } from 'react';
import { StaffAssignmentTable } from '../../../../components/admin/StaffAssignmentTable';
import { StaffAssignmentTableSkeleton } from '../../../../components/admin/StaffAssignmentTableSkeleton';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';

import { AddStaffPanel } from '../../../../components/admin/AddStaffPanel';
import { getVerifiedActiveStaff } from '../../../../lib/supabase/requireStaff';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function StaffPage(props: { searchParams: Promise<{ search?: string }> }) {
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
    <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2 pb-12">
      <div className="pb-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-brand-deep-blue leading-none mb-1.5">Staff Roster</h1>
          <p className="text-slate-500 text-sm">
            Manage system access and division assignments.
          </p>
        </div>
        <div id="tour-add-staff">
          <AddStaffPanel divisions={divisions || []} />
        </div>
      </div>

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
