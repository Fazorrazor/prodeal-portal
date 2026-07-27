/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use server";

import { redirect } from "next/navigation";
import { createOpsSession, destroyOpsSession } from "@/lib/ops/auth";
import { logger } from "@/lib/ops/logger";

import * as argon2 from "argon2";

export async function loginToOps(formData: FormData) {
  const password = formData.get("password") as string;
  const hash = process.env.DEV_PORTAL_PASSWORD_HASH;
  const webAuthnConfigured = !!process.env.DEV_PORTAL_WEBAUTHN_CREDENTIAL;

  if (!hash) {
    // SETUP MODE: First time login. Generate the Argon2id hash.
    const newHash = await argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 65536,
      parallelism: 4,
    });

    logger.security("Master Passcode initialized", {
      target: "DEV_PORTAL_PASSWORD_HASH",
    });

    const urlParams = new URLSearchParams({ setup_hash: newHash });
    redirect(`/ops/login?${urlParams.toString()}`);
  }

  let isSuccess = false;

  // NORMAL MODE: Verification
  try {
    const cleanHash = hash.replace(/\\/g, "").replace(/^['"]|['"]$/g, "");
    const isValid = await argon2.verify(cleanHash, password);
    if (isValid) {
      if (webAuthnConfigured) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const verified = cookieStore.get("webauthn_verified")?.value;
        if (verified !== "true") {
          throw new Error("Biometric verification missing or expired.");
        }

        // Clean up temporary cookie
        cookieStore.delete("webauthn_verified");
      }

      await createOpsSession();
      isSuccess = true;
      logger.audit("Authentication Granted", "SystemAdmin", "OpsGateway", {
        method: webAuthnConfigured ? "Argon2id + WebAuthn" : "Argon2id",
      });
    } else {
      logger.security("Authentication Denied: Invalid password", {
        target: "OpsGateway",
      });
    }
  } catch (err: any) {
    logger.error("Authentication Error", err, { target: "OpsGateway" });
    console.error("Ops Auth Verification Error:", err);
  }

  if (isSuccess) {
    // We must execute redirect outside of try/catch because Next.js redirect()
    // throws an error under the hood which would get caught.
    redirect("/ops");
  } else {
    // Failed login
    redirect("/ops/login?error=denied");
  }
}

export async function logoutOps() {
  await destroyOpsSession();
  logger.audit("Session Terminated", "SystemAdmin", "OpsGateway");
  redirect("/ops/login");
}
