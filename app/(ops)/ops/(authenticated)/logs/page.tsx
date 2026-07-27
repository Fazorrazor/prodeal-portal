/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import { verifyOpsSession } from "@/lib/ops/auth";
import { redirect } from "next/navigation";
import { fetchOpsAuditLogs } from "./actions";
import {
  ServerCrash,
  Terminal,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { LogEntryInteractive } from "./LogEntryInteractive";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Fetch fresh logs on every mount

export default async function OpsLogsPage() {
  const session = await verifyOpsSession();
  if (!session) redirect("/ops/login");

  let logs = [];
  let errorMsg = null;

  try {
    logs = await fetchOpsAuditLogs();
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="flex flex-col gap-8 w-full font-mono h-[85vh]">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative shrink-0">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#E50914] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <Terminal className="w-8 h-8 text-[#E50914]" />
            Application Telemetry
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>Supabase Audit Log Drain</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            {!errorMsg ? (
              <span className="text-[#27D17F]">Stream Connected</span>
            ) : (
              <span className="text-[#E50914]">Connection Failed</span>
            )}
          </div>
        </div>
      </header>

      {errorMsg ? (
        <div className="border border-[#E50914]/30 bg-[#310004]/20 p-5 flex gap-3 shrink-0">
          <ServerCrash className="w-5 h-5 text-[#E50914] shrink-0" />
          <div className="flex flex-col gap-1">
            <h3 className="text-[#E50914] text-[0.7rem] font-bold uppercase tracking-[0.1em]">
              Database Fetch Error
            </h3>
            <p className="text-[#A7A7AA] text-[0.65rem] uppercase tracking-wider">
              {errorMsg}
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-[#141416] bg-[#090909] flex flex-col relative overflow-hidden group flex-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.1)_0%,transparent_70%)] pointer-events-none" />

          <div className="p-4 border-b border-[#141416] bg-[#0D0D0F] flex justify-between items-center shrink-0">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#27D17F]" />
              Immutable Audit Trail
            </h2>
            <div className="flex gap-2 text-[#A7A7AA] text-[0.6rem] uppercase tracking-widest">
              <span>{logs.length} events logged</span>
              <span>|</span>
              <span className="text-[#27D17F] animate-pulse">Live</span>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4 font-mono text-[0.65rem]">
              {logs.length === 0 ? (
                <div className="text-[#68686F] italic">No logs found...</div>
              ) : (
                logs.map((log: any) => (
                  <LogEntryInteractive key={log.id} log={log} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
