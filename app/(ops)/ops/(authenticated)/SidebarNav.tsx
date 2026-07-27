"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ShieldAlert,
  ServerCrash,
  Network,
  Database,
  Radio,
  Settings,
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 z-10">
      <NavItem
        href="/ops"
        icon={<Activity className="w-4 h-4" />}
        label="Overview"
        active={pathname === "/ops"}
      />
      <NavItem
        href="/ops/incidents"
        icon={<ShieldAlert className="w-4 h-4" />}
        label="Incidents"
        active={pathname.startsWith("/ops/incidents")}
      />
      <NavItem
        href="/ops/logs"
        icon={<ServerCrash className="w-4 h-4" />}
        label="Telemetry & Errors"
        active={pathname.startsWith("/ops/logs")}
      />
      <NavItem
        href="/ops/network"
        icon={<Network className="w-4 h-4" />}
        label="Requests & Traces"
        active={pathname.startsWith("/ops/network")}
      />
      <NavItem
        href="/ops/database"
        icon={<Database className="w-4 h-4" />}
        label="Database Signal"
        active={pathname.startsWith("/ops/database")}
      />

      <div className="mt-8 mb-2 px-3 text-[0.55rem] text-[#68686F] font-bold uppercase tracking-[0.2em]">
        System Administration
      </div>
      <NavItem
        href="/ops/deployments"
        icon={<Radio className="w-4 h-4" />}
        label="Deployments"
        active={pathname.startsWith("/ops/deployments")}
      />
      <NavItem
        href="/ops/settings"
        icon={<Settings className="w-4 h-4" />}
        label="Configuration"
        active={pathname.startsWith("/ops/settings")}
      />
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 text-[0.7rem] uppercase tracking-[0.15em] transition-all group relative overflow-hidden ${active ? "text-[#F5F5F5] bg-[#141416]" : "text-[#A7A7AA] hover:bg-[#141416] hover:text-[#F5F5F5]"}`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E50914]" />
      )}
      <span
        className={`${active ? "text-[#E50914]" : "text-[#68686F] group-hover:text-[#E50914]"} transition-colors`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
