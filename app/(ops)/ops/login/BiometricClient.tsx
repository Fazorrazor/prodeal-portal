/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { Fingerprint, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  getCalibrationAuthOptions,
  verifyCalibrationAuth,
} from "./webauthn-actions";

import { OpsAlertModal } from "./OpsAlertModal";

export function BiometricSetup() {
  const [step, setStep] = useState(0);
  const [setupHash, setSetupHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);

  const TOTAL_STEPS = 1;

  const handleFingerprint = async () => {
    try {
      setError(null);

      if (step === 0) {
        // Step 1: Real WebAuthn Registration
        const options = await getRegistrationOptions();
        const attResp = await startRegistration({
          optionsJSON: options as any,
        });

        const verification = await verifyRegistration(attResp);
        if (verification.verified) {
          setSetupHash(verification.credentialStr!);
          setStep(1);
        } else {
          throw new Error("Registration verification failed.");
        }
      } else if (step < TOTAL_STEPS) {
        // Steps 2-5: Real WebAuthn Authentication against the newly generated credential!
        if (!setupHash) throw new Error("Missing credential for calibration.");

        const options = await getCalibrationAuthOptions(setupHash);
        const asseResp = await startAuthentication({
          optionsJSON: options as any,
        });

        const verification = await verifyCalibrationAuth(asseResp, setupHash);
        if (verification.verified) {
          setStep((prev) => {
            const next = prev + 1;
            if (next === TOTAL_STEPS) setShowModal(true);
            return next;
          });
        } else {
          throw new Error(
            "Calibration mismatch. Hardware verification failed.",
          );
        }
      }
    } catch (err: any) {
      console.error("Biometric Error:", err);
      // Give extremely specific error messages to help debugging
      setError(
        err.name === "NotAllowedError"
          ? "Scan canceled or timed out."
          : err.message || "Fingerprint scan failed. Please try again.",
      );
    }
  };

  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!hasAttempted.current) {
      hasAttempted.current = true;
      handleFingerprint();
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      {step < TOTAL_STEPS ? (
        <>
          <div className="text-center">
            <h3 className="text-[#F5F5F5] uppercase tracking-widest font-bold mb-2">
              Biometric Calibration
            </h3>
            <p className="text-[#A7A7AA] text-[0.65rem] uppercase tracking-wider">
              Scan fingerprint to register and verify.
              <br />
              <span className="text-[#E50914] font-bold">
                Progress: {step} / {TOTAL_STEPS}
              </span>
            </p>
          </div>

          <button
            onClick={handleFingerprint}
            className="w-32 h-32 rounded-full border-2 border-[#E50914] flex items-center justify-center bg-[#310004]/50 hover:bg-[#E50914]/20 transition-all group relative"
          >
            <div className="absolute inset-0 rounded-full border border-[#E50914] animate-ping opacity-20" />
            <Fingerprint className="w-16 h-16 text-[#E50914] group-hover:scale-110 transition-transform" />
          </button>

          {error && (
            <div className="text-[#FF1F2D] text-[0.65rem] uppercase tracking-wider text-center bg-[#310004] px-4 py-2 border border-[#E50914]/50">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="text-[#27D17F] text-center uppercase tracking-widest font-bold flex flex-col items-center gap-3">
          <CheckCircle2 className="w-8 h-8" />
          Calibration Complete
          <p className="text-[#A7A7AA] text-[0.6rem] font-normal tracking-wide mt-2 max-w-[200px]">
            Please copy the credential payload to your environment variables to
            finalize.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-[0.6rem] mt-2 border border-[#27D17F]/30 px-3 py-1 hover:bg-[#27D17F]/10 transition-colors text-[#27D17F]"
          >
            View Payload
          </button>
        </div>
      )}

      {step >= TOTAL_STEPS && showModal && (
        <OpsAlertModal
          title="Biometric Configured"
          type="success"
          description={
            <>
              Please copy the following serialized credential into your{" "}
              <code className="text-[#F5F5F5]">.env.local</code> file as{" "}
              <code className="text-[#F5F5F5]">
                DEV_PORTAL_WEBAUTHN_CREDENTIAL
              </code>
              , then restart the server.
            </>
          }
          code={setupHash || ""}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export function BiometricLogin({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const hasAttempted = useRef(false);

  const handleAuth = async () => {
    try {
      setError(null);

      const options = await getAuthenticationOptions();
      const asseResp = await startAuthentication({
        optionsJSON: options as any,
      });

      const verification = await verifyAuthentication(asseResp);

      if (verification.verified) {
        onSuccess();
      } else {
        throw new Error("Biometric verification failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Authorization rejected. Fingerprint mismatch.");
    }
  };

  useEffect(() => {
    if (!hasAttempted.current) {
      hasAttempted.current = true;
      handleAuth();
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4 py-4">
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAuth();
        }}
        className="w-16 h-16 rounded-full border border-[#68686F] flex items-center justify-center hover:border-[#E50914] hover:text-[#E50914] text-[#A7A7AA] transition-all bg-[#090909] group"
      >
        <Fingerprint className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>
      <div className="text-[0.55rem] uppercase tracking-widest text-[#68686F]">
        Require Biometric Scan
      </div>
      {error && (
        <div className="text-[#FF1F2D] text-[0.55rem] uppercase tracking-wider text-center">
          {error}
        </div>
      )}
    </div>
  );
}
