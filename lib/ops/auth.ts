/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey =
  process.env.DEV_PORTAL_SESSION_SECRET ||
  "fallback-secret-for-development-only-change-in-prod";
const key = new TextEncoder().encode(secretKey);

export async function createOpsSession(userId: string = "developer") {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour session
  const session = await new SignJWT({ userId, role: "superadmin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("ops_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "strict",
    path: "/",
  });
}

export async function verifyOpsSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("ops_session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function destroyOpsSession() {
  const cookieStore = await cookies();
  cookieStore.delete("ops_session");
}
