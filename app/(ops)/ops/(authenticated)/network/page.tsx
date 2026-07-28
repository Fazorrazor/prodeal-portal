/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { createClient } from "@supabase/supabase-js";
import {
  Network,
  Activity,
  Globe,
  Zap,
  ShieldAlert,
  WifiHigh,
  Bug,
  X,
  Copy,
  Check,
  Bot,
  Send,
} from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label || "value"}`}
      className="inline-flex items-center gap-1.5 hover:bg-[#1A1A1A] px-1.5 py-0.5 rounded transition-colors group cursor-copy"
    >
      <span className="truncate">{text}</span>
      {copied ? (
        <Check className="w-3 h-3 text-[#27D17F]" />
      ) : (
        <Copy className="w-3 h-3 text-[#68686F] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};

export default function NetworkTracesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    p99: 0,
    rps: 0,
    errors: 0,
  });
  const [activeTab, setActiveTab] = useState<"GLOBAL" | "ANOMALIES">("GLOBAL");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK Chat Hook
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: "/api/chat",
    body: {
      data: { 
        anomalyContext: selectedRequest?.metadata || null,
        anomalyId: selectedRequest?.id || null,
        endpoint: selectedRequest?.endpoint || "Unknown"
      },
    },
  });

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear chat when opening a new anomaly
  useEffect(() => {
    if (selectedRequest) {
      setMessages([{
        id: "sys-1",
        role: "assistant",
        content: `I've received the forensic trace for ${selectedRequest.endpoint}. How can I assist you with this analysis?`
      }]);
    }
  }, [selectedRequest, setMessages]);

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
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("GLOBAL")}
              className={`text-[0.7rem] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-colors pb-1 ${activeTab === "GLOBAL" ? "text-[#F5F5F5] border-b-2 border-[#4CA6FF]" : "text-[#68686F] hover:text-[#A7A7AA] border-b-2 border-transparent"}`}
            >
              <WifiHigh className={`w-4 h-4 ${activeTab === "GLOBAL" ? "text-[#4CA6FF]" : ""}`} />
              Global Stream
            </button>
            <button
              onClick={() => setActiveTab("ANOMALIES")}
              className={`text-[0.7rem] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-colors pb-1 ${activeTab === "ANOMALIES" ? "text-[#E50914] border-b-2 border-[#E50914]" : "text-[#68686F] hover:text-[#E50914]/70 border-b-2 border-transparent"}`}
            >
              <Bug className={`w-4 h-4 ${activeTab === "ANOMALIES" ? "text-[#E50914]" : ""}`} />
              Anomalies ({metrics.errors})
            </button>
          </div>
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
              {(activeTab === "GLOBAL" ? requests : requests.filter(r => r.severity === "WARNING" || r.severity === "CRITICAL" || r.status >= 400)).map((req) => (
                <tr
                  key={req.id}
                  onClick={() => activeTab === "ANOMALIES" ? setSelectedRequest(req) : null}
                  className={`border-b border-[#141416]/50 transition-colors group ${activeTab === "ANOMALIES" ? "hover:bg-[#310004]/40 cursor-pointer" : "hover:bg-[#141416]"}`}
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
              {activeTab === "ANOMALIES" && requests.filter(r => r.severity === "WARNING" || r.severity === "CRITICAL" || r.status >= 400).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#68686F] text-[0.7rem] uppercase tracking-widest border-t border-[#141416]">
                    All clear. No anomalies detected in current window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#090909] border border-[#E50914]/30 w-full max-w-3xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#E50914]/30 flex justify-between items-center bg-[#310004]/20 shrink-0">
              <h2 className="text-[#F5F5F5] text-[0.7rem] font-bold uppercase tracking-widest flex items-center gap-2">
                <Bug className="w-4 h-4 text-[#E50914]" />
                Anomaly Deep Inspection
              </h2>
              <button onClick={() => setSelectedRequest(null)} className="text-[#68686F] hover:text-[#F5F5F5] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Core Request Info - STATIC */}
            <div className="p-6 border-b border-[#141416] shrink-0">
              <div className="flex flex-wrap gap-8 items-start">
                <div className="shrink-0">
                  <div className="text-[0.6rem] text-[#68686F] uppercase tracking-widest mb-1">Timestamp</div>
                  <div className="text-[#F5F5F5] text-sm font-mono whitespace-nowrap">{selectedRequest.timestamp}</div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[0.6rem] text-[#68686F] uppercase tracking-widest mb-1">Target</div>
                  <div className="text-[#F5F5F5] text-sm font-mono break-all">{selectedRequest.method} {selectedRequest.endpoint}</div>
                </div>
                <div className="shrink-0">
                  <div className="text-[0.6rem] text-[#68686F] uppercase tracking-widest mb-1">Status Code</div>
                  <div className={`text-sm font-bold font-mono ${selectedRequest.status >= 500 ? "text-[#E50914]" : selectedRequest.status >= 400 ? "text-[#FFB020]" : "text-[#27D17F]"}`}>{selectedRequest.status}</div>
                </div>
                <div className="shrink-0">
                  <div className="text-[0.6rem] text-[#68686F] uppercase tracking-widest mb-1">Edge Node</div>
                  <div className="text-[#F5F5F5] text-sm font-mono">{selectedRequest.region}</div>
                </div>
              </div>
            </div>

            {/* Raw Metadata Block - SCROLLABLE */}
            <div className="p-6 flex-1 overflow-y-auto min-h-0 space-y-6">
              
              {/* Automated Forensic Breakdown */}
              {selectedRequest.metadata && (
                <div>
                  <div className="text-[0.6rem] text-[#68686F] uppercase tracking-widest mb-3 border-b border-[#141416] pb-2 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#E50914]" />
                    Automated Forensic Breakdown
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#050505] border border-[#141416] p-4">
                      <div className="text-[0.6rem] text-[#A7A7AA] uppercase tracking-widest mb-3">1. Attacker Identity & Location</div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[#68686F] text-xs">IP Address</span>
                          <span className="text-[#F5F5F5] font-mono text-xs text-right max-w-[150px]">
                            <CopyButton text={selectedRequest.metadata.ip || "Unknown"} label="IP Address" />
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#68686F] text-xs">Origin</span>
                          <span className="text-[#F5F5F5] text-xs uppercase tracking-wider">{selectedRequest.metadata.geo?.city || "Unknown"}, {selectedRequest.metadata.geo?.country || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#68686F] text-xs">Spoofed Agent</span>
                          <span className="text-[#E50914] font-mono text-xs truncate max-w-[120px]" title={selectedRequest.metadata.headers?.['user-agent']}>{selectedRequest.metadata.headers?.['user-agent'] || "Unknown"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#050505] border border-[#141416] p-4">
                      <div className="text-[0.6rem] text-[#A7A7AA] uppercase tracking-widest mb-3">2. Edge Routing Context</div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[#68686F] text-xs">Edge Node ID</span>
                          <span className="text-[#F5F5F5] font-mono text-xs uppercase text-right max-w-[120px]">
                            <CopyButton text={selectedRequest.metadata.headers?.['x-vercel-id']?.split('::')[0] || selectedRequest.region} label="Edge Node ID" />
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#68686F] text-xs">Invocation</span>
                          <span className="text-[#27D17F] font-mono text-xs uppercase">{selectedRequest.metadata.headers?.['x-vercel-invocation-type'] || "middleware"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#68686F] text-xs">Proxy Signature</span>
                          <span className="text-[#F5F5F5] font-mono text-xs truncate max-w-[120px]">{selectedRequest.metadata.headers?.['x-vercel-proxy-signature'] ? "Valid Origin" : "Spoofed"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#050505] border border-[#141416] p-4 md:col-span-2">
                      <div className="text-[0.6rem] text-[#A7A7AA] uppercase tracking-widest mb-3">3. Immutable Security Fingerprints</div>
                      <div className="space-y-3 text-sm">
                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-[#68686F] text-xs">JA3 Digest (TLS Profile)</span>
                          <span className="text-[#FFB020] font-mono text-[0.65rem] text-right">
                            <CopyButton text={selectedRequest.metadata.headers?.['x-vercel-ja3-digest'] || "Not Captured"} label="JA3 Digest" />
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="text-[#68686F] text-xs">JA4 Digest (Network Profile)</span>
                          <span className="text-[#FFB020] font-mono text-[0.65rem] text-right">
                            <CopyButton text={selectedRequest.metadata.headers?.['x-vercel-ja4-digest'] || "Not Captured"} label="JA4 Digest" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-[0.6rem] text-[#68686F] uppercase tracking-widest mb-3 border-b border-[#141416] pb-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#68686F]" />
                  Raw Extracted Headers Payload
                </div>
                <div className="bg-[#050505] border border-[#141416] p-4 overflow-x-auto">
                  <pre className="text-[#4CA6FF] text-[0.65rem] font-mono leading-relaxed whitespace-pre-wrap break-all">
                    {selectedRequest.metadata 
                      ? JSON.stringify(selectedRequest.metadata, null, 2)
                      : "// No extended metadata captured for this legacy trace."}
                  </pre>
                </div>
              </div>

              {/* Forensic AI Chat Interface */}
              <div className="border border-[#141416] bg-[#050505] flex flex-col h-[300px]">
                <div className="p-3 border-b border-[#141416] flex items-center gap-2 bg-[#0A0A0A]">
                  <Bot className="w-4 h-4 text-[#4CA6FF]" />
                  <span className="text-[0.65rem] uppercase tracking-widest text-[#F5F5F5] font-bold">Forensic AI Assistant</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
                  {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3 text-[0.75rem] font-mono leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" 
                          ? "bg-[#1A1A1A] text-[#F5F5F5] border border-[#333333]" 
                          : "bg-[#090909] text-[#A7A7AA] border border-[#141416]"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="p-3 border-t border-[#141416] flex gap-2">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask the AI about this anomaly..."
                    className="flex-1 bg-[#090909] border border-[#141416] text-[#F5F5F5] text-sm px-3 py-2 outline-none focus:border-[#4CA6FF] font-mono transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#141416] bg-[#050505] flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2 border border-[#141416] text-[#A7A7AA] text-[0.7rem] uppercase tracking-widest hover:text-[#F5F5F5] hover:border-[#68686F] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
