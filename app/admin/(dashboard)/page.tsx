import { createServer } from '../../../lib/supabase/server';
import { MetricsRow } from '../../../components/admin/MetricsRow';
import { RecentTicketsTable } from '../../../components/admin/RecentTicketsTable';
import { StaffAssignmentTable } from '../../../components/admin/StaffAssignmentTable';
import { AnimatedBorder } from '../../../components/admin/AnimatedBorder';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminDashboardOverview() {
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'agent';

  if (user) {
    const { data: staff } = await supabase
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();
    if (staff?.role) userRole = staff.role;
  }

  // Fetch inquiries to calculate metrics and get recent tickets
  // The server client automatically applies RLS!
  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select(`
      id,
      tracking_uuid,
      status,
      created_at,
      contact_name,
      company_name,
      divisions (
        display_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Dashboard Supabase Error: ${error.message} | Details: ${error.details || error.hint}`);
  }

  // Calculate true metrics using database counts instead of local arrays
  const [{ count: total }, { count: pending }, { count: resolved }] = await Promise.all([
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).in('status', ['new', 'in_progress']),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'closed')
  ]);
  
  // Calculate avg time via Database RPC (accurately accounts for inquiry events delta)
  const { data: avgHoursData } = await supabase.rpc('get_avg_resolution_time_hrs');
  const avgTime = `${avgHoursData || 0} hrs`;

  const recent = (inquiries || []).slice(0, 20);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      <div className="relative pb-4">
        <AnimatedBorder direction="bottom" delay={0.1} className="!bg-brand-deep-blue" />
        <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">Dashboard</h1>
        <p className="text-brand-deep-blue/60 font-body text-sm max-w-xl">Welcome back. Here is the latest status of your division's inquiries.</p>
      </div>

      <div id="tour-metrics">
        <MetricsRow 
          total={total}
          pending={pending}
          resolved={resolved}
          avgTime={avgTime}
        />
      </div>

      <div className="flex flex-col gap-12">
        <div id="tour-recent-tickets">
          <RecentTicketsTable inquiries={recent} />
        </div>
        {userRole === 'admin' && <StaffAssignmentTable />}
      </div>
    </div>
  );
}
