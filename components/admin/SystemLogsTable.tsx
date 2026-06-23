import { createServer } from '../../lib/supabase/server';
import { format } from 'date-fns';
import { AnimatedBorder } from './AnimatedBorder';

export async function SystemLogsTable() {
  const supabase = await createServer();

  const { data: logs, error } = await supabase
    .from('system_error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  const header = (
    <div className="pb-4 relative flex items-end justify-between">
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
    <div className="mt-8">
      {header}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
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
                <td className="py-4 pr-4 text-xs font-bold text-brand-red uppercase tracking-widest align-top max-w-[200px] break-words">
                  {log.context}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-brand-deep-blue align-top max-w-sm">
                  <div className="break-words mb-2">{log.error_message}</div>
                  {log.error_stack && (
                    <details className="text-[10px] text-brand-deep-blue/80 font-mono mt-1 cursor-pointer">
                      <summary className="hover:text-brand-blue uppercase tracking-widest font-bold">View Stack</summary>
                      <div className="mt-2 p-2 bg-brand-deep-blue/5 border-l-2 border-brand-red whitespace-pre-wrap overflow-x-auto">
                        {log.error_stack}
                      </div>
                    </details>
                  )}
                </td>
                <td className="px-4 py-4 align-top">
                  {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 ? (
                    <div className="text-[10px] font-mono text-brand-deep-blue/80 bg-brand-deep-blue/5 p-2 border-l border-brand-deep-blue/20 max-w-[200px] break-words">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  ) : (
                    <span className="text-[10px] text-brand-deep-blue/80 uppercase tracking-widest">None</span>
                  )}
                </td>
                <td className="py-4 pl-4 text-brand-deep-blue/80 text-xs font-mono text-right align-top whitespace-nowrap">
                  {format(new Date(log.created_at), 'MMM d, HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
