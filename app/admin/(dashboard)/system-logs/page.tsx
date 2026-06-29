import { createServer } from '../../../../lib/supabase/server';
import { format } from 'date-fns';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { CopyButton } from '../../../../components/shared/CopyButton';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function SystemLogsPage({ searchParams }: { searchParams: { search?: string } }) {
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

  const search = searchParams?.search || '';

  let query = supabase
    .from('system_error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (search) {
    query = (query as any).or(`context.ilike.%${search}%,error_message.ilike.%${search}%`);
  }

  const { data: logs, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  return (
    <div className="space-y-0 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      {/* Page header */}
      <div className="pb-6 relative flex items-start justify-between">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">System Logs</h1>
          <p className="text-brand-deep-blue/60 text-sm font-mono uppercase tracking-widest mt-1">
            {logs && logs.length > 0 ? `${logs.length} error${logs.length !== 1 ? 's' : ''} recorded` : 'No errors recorded'}
          </p>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-3 pt-6 pb-4 relative">
        <AnimatedBorder direction="bottom" delay={0.3} />
        <div className="w-1 h-5 bg-brand-red shrink-0" />
        <h2 className="font-heading font-bold text-lg text-brand-deep-blue tracking-tighter leading-none">Recent Errors</h2>
        {logs && logs.length > 0 && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/40 font-mono">
            Showing {logs.length}
          </span>
        )}
      </div>

      {/* Empty state */}
      {(!logs || logs.length === 0) && (
        <div className="border-t border-brand-border/40 py-14 flex flex-col items-start">
          <h3 className="text-3xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-2">System Healthy.</h3>
          <p className="text-sm text-brand-deep-blue/60 font-mono uppercase tracking-widest mt-2">
            No system errors recorded in the database.
          </p>
        </div>
      )}

      {/* Log entries */}
      {logs && logs.length > 0 && (
        <div className="flex flex-col divide-y divide-brand-border/30">
          {logs.map((log: { id: string, context: string, error_message: string, error_stack: string | null, metadata: Record<string, unknown>, created_at: string }, i: number) => (
            <div
              key={log.id}
              className="relative flex flex-col gap-3 py-5 pl-4 sm:pl-6 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              {/* Left red accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red" />

              {/* Context + timestamp row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] break-words">
                    {log.context}
                  </span>
                </div>
                <span className="text-[10px] text-brand-deep-blue/40 font-mono shrink-0">
                  {format(new Date(log.created_at), 'MMM d, yyyy — HH:mm:ss')}
                </span>
              </div>

              {/* Error message */}
              <div className="bg-brand-deep-blue/[0.04] border-l-2 border-brand-red/60 px-3 py-2.5 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-brand-deep-blue leading-snug break-words flex-1">
                  {log.error_message}
                </p>
                <div className="shrink-0 mt-0.5">
                  <CopyButton text={log.error_message} label="Copied error message" />
                </div>
              </div>

              {/* Stack trace + metadata toggles */}
              <div className="flex flex-col sm:flex-row gap-2">
                {log.error_stack && (
                  <details className="text-[10px] text-brand-deep-blue/60 font-mono cursor-pointer border border-brand-border/40 flex-1">
                    <summary className="px-3 py-2 uppercase tracking-widest font-bold flex items-center justify-between hover:bg-black/5 transition-colors">
                      <span>Stack Trace</span>
                      <CopyButton text={log.error_stack} label="Copied stack trace" />
                    </summary>
                    <div className="px-3 py-2 border-t border-brand-border/40 whitespace-pre-wrap overflow-x-auto max-h-48 leading-relaxed text-[9px]">
                      {log.error_stack}
                    </div>
                  </details>
                )}

                {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                  <details className="text-[10px] text-brand-deep-blue/60 font-mono cursor-pointer border border-brand-border/40 sm:max-w-[240px]">
                    <summary className="px-3 py-2 uppercase tracking-widest font-bold flex items-center justify-between hover:bg-black/5 transition-colors">
                      <span>Metadata</span>
                      <CopyButton text={JSON.stringify(log.metadata, null, 2)} label="Copied metadata" />
                    </summary>
                    <div className="px-3 py-2 border-t border-brand-border/40 whitespace-pre-wrap overflow-x-auto max-h-48 text-[9px]">
                      {JSON.stringify(log.metadata, null, 2)}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
