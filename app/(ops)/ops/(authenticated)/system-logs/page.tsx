/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import { verifyOpsSession } from "@/lib/ops/auth";
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";
import {
  ServerCrash,
  Terminal,
  ShieldCheck,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { SystemLogErrorInteractive } from "./SystemLogErrorInteractive";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Fetch fresh logs on every mount

export default async function OpsSystemLogsPage(props: { searchParams: Promise<{ search?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await verifyOpsSession();
  if (!session) redirect("/ops/login");

  const supabase = await createServer();
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
    throw new Error(`Failed to fetch system logs: ${error.message}`);
  }

  return (
    <div className="flex flex-col gap-8 w-full font-mono h-[85vh]">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative shrink-0">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#E50914] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <ServerCrash className="w-8 h-8 text-[#E50914]" />
            System Errors
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>Database Error Logs</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            <span className="text-[#27D17F]">Stream Connected</span>
          </div>
        </div>
      </header>

      <div className="border border-[#141416] bg-[#090909] flex flex-col relative overflow-hidden group flex-1">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="p-4 border-b border-[#141416] bg-[#0D0D0F] flex justify-between items-center shrink-0">
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#27D17F]" />
            Error Registry
          </h2>
          <div className="flex gap-2 text-[#A7A7AA] text-[0.6rem] uppercase tracking-widest">
            <span>{logs?.length || 0} errors logged</span>
            <span>|</span>
            <span className="text-[#27D17F] animate-pulse">Live</span>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4 font-mono text-[0.65rem]">
            {!logs || logs.length === 0 ? (
              <div className="text-[#68686F] italic">No errors found in registry...</div>
            ) : (
              logs.map((log: any) => (
                <SystemLogErrorInteractive key={log.id} log={log} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
