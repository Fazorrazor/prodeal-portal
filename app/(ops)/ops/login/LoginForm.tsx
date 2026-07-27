/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import { Lock, Fingerprint } from "lucide-react";
import { loginToOps } from "../actions";
import { BiometricLogin } from "./BiometricClient";

export function LoginForm({
  isPasswordSetup,
  isWebAuthnSetup,
}: {
  isPasswordSetup: boolean;
  isWebAuthnSetup: boolean;
}) {
  // If WebAuthn isn't set up yet, we don't require verification to show the password form
  const [biometricVerified, setBiometricVerified] = useState(!isWebAuthnSetup);
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <form action={loginToOps} className="flex flex-col gap-6">
      {!biometricVerified ? (
        <BiometricLogin onSuccess={() => setBiometricVerified(true)} />
      ) : (
        <>
          <div className="flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
            <label className="text-[0.6rem] font-bold tracking-[0.2em] uppercase flex items-center justify-between text-[#27D17F]">
              <span>
                {!isPasswordSetup
                  ? "Initialize Master Passcode"
                  : "Biometric Verified. Enter Passcode."}
              </span>
              <Fingerprint className="w-3.5 h-3.5" />
            </label>

            <div className="relative w-full h-[3.25rem]">
              <input
                type="password"
                name="password"
                required
                autoComplete="off"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute inset-0 w-full h-full bg-transparent border border-[#141416] p-4 text-[0.8rem] text-transparent caret-transparent focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/50 transition-all font-mono tracking-wider z-10"
              />
              <div className="absolute inset-0 w-full h-full bg-[#111113] p-4 text-[0.8rem] font-mono tracking-wider text-[#F5F5F5] flex items-center pointer-events-none border border-transparent">
                <div className="relative flex items-center z-10">
                  {password.split("").map((char, i) => (
                    <span key={i}>•</span>
                  ))}
                  <span className="animate-blink text-[#E50914] font-bold">
                    ▣
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full relative group/btn overflow-hidden bg-[#E50914] hover:bg-[#FF1F2D] text-white font-bold text-[0.7rem] tracking-[0.2em] uppercase py-4 transition-colors animate-in fade-in duration-500"
          >
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
            <span className="relative flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Authenticate
            </span>
          </button>
        </>
      )}
    </form>
  );
}
