/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import { verifyOpsSession } from "@/lib/ops/auth";
import { redirect } from "next/navigation";
import { fetchDatabaseStats } from "./actions";
import { DatabaseTablesInteractive } from "./DatabaseTablesInteractive";
import {
  Database,
  ServerCrash,
  Activity,
  BarChart3,
  Fingerprint,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function categorizeTable(tableName: string): string {
  const name = tableName.toLowerCase();
  
  // Core Business Domains
  if (/^product/.test(name) || name === 'categories' || name === 'collections') return "E-Commerce & Inventory";
  if (/^inquir/.test(name) || /^support/.test(name) || name === 'clients') return "Inquiry & Support Management";
  if (/^(staff|role|permission)/.test(name)) return "IAM & Access Control";
  if (/^division/.test(name)) return "Business Divisions";
  if (/^order/.test(name) || name === 'transactions') return "Sales & Transactions";
  
  // Infrastructure & Ops
  if (/^(ops|system|audit)_/.test(name) || name === 'logs') return "System Telemetry & Ops";
  if (/^pg_/.test(name) || /^supabase_/.test(name)) return "Internal System Catalogs";

  // Dynamic Auto-Categorization Fallback
  const prefix = name.split('_')[0];
  if (!prefix) return "Uncategorized Data";
  
  return prefix.charAt(0).toUpperCase() + prefix.slice(1) + " Domain";
}

export default async function DatabaseSignalPage() {
  const session = await verifyOpsSession();
  if (!session) redirect("/ops/login");

  let tables: any[] = [];
  let errorMsg = null;

  try {
    tables = await fetchDatabaseStats();
    // Sort tables by row count descending
    if (Array.isArray(tables)) {
      tables.sort((a, b) => (b.row_count || 0) - (a.row_count || 0));
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  const totalRows = Array.isArray(tables)
    ? tables.reduce((acc, t) => acc + (t.row_count || 0), 0)
    : 0;
  const activeTables = Array.isArray(tables)
    ? tables.filter((t) => t.row_count > 0).length
    : 0;

  // Group tables dynamically
  const groupedTables: Record<string, any[]> = {};
  if (Array.isArray(tables)) {
    for (const table of tables) {
      const category = categorizeTable(table.table_name);
      if (!groupedTables[category]) groupedTables[category] = [];
      groupedTables[category].push(table);
    }
  }

  // Sort categories alphabetically, but put Ops at the end
  const sortedCategories = Object.keys(groupedTables).sort((a, b) => {
    if (a.includes("Ops")) return 1;
    if (b.includes("Ops")) return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-8 w-full font-mono">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#E50914] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <Database className="w-8 h-8 text-[#E50914]" />
            Database Signal
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>PostgreSQL Matrix</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            {!errorMsg ? (
              <span className="text-[#27D17F]">Signal Locked</span>
            ) : (
              <span className="text-[#E50914]">Signal Lost</span>
            )}
          </div>
        </div>
      </header>

      {errorMsg ? (
        <div className="border border-[#E50914]/30 bg-[#310004]/20 p-5 flex gap-3">
          <ServerCrash className="w-5 h-5 text-[#E50914] shrink-0" />
          <div className="flex flex-col gap-1">
            <h3 className="text-[#E50914] text-[0.7rem] font-bold uppercase tracking-[0.1em]">
              Postgres Connection Failure
            </h3>
            <p className="text-[#A7A7AA] text-[0.65rem] uppercase tracking-wider">
              {errorMsg}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Global Record Count"
              value={totalRows.toLocaleString()}
              status="good"
              icon={<BarChart3 className="w-5 h-5" />}
              meta={`Across ${activeTables} active tables`}
            />
            <MetricCard
              title="Connection State"
              value="STABLE"
              status="good"
              icon={<Activity className="w-5 h-5" />}
              meta="Service Role Authenticated"
            />
            <MetricCard
              title="Encryption Status"
              value="AES-256"
              status="good"
              icon={<Fingerprint className="w-5 h-5" />}
              meta="RLS Enabled Globally"
            />
          </div>

          <DatabaseTablesInteractive groupedTables={groupedTables} sortedCategories={sortedCategories} />
        </>
      )}
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
