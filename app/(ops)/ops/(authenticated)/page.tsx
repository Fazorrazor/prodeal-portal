/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import { verifyOpsSession } from "@/lib/ops/auth";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  Cpu,
  Network,
  Clock,
  Skull,
  Zap,
  Database,
} from "lucide-react";

export default async function OpsDashboard() {
  const session = await verifyOpsSession();
  if (!session) redirect("/ops/login");

  return (
    <div className="flex flex-col gap-8 w-full font-mono">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#E50914] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <Activity className="w-8 h-8 text-[#E50914]" />
            Systems Overview
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>Global Telemetry</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            <span className="text-[#4CA6FF]">Data Stream Active</span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="text-[#A7A7AA] text-[0.6rem] tracking-[0.1em] uppercase mb-1">
            Current Server Time
          </div>
          <div className="text-[#F5F5F5] text-lg font-bold tracking-widest bg-[#0D0D0F] px-4 py-2 border border-[#141416] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            {new Date().toISOString().replace("T", " ").substring(0, 19)}
          </div>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="System Health"
          value="NOMINAL"
          status="good"
          icon={<ShieldCheck className="w-5 h-5" />}
          meta="UPTIME: 99.99%"
        />
        <MetricCard
          title="Database Signal"
          value="CONNECTED"
          status="good"
          icon={<Database className="w-5 h-5" />}
          meta="LATENCY: 12ms"
        />
        <MetricCard
          title="Active Threats"
          value="0"
          status="neutral"
          icon={<Skull className="w-5 h-5" />}
          meta="LAST 24H: 0 DETECTED"
        />
        <MetricCard
          title="Failed Requests"
          value="24"
          status="warning"
          icon={<AlertTriangle className="w-5 h-5" />}
          meta="RATE: 0.05%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Live Operations Feed */}
        <div className="lg:col-span-2 border border-[#141416] bg-[#090909] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.1)_0%,transparent_70%)]" />

          <div className="p-4 border-b border-[#141416] bg-[#0D0D0F] flex justify-between items-center">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E50914]" />
              Live Operations Feed
            </h2>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-[#E50914] animate-pulse" />
              <div className="w-1.5 h-1.5 bg-[#E50914]/30" />
              <div className="w-1.5 h-1.5 bg-[#E50914]/30" />
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3 font-mono text-[0.65rem]">
              <LogEntry
                level="info"
                msg="System boot sequence complete. Middleware routing active."
              />
              <LogEntry
                level="audit"
                msg="Admin authenticated via Ops Gateway."
                target="DEV_PORTAL"
              />
              <LogEntry
                level="warn"
                msg="Deprecated client header removed from portal bounds."
              />
              <LogEntry
                level="info"
                msg="AES-256-GCM encryption module initialized."
              />
              <LogEntry
                level="security"
                msg="Argon2id initial setup vector logged."
              />
              <div className="pt-2 flex items-center gap-2 text-[#44444A]">
                <span className="w-2 h-2 bg-[#E50914] animate-pulse" />
                Awaiting input stream...
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Controls Panel */}
        <div className="border border-[#E50914]/30 bg-[#310004]/20 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#E50914,#E50914_10px,transparent_10px,transparent_20px)]" />

          <div className="p-5 border-b border-[#E50914]/20 flex items-center gap-3">
            <div className="bg-[#E50914] p-1.5 shrink-0">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#E50914]">
              Critical Operations
            </h2>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4">
            <p className="text-[0.6rem] text-[#A7A7AA] leading-relaxed uppercase tracking-wider mb-2">
              The following actions require re-authentication and execute with
              maximum system privileges.
            </p>

            <button className="w-full bg-transparent border border-[#E50914] text-[#E50914] hover:bg-[#E50914] hover:text-white px-4 py-3 text-[0.65rem] font-bold tracking-[0.15em] uppercase transition-colors text-left flex justify-between items-center group">
              <span>Engage Maintenance Mode</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </button>

            <button className="w-full bg-[#111113] border border-[#141416] text-[#68686F] hover:border-[#E50914]/50 hover:text-[#A7A7AA] px-4 py-3 text-[0.65rem] font-bold tracking-[0.15em] uppercase transition-colors text-left">
              Force Database Rollback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, status, icon, meta }: any) {
  const statusColors = {
    good: "text-[#27D17F]",
    warning: "text-[#FFB020]",
    critical: "text-[#FF2638]",
    neutral: "text-[#68686F]",
  };

  const statusGlow = {
    good: "shadow-[inset_0_2px_15px_rgba(39,209,127,0.03)]",
    warning: "shadow-[inset_0_2px_15px_rgba(255,176,32,0.05)]",
    critical: "shadow-[inset_0_2px_15px_rgba(255,38,56,0.1)]",
    neutral: "",
  };

  return (
    <div
      className={`border border-[#141416] bg-[#090909] p-5 relative overflow-hidden ${statusGlow[status as keyof typeof statusGlow]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[0.6rem] text-[#A7A7AA] uppercase tracking-[0.2em] font-bold">
          {title}
        </span>
        <span className={statusColors[status as keyof typeof statusColors]}>
          {icon}
        </span>
      </div>
      <div
        className={`text-xl font-bold uppercase tracking-widest mb-3 ${statusColors[status as keyof typeof statusColors]}`}
      >
        {value}
      </div>
      <div className="text-[0.55rem] text-[#68686F] uppercase tracking-[0.1em] border-t border-[#141416] pt-3">
        {meta}
      </div>
    </div>
  );
}

function LogEntry({
  level,
  msg,
  target,
}: {
  level: string;
  msg: string;
  target?: string;
}) {
  const colors = {
    info: "text-[#4CA6FF]",
    warn: "text-[#FFB020]",
    error: "text-[#E50914]",
    security: "text-[#FF1F2D]",
    audit: "text-[#27D17F]",
  };

  const color = colors[level as keyof typeof colors] || "text-[#F5F5F5]";

  return (
    <div className="flex gap-3 hover:bg-[#141416] p-1 -mx-1 transition-colors">
      <span className="text-[#44444A] shrink-0 w-16">
        {new Date().toISOString().substring(11, 19)}
      </span>
      <span className={`${color} shrink-0 w-20 font-bold`}>
        [{level.toUpperCase()}]
      </span>
      <span className="text-[#A7A7AA] truncate">
        {msg}
        {target && (
          <span className="ml-2 text-[#68686F] border border-[#141416] px-1">
            {target}
          </span>
        )}
      </span>
    </div>
  );
}
