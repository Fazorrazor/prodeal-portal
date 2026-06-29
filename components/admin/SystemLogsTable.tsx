import { createServer } from '../../lib/supabase/server';
import { format } from 'date-fns';
import { AnimatedBorder } from './AnimatedBorder';
import { CopyButton } from '../shared/CopyButton';

export async function SystemLogsTable({ search = '' }: { search?: string } = {}) {
  const supabase = await createServer();

  let query = supabase
    .from('system_error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (search) {
    query = query.or(`context.ilike.%${search}%,error_message.ilike.%${search}%`);
  }

  const { data: logs, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  const header = (
    <div className="pb-4 relative flex items-end justify-between bg-brand-surface z-20">
      <AnimatedBorder direction="bottom" delay={0.4} className="!bg-brand-deep-blue" />
      <h2 className="font-heading font-bold text-xl text-brand-deep-blue leading-none tracking-tighter">Recent Errors</h2>
    </div>
  );

  if (!logs || logs.length === 0) {
    return (
      <div className="mt-8">
        {header}
        <div className="py-16 flex flex-col items-start border-b border-brand-border/60">
          <h3 className="text-2xl font-heading font-bold text-brand-deep-blue tracking-tighter mb-2">System Healthy.</h3>
          <p className="text-sm text-brand-deep-blue/80 font-body">
            There are currently no recorded system errors in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative">
      <div className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-md pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {header}
      </div>
      <div className="overflow-x-auto mt-4 -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-brand-border/60">
              <th className="py-4 pr-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest align-bottom">Context</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest align-bottom">Message</th>
              <th className="px-4 py-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest align-bottom">Metadata</th>
              <th className="py-4 pl-4 text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest text-right align-bottom">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {logs.map((log: { id: string, context: string, error_message: string, error_stack: string | null, metadata: Record<string, unknown>, created_at: string }, i: number) => (
              <tr 
                key={log.id} 
                className="hover:bg-black/5 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Desktop Layout */}
                <td className="hidden md:table-cell py-4 pr-4 text-xs font-bold text-brand-red uppercase tracking-widest align-top max-w-[200px] break-words">
                  {log.context}
                </td>
                <td className="hidden md:table-cell px-4 py-4 text-sm font-semibold text-brand-deep-blue align-top max-w-sm">
                  <div className="break-words mb-2 flex items-start justify-between gap-2">
                    <span>{log.error_message}</span>
                    <CopyButton text={log.error_message} label="Copied error message" />
                  </div>
                  {log.error_stack && (
                    <details className="text-[10px] text-brand-deep-blue/80 font-mono mt-1 cursor-pointer">
                      <summary className="hover:text-brand-blue uppercase tracking-widest font-bold flex items-center gap-2">
                        View Stack
                        <CopyButton text={log.error_stack} label="Copied stack trace" />
                      </summary>
                      <div className="mt-2 p-2 bg-brand-deep-blue/5 border-l-2 border-brand-red whitespace-pre-wrap overflow-x-auto overflow-y-auto max-h-96">
                        {log.error_stack}
                      </div>
                    </details>
                  )}
                </td>
                <td className="hidden md:table-cell px-4 py-4 align-top">
                  {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 ? (
                    <div className="text-[10px] font-mono text-brand-deep-blue/80 bg-brand-deep-blue/5 p-2 border-l border-brand-deep-blue/20 max-w-[200px] break-words relative group/meta">
                      <div className="absolute top-1 right-1 opacity-0 group-hover/meta:opacity-100 transition-opacity bg-brand-surface/80 rounded backdrop-blur-sm">
                        <CopyButton text={JSON.stringify(log.metadata, null, 2)} label="Copied metadata" />
                      </div>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  ) : (
                    <span className="text-[10px] text-brand-deep-blue/80 uppercase tracking-widest">None</span>
                  )}
                </td>
                <td className="hidden md:table-cell py-4 pl-4 text-brand-deep-blue/80 text-xs font-mono text-right align-top whitespace-nowrap">
                  {format(new Date(log.created_at), 'MMM d, HH:mm')}
                </td>

                {/* Mobile Stacked Layout */}
                <td className="md:hidden block w-full py-4" colSpan={4}>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-brand-red uppercase tracking-widest max-w-[60%] break-words leading-tight">{log.context}</span>
                      <span className="text-[10px] text-brand-deep-blue/80 font-mono">{format(new Date(log.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                    
                    <div className="flex items-start justify-between gap-2 bg-brand-deep-blue/5 p-3 border-l-2 border-brand-red">
                      <span className="text-sm font-semibold text-brand-deep-blue break-words">{log.error_message}</span>
                      <div className="shrink-0 mt-0.5">
                        <CopyButton text={log.error_message} label="Copied error message" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {log.error_stack && (
                        <details className="text-[10px] text-brand-deep-blue/80 font-mono cursor-pointer border border-brand-border/40 p-2">
                          <summary className="hover:text-brand-blue uppercase tracking-widest font-bold flex items-center justify-between">
                            <span>View Stack Trace</span>
                            <CopyButton text={log.error_stack} label="Copied stack trace" />
                          </summary>
                          <div className="mt-2 pt-2 border-t border-brand-border/40 whitespace-pre-wrap overflow-x-auto overflow-y-auto max-h-48 text-[9px] leading-relaxed">
                            {log.error_stack}
                          </div>
                        </details>
                      )}

                      {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                        <details className="text-[10px] text-brand-deep-blue/80 font-mono cursor-pointer border border-brand-border/40 p-2">
                          <summary className="hover:text-brand-blue uppercase tracking-widest font-bold flex items-center justify-between">
                            <span>View Metadata</span>
                            <CopyButton text={JSON.stringify(log.metadata, null, 2)} label="Copied metadata" />
                          </summary>
                          <div className="mt-2 pt-2 border-t border-brand-border/40 whitespace-pre-wrap overflow-x-auto text-[9px]">
                            {JSON.stringify(log.metadata, null, 2)}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
