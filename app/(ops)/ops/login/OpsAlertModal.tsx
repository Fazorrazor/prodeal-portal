"use client";

import { useEffect } from "react";
import { ShieldAlert, X, CheckCircle2 } from "lucide-react";

export function OpsAlertModal({
  title,
  description,
  code,
  type = "warning",
  onClose,
}: {
  title: string;
  description: React.ReactNode;
  code: string;
  type?: "warning" | "success";
  onClose: () => void;
}) {
  const color = type === "warning" ? "#FFB020" : "#27D17F";
  const Icon = type === "warning" ? ShieldAlert : CheckCircle2;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300 font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      <div
        className="w-full max-w-[600px] border bg-[#0D0D0F] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden group animate-in zoom-in-95 duration-300"
        style={{ borderColor: `${color}40`, boxShadow: `0 0 30px ${color}10` }}
      >
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: color }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#44444A] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-5">
          <Icon className="w-7 h-7 mt-1 shrink-0" style={{ color }} />
          <div className="flex-1 min-w-0">
            <h3
              className="text-[0.9rem] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color }}
            >
              {title}
            </h3>
            <div className="text-[0.7rem] text-[#A7A7AA] leading-relaxed mb-6">
              {description}
            </div>
            <div
              className="bg-[#050505] p-5 border font-mono text-[0.7rem] text-[#F5F5F5] break-all max-h-48 overflow-y-auto selection:bg-[#E50914] selection:text-white"
              style={{ borderColor: `${color}20` }}
            >
              {code}
            </div>

            <p className="text-[0.55rem] text-[#44444A] uppercase tracking-[0.2em] mt-8 text-center">
              [ Press ESC to acknowledge and dismiss ]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
