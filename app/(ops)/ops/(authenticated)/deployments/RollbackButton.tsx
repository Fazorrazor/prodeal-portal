"use client";

import { useTransition } from "react";
import { rollbackDeployment } from "./actions";
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RollbackButton({ deploymentId }: { deploymentId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRollback = () => {
    // In a real operations environment, you'd want a modal here to confirm the rollback
    // and perhaps require entering the Master Passcode or biometric auth again.
    // For this demonstration, we'll use a native confirm.
    if (
      !window.confirm(
        "WARNING: You are about to rollback production to a previous deployment state. This action is instantaneous and will affect live users. Proceed?",
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await rollbackDeployment(deploymentId);
        // Refresh the page to show new state
        router.refresh();
      } catch (err) {
        alert("Failed to initiate rollback. See console for details.");
      }
    });
  };

  return (
    <button
      onClick={handleRollback}
      disabled={isPending}
      className="bg-transparent border border-[#68686F]/30 text-[#A7A7AA] hover:border-[#E50914] hover:text-[#E50914] hover:bg-[#E50914]/10 px-4 py-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E50914]" />
      ) : (
        <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-500" />
      )}
      {isPending ? "Rolling Back..." : "Rollback to this"}
    </button>
  );
}
