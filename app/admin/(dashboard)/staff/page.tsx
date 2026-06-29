import { Suspense } from 'react';
import { StaffAssignmentTable } from '../../../../components/admin/StaffAssignmentTable';
import { StaffAssignmentTableSkeleton } from '../../../../components/admin/StaffAssignmentTableSkeleton';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { AddStaffPanel } from '../../../../components/admin/AddStaffPanel';
import { createServer } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function StaffPage(props: { searchParams: Promise<{ search?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: staff } = await supabase
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();
    if (staff?.role !== 'admin') {
      redirect('/admin');
    }
  } else {
    redirect('/admin/login');
  }

  const { data: divisions } = await supabase.from('divisions').select('id, display_name');
  const search = searchParams?.search || '';

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      <div className="pb-6 relative flex items-start justify-between">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">Staff Roster</h1>
          <p className="text-brand-deep-blue/80 text-sm mt-1">
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
