import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getVerifiedActiveStaff } from '../../../lib/supabase/requireStaff';
import { MetricsRow } from '../../../components/admin/MetricsRow';
import { RecentTicketsTable } from '../../../components/admin/RecentTicketsTable';
import { StaffAssignmentTable } from '../../../components/admin/StaffAssignmentTable';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminDashboardOverview() {
  const auth = await getVerifiedActiveStaff();
  if (!auth.ok) {
    redirect('/admin/login');
  }

  const { staff, supabase } = auth.context;
  const userRole = staff.role || 'agent';

  // Fetch recent inquiries, exact counts, and average resolution time in parallel
  const [
    { data: inquiries, error },
    { count: total },
    { count: pending },
    { count: resolved },
    { data: avgHoursData },
  ] = await Promise.all([
    supabase
      .from('inquiries')
      .select(`
        id,
        tracking_uuid,
        status,
        created_at,
        contact_name,
        company_name,
        inquiry_payload,
        divisions (
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'in_progress']),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
    supabase.rpc('get_avg_resolution_time_hrs'),
  ]);

  if (error) {
    throw new Error(
      `Dashboard Supabase Error: ${error.message} | Details: ${error.details || error.hint}`
    );
  }

  const avgHours = Number(avgHoursData || 0);
  const avgTime = `${avgHours > 0 ? avgHours.toFixed(1).replace(/\.0$/, '') : '0'} hrs`;
  const recent = inquiries || [];

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0A1628]">
            Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time inquiry intake, division routing, and response performance.
          </p>
        </div>

        <Link
          href="/admin/tickets"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-medium text-[#0A1628] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[background-color,transform] duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <span>All Inquiries</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* KPI Strip */}
      <div id="tour-metrics">
        <MetricsRow
          total={total || 0}
          pending={pending || 0}
          resolved={resolved || 0}
          avgTime={avgTime}
        />
      </div>

      {/* Tables Stack */}
      <div className="space-y-8">
        <div id="tour-recent-tickets">
          <RecentTicketsTable inquiries={recent} />
        </div>
        {userRole === 'admin' && <StaffAssignmentTable />}
      </div>
    </div>
  );
}
