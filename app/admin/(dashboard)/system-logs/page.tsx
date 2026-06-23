import { Suspense } from 'react';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { createServer } from '../../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { SystemLogsTable } from '../../../../components/admin/SystemLogsTable';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function SystemLogsPage() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: staff } = await supabase
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();
    if ((staff as any)?.role !== 'admin') {
      redirect('/admin');
    }
  } else {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      <div className="pb-6 relative flex items-start justify-between">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">System Logs</h1>
          <p className="text-brand-deep-blue/80 text-sm mt-1">
            Review background failures and system errors.
          </p>
        </div>
      </div>

      <DivisionErrorBoundary>
        <Suspense fallback={<div className="h-64 flex items-center justify-center font-mono text-sm uppercase tracking-widest text-brand-deep-blue/80">Loading Logs...</div>}>
          <SystemLogsTable />
        </Suspense>
      </DivisionErrorBoundary>
    </div>
  );
}
