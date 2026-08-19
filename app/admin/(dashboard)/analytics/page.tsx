import { createServer } from '../../../../lib/supabase/server';
import { MetricCard } from '../../../../components/admin/MetricCard';
import { BarChart3, TrendingUp, Zap, ArrowUpRight, Target, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { USER_ROLES } from '../../../../lib/config/roles';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AnalyticsPage() {
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: staff } = await supabase
    .from('staff_members')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (staff?.role !== USER_ROLES.ADMIN) {
    redirect('/admin');
  }

  const { data: inquiries, error } = await supabase
    .from('inquiries')
    .select('id, status, division_id, created_at, divisions(display_name)')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    throw new Error(`Analytics DB Error: ${error.message}`);
  }

  const total = inquiries?.length || 0;
  
  const statusCounts = (inquiries || []).reduce((acc: any, curr: any) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const quoted = statusCounts['quoted'] || 0;
  const closed = statusCounts['closed'] || 0;
  const inProgress = statusCounts['in_progress'] || 0;
  
  const quoteRatio = total > 0 ? Math.round((quoted / total) * 100) : 0;
  
  const divisionCounts = (inquiries || []).reduce((acc: any, curr: any) => {
    const divName = curr.divisions?.display_name || 'Unknown';
    if (acc[divName] !== undefined) {
      acc[divName] = (acc[divName] || 0) + 1;
    } else {
      acc[divName] = 1;
    }
    return acc;
  }, {
    'Chemicals': 0,
    'Disposable Bowls': 0,
    '3D Signages': 0,
    'Souvenirs & Printing': 0
  });

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentVolume = (inquiries || []).filter((i: any) => new Date(i.created_at) >= yesterday).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2 pb-16">
      
      {/* Header */}
      <div className="pb-5 border-b border-slate-100">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-deep-blue tracking-tight leading-tight mb-1">
          Business Intelligence
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Division attribution, inquiry conversion velocity, and real-time operational telemetry.
        </p>
      </div>

      {/* Primary Pipeline Metrics */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Pipeline Conversion & Velocity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard 
            title="Inquiry-to-Quote Ratio" 
            value={`${quoteRatio}%`} 
            icon={<Target className="w-4 h-4" />} 
            trend={quoteRatio > 30 ? 'Healthy conversion' : 'Needs optimization'} 
          />
          <MetricCard 
            title="Total Pipeline Volume" 
            value={total} 
            icon={<BarChart3 className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Active Engagements" 
            value={inProgress} 
            icon={<TrendingUp className="w-4 h-4" />} 
          />
        </div>
      </div>

      {/* Division Attribution Cards with Progress Bars */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Division Volume Attribution
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(divisionCounts).map(([name, count]: [string, any]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div 
                key={name} 
                className="p-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{name}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-3xl font-display font-bold text-brand-deep-blue tracking-tight leading-none block mt-2">
                    {count}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium mb-1.5">
                    <span>Share</span>
                    <span className="font-semibold text-brand-deep-blue">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-blue rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Telemetry */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          System Health & Rate Limits (24h)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Inquiries (24h)</span>
              <span className="text-3xl font-display font-bold text-brand-deep-blue tracking-tight block">
                {recentVolume}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rate Limit Defense</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display font-bold text-brand-deep-blue tracking-tight">Active</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Protected
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
