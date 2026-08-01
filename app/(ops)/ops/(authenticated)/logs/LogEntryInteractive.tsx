/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Terminal,
  BrainCircuit,
  X,
  Activity,
  ServerCrash,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

export function LogEntryInteractive({ log }: { log: any }) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const colors = {
    info: "text-[#4CA6FF]",
    warn: "text-[#FFB020]",
    error: "text-[#E50914]",
    security: "text-[#FF1F2D]",
    audit: "text-[#27D17F]",
  };

  const color = colors[log.level as keyof typeof colors] || "text-[#F5F5F5]";
  const formattedDate = new Date(log.created_at)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  const modalContent = expanded ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]">
      <div className="w-full h-full flex flex-col relative overflow-hidden font-mono">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#E50914] via-transparent to-transparent opacity-50" />

        <header className="p-6 border-b border-[#141416] flex justify-between items-center bg-[#070708] shrink-0">
          <div className="flex items-center gap-4">
            <Terminal className={`w-6 h-6 ${color}`} />
            <h2 className="text-[1rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5]">
              Telemetry Inspector
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[0.65rem] text-[#68686F] tracking-[0.2em] uppercase hidden md:block">
              Press ESC to Exit
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-[#68686F] hover:text-[#E50914] transition-colors p-2 border border-transparent hover:border-[#E50914]/30 hover:bg-[#E50914]/10 rounded-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col gap-12 max-w-7xl mx-auto w-full">
          {/* Event Header */}
          <div className="flex justify-between items-start">
            <div>
              <div
                className={`text-[0.8rem] font-bold uppercase tracking-[0.3em] mb-4 ${color}`}
              >
                {log.level} EVENT
              </div>
              <div className="text-3xl font-bold tracking-wider text-[#F5F5F5]">
                {log.message}
              </div>
            </div>
            <div className="text-right text-[#68686F] text-[0.75rem] font-mono tracking-widest uppercase flex flex-col gap-1">
              <div>{formattedDate}</div>
              <div className="text-[#A7A7AA]">ID: {log.id.split("-")[0]}</div>
            </div>
          </div>

          {/* AI Diagnostic Panel */}
          <div className="border border-[#141416] bg-[#090909] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(76,166,255,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="p-5 border-b border-[#141416] bg-[#0D0D0F] flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-[#4CA6FF]" />
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#4CA6FF]">
                Pro Deal AI Diagnostic
              </span>
            </div>

            <div className="p-6 md:p-8 text-[0.85rem] text-[#A7A7AA] leading-relaxed font-sans tracking-wide">
              <AIAnalysis log={log} />
            </div>
          </div>

          {/* Raw Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-[#141416] p-6 bg-[#090909]">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#68686F] mb-4">
                Metadata Payload
              </div>
              <pre className="text-[0.75rem] text-[#A7A7AA] overflow-x-auto">
                {log.metadata
                  ? JSON.stringify(log.metadata, null, 2)
                  : "No metadata attached."}
              </pre>
            </div>

            <div className="border border-[#141416] p-6 bg-[#090909]">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#E50914] mb-4">
                Error Trace
              </div>
              <pre className="text-[0.75rem] text-[#A7A7AA] overflow-x-auto text-wrap break-all">
                {log.error
                  ? JSON.stringify(log.error, null, 2)
                  : "No error trace captured."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(76,166,255,0.1)' }}
        animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
        transition={{ duration: 0.3 }}
        onClick={() => setExpanded(true)}
        className="flex flex-col gap-1 border-l-2 border-transparent hover:border-[#141416] hover:bg-[#141416]/50 pl-3 -ml-3 py-1 transition-colors group cursor-pointer"
      >
        <div className="flex gap-4 items-start">
          <span className="text-[#68686F] shrink-0">{formattedDate}</span>
          <span className={`${color} shrink-0 w-24 font-bold uppercase`}>
            [{log.level}]
          </span>
          <span className="text-[#A7A7AA] flex-1 break-words group-hover:text-[#F5F5F5] transition-colors">
            {log.message}
            {log.metadata?.target && (
              <span className="ml-2 text-[#68686F] border border-[#141416] px-1 bg-[#050505]">
                {log.metadata.target}
              </span>
            )}
          </span>
        </div>
      </motion.div>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}

// Generates contextual, deterministic AI insights based on the log type
function AIAnalysis({ log }: { log: any }) {
  if (log.level === "security") {
    return (
      <div className="flex flex-col gap-4">
        <p>
          <strong className="text-[#F5F5F5]">Overview:</strong> The system
          detected a potential security boundary event.
          {log.message.includes("Rejected")
            ? " A biometric signature verification failed, likely due to an unrecognized hardware key or expired challenge payload."
            : " Security protocols were engaged to protect sensitive endpoints."}
        </p>
        <div className="flex items-start gap-3 mt-4 bg-[#141416] p-4 border-l-2 border-[#FF1F2D]">
          <ShieldAlert className="w-5 h-5 text-[#FF1F2D] shrink-0 mt-0.5" />
          <p className="text-[0.8rem]">
            <strong>Recommendation:</strong> If this was an automated probe, no
            action is required. If this was a legitimate admin, ensure the
            correct YubiKey or TouchID profile is being used. Monitor for
            repeated failures from this IP.
          </p>
        </div>
      </div>
    );
  }

  if (log.level === "audit") {
    return (
      <div className="flex flex-col gap-4">
        <p>
          <strong className="text-[#F5F5F5]">Overview:</strong> Standard
          operational audit record. The operator successfully bypassed the
          security gateway and executed an authorized action.
        </p>
        <p>
          The encrypted session token was securely negotiated and access was
          granted via the <code>{log.metadata?.method || "standard"}</code>{" "}
          channel.
        </p>
        <div className="flex items-start gap-3 mt-4 bg-[#141416] p-4 border-l-2 border-[#27D17F]">
          <Activity className="w-5 h-5 text-[#27D17F] shrink-0 mt-0.5" />
          <p className="text-[0.8rem]">
            <strong>Recommendation:</strong> Nominal behavior. This record is
            immutable and serves as proof of authorization for compliance
            standards.
          </p>
        </div>
      </div>
    );
  }

  if (log.level === "error") {
    return (
      <div className="flex flex-col gap-4">
        <p>
          <strong className="text-[#F5F5F5]">Overview:</strong> An unhandled
          exception bypassed standard application boundaries and reached the
          global error boundary.
        </p>
        <p>
          Analysis of the trace suggests a failure in the{" "}
          <code>{log.service || "unknown"}</code> microservice.
        </p>
        <div className="flex items-start gap-3 mt-4 bg-[#141416] p-4 border-l-2 border-[#E50914]">
          <ServerCrash className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
          <p className="text-[0.8rem]">
            <strong>Recommendation:</strong> Escalate immediately if this event
            frequency spikes. Check database connection health and Vercel edge
            function execution timeouts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p>
        <strong className="text-[#F5F5F5]">Overview:</strong> Standard system
        telemetry logged for observational context. No anomalies detected in
        this payload. The system is operating within expected parameters.
      </p>
    </div>
  );
}
