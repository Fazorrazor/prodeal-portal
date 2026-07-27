import { verifyOpsSession } from "@/lib/ops/auth";
import { redirect } from "next/navigation";
import { getVercelDeployments, Deployment } from "./actions";
import {
  Radio,
  ServerCrash,
  CheckCircle2,
  Clock,
  GitCommit,
  GitBranch,
  User,
  AlertTriangle,
} from "lucide-react";
import { RollbackButton } from "./RollbackButton";

export default async function DeploymentsPage() {
  const session = await verifyOpsSession();
  if (!session) redirect("/ops/login");

  const { configured, deployments, error } = await getVercelDeployments();

  return (
    <div className="flex flex-col gap-8 w-full font-mono">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#E50914] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <Radio className="w-8 h-8 text-[#E50914]" />
            Deployment History
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>Vercel Integration</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            {configured ? (
              <span className="text-[#27D17F]">API Connected</span>
            ) : (
              <span className="text-[#FFB020]">Simulation Mode</span>
            )}
          </div>
        </div>
      </header>

      {!configured && (
        <div className="border border-[#FFB020]/20 bg-[#FFB020]/5 p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FFB020] shrink-0" />
          <div className="flex flex-col gap-1">
            <h3 className="text-[#FFB020] text-[0.7rem] font-bold uppercase tracking-[0.1em]">
              Vercel API Not Configured
            </h3>
            <p className="text-[#A7A7AA] text-[0.65rem] uppercase tracking-wider leading-relaxed max-w-2xl">
              Missing DEPLOYMENT_PROVIDER_TOKEN and VERCEL_PROJECT_ID in
              environment variables. Currently displaying mocked deployment
              telemetry. Add these tokens to view live infrastructure data.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-[#E50914]/30 bg-[#310004]/20 p-5 flex gap-3">
          <ServerCrash className="w-5 h-5 text-[#E50914] shrink-0" />
          <div className="flex flex-col gap-1">
            <h3 className="text-[#E50914] text-[0.7rem] font-bold uppercase tracking-[0.1em]">
              API Fetch Error
            </h3>
            <p className="text-[#A7A7AA] text-[0.65rem] uppercase tracking-wider">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {deployments.map((deployment, index) => (
          <DeploymentRow
            key={deployment.uid}
            deployment={deployment}
            isLatest={index === 0}
          />
        ))}

        {deployments.length === 0 && !error && (
          <div className="text-center py-12 border border-[#141416] bg-[#090909] text-[#68686F] text-[0.7rem] uppercase tracking-[0.1em]">
            No deployments found for this project.
          </div>
        )}
      </div>
    </div>
  );
}

function DeploymentRow({
  deployment,
  isLatest,
}: {
  deployment: Deployment;
  isLatest: boolean;
}) {
  const isReady = deployment.state === "READY";
  const isError = deployment.state === "ERROR";

  const stateColors = {
    READY: "text-[#27D17F]",
    ERROR: "text-[#E50914]",
    INITIALIZING: "text-[#FFB020]",
    BUILDING: "text-[#4CA6FF]",
    CANCELED: "text-[#68686F]",
  };

  const stateColor =
    stateColors[deployment.state as keyof typeof stateColors] ||
    "text-[#A7A7AA]";

  // Format date natively
  const date = new Date(deployment.created);
  const formattedDate = date
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .toUpperCase();

  const isProd =
    deployment.meta?.githubCommitRef === "main" ||
    deployment.meta?.githubCommitRef === "master";

  return (
    <div
      className={`border ${isLatest ? "border-[#E50914]/40 bg-[#0D0D0F]" : "border-[#141416] bg-[#090909]"} p-5 relative overflow-hidden group hover:border-[#141416] hover:bg-[#111113] transition-colors`}
    >
      {isLatest && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.1)_0%,transparent_70%)] pointer-events-none" />
      )}

      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        {/* Left block: Status & Environment */}
        <div className="flex items-center gap-6 lg:w-1/4">
          <div className="flex flex-col gap-1">
            <div
              className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${stateColor}`}
            >
              {isReady ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isError ? (
                <ServerCrash className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {deployment.state}
            </div>
            <div className="text-[0.55rem] text-[#68686F] tracking-[0.1em] uppercase">
              {formattedDate}
            </div>
          </div>

          <div
            className={`px-2 py-1 text-[0.55rem] font-bold tracking-[0.2em] uppercase border ${
              isProd
                ? "bg-[#310004] border-[#E50914]/50 text-[#E50914]"
                : "bg-[#0A2E1F] border-[#27D17F]/50 text-[#27D17F]"
            }`}
          >
            {isProd ? "Production" : "Preview"}
          </div>
        </div>

        {/* Middle block: Git Info */}
        <div className="flex-1 flex flex-col gap-2 border-l border-r border-[#141416] px-6">
          <div className="text-[#F5F5F5] text-[0.75rem] font-bold tracking-wider truncate">
            {deployment.meta?.githubCommitMessage || "Manual Deployment"}
          </div>
          <div className="flex items-center gap-4 text-[#A7A7AA] text-[0.6rem] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3 h-3 text-[#68686F]" />
              {deployment.meta?.githubCommitRef || "unknown"}
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#68686F]" />
              {deployment.creator?.username ||
                deployment.meta?.githubCommitAuthorName ||
                "system"}
            </div>
          </div>
        </div>

        {/* Right block: Actions */}
        <div className="lg:w-1/4 flex justify-end">
          {!isLatest && isReady && isProd && (
            <RollbackButton deploymentId={deployment.uid} />
          )}
          {isLatest && (
            <div className="text-[0.6rem] text-[#E50914] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#E50914] animate-pulse" />
              Current Active Release
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
