"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  X,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Incident = {
  id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
  description: string;
};

export default function IncidentsPage() {
  const [isDeclaring, setIsDeclaring] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("CRITICAL");
  const [newStatus, setNewStatus] = useState("investigating");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data } = await supabase
        .from("ops_incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setIncidents(data as Incident[]);
      }
    };

    fetchIncidents();

    const channel = supabase
      .channel("live_incidents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ops_incidents" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setIncidents((prev) => [payload.new as Incident, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.id === payload.new.id ? (payload.new as Incident) : inc,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeclareIncident = async () => {
    if (!newTitle) return;

    await supabase.from("ops_incidents").insert([
      {
        title: newTitle,
        severity: newSeverity,
        status: newStatus,
        description: newDescription,
      },
    ]);

    setIsDeclaring(false);
    setNewTitle("");
    setNewDescription("");
  };

  const activeCount = incidents.filter((i) => i.status !== "resolved").length;

  const getUILabelForSeverity = (sev: string) => {
    if (sev === "CRITICAL") return "sev-1";
    if (sev === "WARNING") return "sev-2";
    return "sev-3";
  };

  return (
    <div className="flex flex-col gap-8 w-full font-mono">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative shrink-0">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#FFB020] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-[#FFB020]" />
            Incident Command
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>System Status & Response</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            {activeCount === 0 ? (
              <span className="text-[#27D17F]">All Systems Operational</span>
            ) : (
              <span className="text-[#FFB020] animate-pulse">
                Active Incidents ({activeCount})
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsDeclaring(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2 border border-[#E50914]/30 bg-[#E50914]/10 text-[#E50914] text-[0.65rem] uppercase tracking-widest font-bold hover:bg-[#E50914] hover:text-white transition-colors"
        >
          <Flame className="w-4 h-4" />
          Declare Incident
        </button>
      </header>

      {/* Global Status Banner */}
      <div
        className={`p-6 border shrink-0 flex items-center gap-4 ${activeCount === 0 ? "bg-[#0A2E1F] border-[#27D17F]/30" : "bg-[#310004]/50 border-[#FFB020]/30"}`}
      >
        {activeCount === 0 ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-[#27D17F]" />
            <div>
              <h2 className="text-[#27D17F] font-bold text-lg uppercase tracking-widest">
                All Systems Operational
              </h2>
              <p className="text-[#27D17F]/70 text-[0.7rem] uppercase tracking-wider mt-1">
                No active downtime or degraded performance reported across
                infrastructure nodes.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-8 h-8 text-[#FFB020]" />
            <div>
              <h2 className="text-[#FFB020] font-bold text-lg uppercase tracking-widest">
                System Degraded
              </h2>
              <p className="text-[#FFB020]/70 text-[0.7rem] uppercase tracking-wider mt-1">
                There are currently {activeCount} active incidents requiring
                engineering attention.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Incidents Feed */}
      <div className="flex flex-col gap-6 pb-12">
        <AnimatePresence>
        {incidents.map((incident) => {
          const uiSeverity = getUILabelForSeverity(incident.severity);
          return (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`border border-[#141416] bg-[#090909] relative overflow-hidden shrink-0 ${incident.status === "resolved" ? "opacity-60 grayscale" : ""}`}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#141416] bg-[#0D0D0F] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest border ${
                      uiSeverity === "sev-1"
                        ? "border-[#E50914] text-[#E50914] bg-[#E50914]/10"
                        : uiSeverity === "sev-2"
                          ? "border-[#FFB020] text-[#FFB020] bg-[#FFB020]/10"
                          : "border-[#4CA6FF] text-[#4CA6FF] bg-[#4CA6FF]/10"
                    }`}
                  >
                    {uiSeverity}
                  </span>
                  <h3 className="text-[#F5F5F5] font-bold tracking-wide">
                    {incident.title}
                  </h3>
                </div>
                <div className="flex gap-4 items-center">
                  <span
                    className={`text-[0.65rem] uppercase tracking-widest font-bold ${
                      incident.status === "resolved"
                        ? "text-[#27D17F]"
                        : "text-[#FFB020]"
                    }`}
                  >
                    {incident.status}
                  </span>
                  <span className="text-[#68686F] text-[0.65rem] tracking-widest truncate max-w-[100px]">
                    {incident.id.split("-")[0]}...
                  </span>
                </div>
              </div>

              {/* Updates Timeline */}
              <div className="p-6">
                <div className="flex flex-col gap-6 border-l border-[#141416] ml-2">
                  <div className="relative pl-6">
                    {/* Timeline Node */}
                    <div className="absolute -left-[5px] top-1 w-[9px] h-[9px] bg-[#050505] border-2 border-[#44444A] rounded-full" />

                    <div className="text-[0.65rem] text-[#68686F] mb-1 font-bold tracking-widest">
                      {new Date(incident.created_at)
                        .toISOString()
                        .replace("T", " ")
                        .substring(0, 19)}
                    </div>
                    <div className="text-[#A7A7AA] text-[0.75rem] font-sans tracking-wide">
                      {incident.description ||
                        "Issue declared. Awaiting further updates."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
        {incidents.length === 0 && (
          <div className="text-[#68686F] text-[0.7rem] uppercase tracking-widest text-center py-10">
            NO INCIDENT HISTORY
          </div>
        )}
      </div>

      {/* Declare Incident Modal */}
      {isDeclaring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl border border-[#E50914]/50 bg-[#050505] shadow-2xl relative">
            <header className="p-4 border-b border-[#E50914]/20 flex justify-between items-center bg-[#310004]/20">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-[#E50914]" />
                <h2 className="text-[#E50914] font-bold uppercase tracking-[0.2em] text-sm">
                  Declare New Incident
                </h2>
              </div>
              <button
                onClick={() => setIsDeclaring(false)}
                className="text-[#68686F] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-[#A7A7AA] text-[0.75rem] uppercase tracking-wider mb-4">
                Declaring an incident will alert on-call engineers and update
                the global status page.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-[0.65rem] text-[#68686F] font-bold uppercase tracking-widest">
                  Incident Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#090909] border border-[#141416] p-3 text-sm text-[#F5F5F5] outline-none focus:border-[#E50914]/50 transition-colors"
                  placeholder="e.g. Database Connectivity Loss"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.65rem] text-[#68686F] font-bold uppercase tracking-widest">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="bg-[#090909] border border-[#141416] p-3 text-sm text-[#F5F5F5] outline-none focus:border-[#E50914]/50 appearance-none cursor-pointer"
                  >
                    <option value="CRITICAL">SEV-1 (Critical Outage)</option>
                    <option value="WARNING">SEV-2 (Partial Outage)</option>
                    <option value="INFO">SEV-3 (Degraded Performance)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.65rem] text-[#68686F] font-bold uppercase tracking-widest">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="bg-[#090909] border border-[#141416] p-3 text-sm text-[#F5F5F5] outline-none focus:border-[#E50914]/50 appearance-none cursor-pointer"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="active">Identified</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[0.65rem] text-[#68686F] font-bold uppercase tracking-widest">
                  Initial Update Message
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-[#090909] border border-[#141416] p-3 text-sm text-[#F5F5F5] outline-none focus:border-[#E50914]/50 transition-colors resize-none"
                  placeholder="Describe the current situation..."
                />
              </div>
            </div>

            <footer className="p-4 border-t border-[#141416] flex justify-end gap-4 bg-[#090909]">
              <button
                onClick={() => setIsDeclaring(false)}
                className="px-4 py-2 text-[0.65rem] uppercase tracking-widest text-[#68686F] hover:text-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareIncident}
                className="px-6 py-2 bg-[#E50914] text-white text-[0.65rem] uppercase tracking-widest font-bold hover:bg-[#FF1F2D] transition-colors"
              >
                Trigger Incident
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
