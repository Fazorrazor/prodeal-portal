/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use server";

import { logger } from "@/lib/ops/logger";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { headers, cookies } from "next/headers";

const rpName = "Pro Deal Ops";

async function getWebAuthnConfig() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost";

  // The RP ID must be the exact domain name without ports
  const rpID = host.split(":")[0];

  // The Origin must be the exact URL including protocol and port
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return { rpID, origin };
}

// Since it's a single admin system, we'll hardcode a dummy user ID
const user = {
  id: "ops-admin-001",
  username: "ops-admin",
};

export async function getRegistrationOptions() {
  const { rpID } = await getWebAuthnConfig();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.username,
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  // Store challenge in cookie temporarily
  const cookieStore = await cookies();
  cookieStore.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });

  return options;
}

export async function verifyRegistration(attResp: any) {
  const { rpID, origin } = await getWebAuthnConfig();

  const cookieStore = await cookies();
  const challenge = cookieStore.get("webauthn_challenge")?.value;

  if (!challenge) {
    throw new Error("Challenge missing or expired.");
  }

  const verification = await verifyRegistrationResponse({
    response: attResp,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credential } = verification.registrationInfo;

    // Serialize to base64 for .env storage
    const credentialStr = JSON.stringify({
      id: credential.id,
      publicKey: Array.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports || [],
    });

    logger.security("Hardware Security Key Initialized", {
      target: "OpsGateway",
    });
    return { verified: true, credentialStr };
  }

  return { verified: false };
}

export async function getAuthenticationOptions() {
  const { rpID } = await getWebAuthnConfig();

  let serialized = process.env.DEV_PORTAL_WEBAUTHN_CREDENTIAL;
  if (serialized) serialized = serialized.replace(/^['"]|['"]$/g, "");
  
  if (!serialized) {
    throw new Error("WebAuthn not configured.");
  }

  const cred = JSON.parse(serialized);

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [
      {
        id: cred.id,
        transports: cred.transports ? cred.transports.filter((t: string) => t === "internal") : ["internal"],
      },
    ],
    userVerification: "preferred",
  });

  const cookieStore = await cookies();
  cookieStore.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });

  return options;
}

export async function verifyAuthentication(asseResp: any) {
  const { rpID, origin } = await getWebAuthnConfig();

  const cookieStore = await cookies();
  const challenge = cookieStore.get("webauthn_challenge")?.value;
  let serialized = process.env.DEV_PORTAL_WEBAUTHN_CREDENTIAL;
  if (serialized) serialized = serialized.replace(/^['"]|['"]$/g, "");

  if (!challenge || !serialized) {
    logger.error(
      "WebAuthn Verification Failed",
      new Error("Missing session state"),
      { target: "OpsGateway" },
    );
    throw new Error("Missing required session state for WebAuthn.");
  }

  const cred = JSON.parse(serialized);

  try {
    const verification = await verifyAuthenticationResponse({
      response: asseResp,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.id,
        publicKey: new Uint8Array(cred.publicKey),
        counter: cred.counter,
      },
    });

    // We set a cookie to indicate that biometric verification succeeded for this session
    if (verification.verified) {
      cookieStore.set("webauthn_verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60, // 1 minute to complete password login
      });
      logger.audit(
        "Biometric Signature Verified",
        "SystemAdmin",
        "OpsGateway Hardware Check",
      );
    } else {
      logger.security("Biometric Signature Rejected", {
        target: "OpsGateway Hardware Check",
      });
    }

    return { verified: verification.verified };
  } catch (err: any) {
    logger.error("WebAuthn Exception", err, { target: "OpsGateway" });
    throw err;
  }
}

// Temporary calibration actions for the 5-step setup
export async function getCalibrationAuthOptions(credentialStr: string) {
  const { rpID } = await getWebAuthnConfig();
  const cred = JSON.parse(credentialStr);

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [
      {
        id: cred.id,
        transports: cred.transports ? cred.transports.filter((t: string) => t === "internal") : ["internal"],
      },
    ],
    userVerification: "preferred",
  });

  const cookieStore = await cookies();
  cookieStore.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });

  return options;
}

export async function verifyCalibrationAuth(
  asseResp: any,
  credentialStr: string,
) {
  const { rpID, origin } = await getWebAuthnConfig();

  const cookieStore = await cookies();
  const challenge = cookieStore.get("webauthn_challenge")?.value;

  if (!challenge) {
    throw new Error("Missing challenge for calibration.");
  }

  const cred = JSON.parse(credentialStr);

  const verification = await verifyAuthenticationResponse({
    response: asseResp,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: cred.id,
      publicKey: new Uint8Array(cred.publicKey),
      counter: cred.counter,
    },
  });

  return { verified: verification.verified };
}
