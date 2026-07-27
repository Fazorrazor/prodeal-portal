/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import { ShieldAlert, Terminal } from "lucide-react";
import { BiometricSetup } from "./BiometricClient";
import { LoginForm } from "./LoginForm";
import { OpsAlertModalWrapper } from "./OpsAlertModalWrapper";

export default async function OpsLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; setup_hash?: string }>;
}) {
  const { error, setup_hash } = await searchParams;

  const isPasswordSetup = !!process.env.DEV_PORTAL_PASSWORD_HASH;
  const isWebAuthnSetup = !!process.env.DEV_PORTAL_WEBAUTHN_CREDENTIAL;

  const needsFingerprintSetup = isPasswordSetup && !isWebAuthnSetup;

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-screen bg-[#050505] overflow-hidden font-mono">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.1)_0%,rgba(0,0,0,1)_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Surveillance Markers */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-[#E50914]/50" />
        <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-[#E50914]/50" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-[#E50914]/50" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-[#E50914]/50" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] px-6">
        {/* Setup Hash Alert (if present) */}
        {setup_hash && <OpsAlertModalWrapper setupHash={setup_hash} />}

        <div className="border border-[#141416] bg-[#0D0D0F] shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          {/* Animated Red Scanner Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-50 animate-[scan_3s_ease-in-out_infinite]" />

          {/* Header */}
          <div className="p-8 border-b border-[#141416] relative bg-[#090909]">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
              <div className="w-1.5 h-1.5 bg-[#4CA6FF] animate-pulse" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-[#E50914]" />
              <div className="bg-[#310004] text-[#E50914] text-[0.55rem] uppercase tracking-[0.2em] px-2 py-0.5 font-bold border border-[#E50914]/30">
                RESTRICTED SYSTEM
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-widest text-[#F5F5F5] uppercase">
              SYSTEM OPERATIONS
            </h1>
            <p className="text-[0.65rem] text-[#A7A7AA] uppercase tracking-[0.15em] mt-2">
              AUTHORIZED DEVELOPER ACCESS ONLY
            </p>
          </div>

          {/* Form / Biometric Area */}
          <div className="p-8">
            {error && (
              <div className="mb-6 border border-[#E50914]/50 bg-[#310004] p-3 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-1 h-full bg-[#E50914] absolute left-0 top-0" />
                <span className="text-[#E50914] text-[0.65rem] tracking-[0.1em] uppercase font-bold">
                  {error === "true" ? "Access Denied. Incident Logged." : error}
                </span>
              </div>
            )}

            {needsFingerprintSetup ? (
              <BiometricSetup />
            ) : (
              <LoginForm
                isPasswordSetup={isPasswordSetup}
                isWebAuthnSetup={isWebAuthnSetup}
              />
            )}
          </div>

          {/* Footer Metadata */}
          <div className="bg-[#050505] p-5 border-t border-[#141416]">
            <p className="text-[0.55rem] text-[#E50914] font-bold uppercase tracking-[0.15em] text-center mb-4">
              UNAUTHORIZED ACCESS ATTEMPTS ARE LOGGED, RATE-LIMITED, AND
              FLAGGED.
            </p>
            <div className="flex justify-between items-center text-[0.5rem] text-[#44444A] tracking-[0.1em] uppercase">
              <span>NODE: OPS-GW-01</span>
              <span>CHANNEL: ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
