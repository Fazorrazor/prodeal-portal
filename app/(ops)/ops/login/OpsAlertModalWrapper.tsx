"use client";

import { useState } from "react";
import { OpsAlertModal } from "./OpsAlertModal";
import { useRouter } from "next/navigation";

export function OpsAlertModalWrapper({ setupHash }: { setupHash: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <OpsAlertModal
      title="Initial Setup Required"
      type="warning"
      description={
        <>
          Please copy the following Argon2id hash into your{" "}
          <code className="text-[#F5F5F5]">.env.local</code> file as{" "}
          <code className="text-[#F5F5F5]">DEV_PORTAL_PASSWORD_HASH</code>, then
          restart the server.
        </>
      }
      code={setupHash}
      onClose={() => {
        setIsOpen(false);
        // Clear the query param from URL so it doesn't pop up again if they refresh
        router.replace("/ops/login");
      }}
    />
  );
}
