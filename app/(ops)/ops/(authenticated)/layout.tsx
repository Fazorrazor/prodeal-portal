import { verifyOpsSession } from "@/lib/ops/auth";
import { redirect } from "next/navigation";
import { logoutOps } from "../actions";
import { Terminal, LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export default async function AuthenticatedOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyOpsSession();
  if (!session) redirect("/ops/login");

  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-[#F5F5F5] font-mono selection:bg-[#E50914] selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#070708] border-r border-[#E50914]/20 relative">
        {/* Grain overlay for sidebar */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="p-6 border-b border-[#141416] relative">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#E50914]" />
            <span className="font-bold tracking-widest uppercase text-sm">
              OPS_GATEWAY
            </span>
          </div>
          <div
            className={`mt-4 px-2 py-1 text-[0.6rem] font-bold tracking-[0.2em] uppercase border flex items-center gap-2 ${isProd ? "bg-[#310004] border-[#E50914]/50 text-[#E50914]" : "bg-[#0A2E1F] border-[#27D17F]/50 text-[#27D17F]"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isProd ? "bg-[#E50914]" : "bg-[#27D17F]"} animate-pulse`}
            />
            {isProd ? "PROD" : "DEV"} ACTIVE
          </div>
        </div>

        <SidebarNav />

        <div className="p-4 border-t border-[#141416] relative z-10">
          <form action={logoutOps}>
            <button className="w-full flex items-center justify-between px-3 py-3 text-[0.65rem] tracking-[0.1em] uppercase text-[#A7A7AA] hover:text-[#E50914] hover:bg-[#E50914]/10 transition-colors border border-transparent hover:border-[#E50914]/30">
              <span>Secure Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
