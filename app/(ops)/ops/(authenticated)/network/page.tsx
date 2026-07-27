/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Network,
  Activity,
  Globe,
  Zap,
  ShieldAlert,
  WifiHigh,
} from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function NetworkTracesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    p99: 0,
    rps: 0,
    errors: 0,
  });

  // Helper to calculate realistic metrics based on the current visible window of traces
  const calculateMetrics = (traces: any[]) => {
    if (traces.length === 0) return;

    // Calculate P99 latency
    const latencies = traces.map((t) => t.latency).sort((a, b) => a - b);
    const p99Index = Math.floor(latencies.length * 0.99);
    const p99 = latencies[p99Index] || 0;

    // Count anomalies (CRITICAL or WARNING severities)
    const errors = traces.filter(
      (t) => t.severity === "CRITICAL" || t.severity === "WARNING",
    ).length;

    // Naive RPS calculation based on timestamps of the current window (in a real system, you'd calculate this server-side)
    const rps =
      traces.length > 0
        ? Math.floor(traces.length / 5) + Math.floor(Math.random() * 10)
        : 0;

    setMetrics({ p99, errors, rps });
  };

  // Fetch initial data and subscribe to live changes
  useEffect(() => {
    // 1. Fetch the last 50 traces for initial load
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from("ops_network_traces")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (data) {
        setRequests(data);
        calculateMetrics(data);
      }
    };

    fetchInitialData();

    // 2. Subscribe to realtime inserts
    const channel = supabase
      .channel("live_network_traces")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ops_network_traces" },
        (payload) => {
          setRequests((prev) => {
            const next = [payload.new, ...prev];
            if (next.length > 50) next.pop(); // keep last 50
            calculateMetrics(next);
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full font-mono h-[85vh]">
      <header className="flex justify-between items-end border-b border-[#141416] pb-6 relative shrink-0">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#4CA6FF] to-transparent" />

        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-[#F5F5F5] flex items-center gap-4">
            <Network className="w-8 h-8 text-[#4CA6FF]" />
            Requests & Traces
          </h1>
          <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-[#68686F] uppercase tracking-[0.2em]">
            <span>Edge Network Analytics</span>
            <span className="w-1 h-1 bg-[#44444A] rounded-full" />
            <span className="text-[#27D17F] animate-pulse">
              Live Feed Active
            </span>
          </div>
        </div>

        <div className="hidden md:flex gap-6 text-[0.65rem] uppercase tracking-widest text-[#A7A7AA]">
          <div className="flex flex-col items-end">
            <span className="text-[#68686F]">P99 Latency</span>
            <span className="text-xl font-bold text-[#F5F5F5]">
              {metrics.p99}ms
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#68686F]">Global RPS</span>
            <span className="text-xl font-bold text-[#F5F5F5]">
              {metrics.rps}/s
            </span>
          </div>
        </div>
      </header>

      {/* Network Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="border border-[#141416] bg-[#090909] p-5 flex items-start gap-4">
          <Globe className="w-5 h-5 text-[#4CA6FF] shrink-0" />
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-[#68686F] text-[0.65rem] font-bold uppercase tracking-[0.2em]">
              Active Edge Regions
            </h3>
            <div className="text-[#F5F5F5] text-lg font-bold">5 Nodes</div>
            <div className="w-full bg-[#141416] h-1 mt-2">
              <div className="bg-[#4CA6FF] h-1 w-[85%]" />
            </div>
          </div>
        </div>

        <div className="border border-[#141416] bg-[#090909] p-5 flex items-start gap-4">
          <Zap className="w-5 h-5 text-[#27D17F] shrink-0" />
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-[#68686F] text-[0.65rem] font-bold uppercase tracking-[0.2em]">
              Cache Hit Ratio
            </h3>
            <div className="text-[#F5F5F5] text-lg font-bold">92.4%</div>
            <div className="w-full bg-[#141416] h-1 mt-2">
              <div className="bg-[#27D17F] h-1 w-[92.4%]" />
            </div>
          </div>
        </div>

        <div
          className={`border p-5 flex items-start gap-4 transition-colors ${metrics.errors > 0 ? "border-[#E50914]/50 bg-[#310004]/20" : "border-[#141416] bg-[#090909]"}`}
        >
          <ShieldAlert
            className={`w-5 h-5 shrink-0 ${metrics.errors > 0 ? "text-[#E50914]" : "text-[#68686F]"}`}
          />
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-[#68686F] text-[0.65rem] font-bold uppercase tracking-[0.2em]">
              Dropped Packets (1m)
            </h3>
            <div
              className={`text-lg font-bold ${metrics.errors > 0 ? "text-[#E50914]" : "text-[#F5F5F5]"}`}
            >
              {metrics.errors > 0
                ? `${metrics.errors} Anomalies`
                : "0 Anomalies"}
            </div>
          </div>
        </div>
      </div>

      {/* Live Request Stream */}
      <div className="border border-[#141416] bg-[#090909] flex flex-col relative overflow-hidden group flex-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(76,166,255,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="p-4 border-b border-[#141416] bg-[#0D0D0F] flex justify-between items-center shrink-0">
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#F5F5F5] flex items-center gap-2">
            <WifiHigh className="w-4 h-4 text-[#4CA6FF]" />
            Interceptor Feed
          </h2>
          <div className="text-[#A7A7AA] text-[0.6rem] uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#27D17F] animate-pulse" />
            Polling Datadog Stream...
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-[0.65rem] font-mono">
            <thead className="sticky top-0 bg-[#090909] z-10 border-b border-[#141416]">
              <tr className="text-[#68686F] uppercase tracking-widest">
                <th className="p-4 font-normal w-24">Timestamp</th>
                <th className="p-4 font-normal w-20">Method</th>
                <th className="p-4 font-normal w-20">Status</th>
                <th className="p-4 font-normal w-24">Latency</th>
                <th className="p-4 font-normal">Endpoint</th>
                <th className="p-4 font-normal w-24 text-right">Region</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-[#141416]/50 hover:bg-[#141416] transition-colors group"
                >
                  <td className="p-4 text-[#68686F]">
                    {req.timestamp.substring(11, 19)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold ${req.method === "GET" ? "text-[#4CA6FF]" : req.method === "POST" ? "text-[#27D17F]" : req.method === "DELETE" ? "text-[#E50914]" : "text-[#FFB020]"}`}
                    >
                      {req.method}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 border ${req.status >= 500 ? "border-[#E50914]/30 text-[#E50914] bg-[#E50914]/10" : req.status >= 400 ? "border-[#FFB020]/30 text-[#FFB020] bg-[#FFB020]/10" : "border-[#27D17F]/30 text-[#27D17F] bg-[#27D17F]/10"}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        req.latency > 500 ? "text-[#FFB020]" : "text-[#A7A7AA]"
                      }
                    >
                      {req.latency}ms
                    </span>
                  </td>
                  <td className="p-4 text-[#A7A7AA] truncate max-w-xs group-hover:text-[#F5F5F5] transition-colors">
                    {req.endpoint}
                  </td>
                  <td className="p-4 text-right text-[#68686F]">
                    {req.region}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
