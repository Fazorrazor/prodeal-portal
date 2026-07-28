import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from "jose";

import { Redis } from '@upstash/redis';

export async function proxy(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
  
  // --- Edge Firewall Execution ---
  if (ip !== 'Unknown' && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const isBlacklisted = await redis.sismember('edge_firewall_blacklist', ip);
      
      if (isBlacklisted) {
        return new NextResponse(
          JSON.stringify({ error: "Access Denied: IP blocked by Edge Firewall" }), 
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      // Fail open if Redis is down
      console.error("Firewall check failed:", e);
    }
  }

  // --- Telemetry Interceptor ---
  const url = req.nextUrl.pathname;
  const method = req.method;
  let severity = "INFO";
  const status = 200; // Middleware executes before status is finalized; we log intention

  // --- 1. Dynamic Tarpitting & Active Deception ---
  const TARPIT_PATHS = ['.env', 'wp-admin', 'phpmyadmin', '.git', 'config.json'];
  const isVulnerabilityScanner = TARPIT_PATHS.some(path => url.toLowerCase().includes(path));

  if (isVulnerabilityScanner) {
    severity = "CRITICAL";
  } else if (method === "DELETE" || method === "PUT") {
    severity = "WARNING";
  }

  if (url.includes("login") || url.includes("admin")) {
    severity = "WARNING";
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Don't trace internal Next.js static asset requests
  if (supabaseUrl && supabaseServiceKey && !url.startsWith("/_next") && !url.includes("favicon.ico")) {
    const regionHeader = req.headers.get("x-vercel-id");
    const region = regionHeader
      ? regionHeader.split("::")[0].toUpperCase()
      : "EDGE";

    // Extract rich metadata for anomaly inspection
    const headers = Object.fromEntries(req.headers.entries());
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    
    const metadata = {
      userAgent: headers['user-agent'] || 'Unknown',
      ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'Unknown',
      geo: { 
        city: headers['x-vercel-ip-city'] || 'Unknown', 
        country: headers['x-vercel-ip-country'] || 'Unknown' 
      },
      headers: headers,
      query: searchParams,
    };

    const trace = {
      method,
      endpoint: url,
      status: status,
      latency: Math.floor(Math.random() * 60) + 10, // Simulated network overhead
      region: region,
      severity: severity,
      metadata: metadata,
    };

    // Fire and forget POST to the Supabase REST API
    fetch(`${supabaseUrl}/rest/v1/ops_network_traces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(trace),
    }).catch((e) => console.error("Telemetry error:", e));
  }
  // -----------------------------

  // --- Execute Tarpit (Shadow Ban) ---
  if (isVulnerabilityScanner) {
    // Deliberately hold the connection open to exhaust botnet resources
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // Return a fake 200 OK with garbage data to waste the attacker's time analyzing it
    return new NextResponse(JSON.stringify({ status: "success", version: "9.4.2" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If trying to access /admin routes (except login) and no session exists
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If trying to access /admin/login but already logged in
  if (req.nextUrl.pathname.startsWith('/admin/login')) {
    if (session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Developer Operations Firewall
  if (req.nextUrl.pathname.startsWith("/ops")) {
    const sessionCookie = req.cookies.get("ops_session")?.value;

    if (!sessionCookie && req.nextUrl.pathname !== "/ops/login") {
      return NextResponse.redirect(new URL("/ops/login", req.url));
    }

    if (sessionCookie) {
      try {
        const secretKey = process.env.DEV_PORTAL_SESSION_SECRET || "fallback-secret-for-development-only-change-in-prod";
        const key = new TextEncoder().encode(secretKey);
        await jwtVerify(sessionCookie, key, { algorithms: ["HS256"] });

        // If logged in and trying to access login, redirect to ops dashboard
        if (req.nextUrl.pathname === "/ops/login") {
          return NextResponse.redirect(new URL("/ops", req.url));
        }
      } catch (error) {
        // Token is invalid or expired
        if (req.nextUrl.pathname !== "/ops/login") {
          const response = NextResponse.redirect(new URL("/ops/login", req.url));
          response.cookies.delete("ops_session");
          return response;
        }
      }
    }
  }

  // --- Strict Security Headers (Zero Trust) ---
  res.headers.set("X-Frame-Options", "DENY"); // Prevent Clickjacking
  res.headers.set("X-Content-Type-Options", "nosniff"); // Prevent MIME-sniffing
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  ); // Enforce HTTPS
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  ); // Disable unnecessary browser features
  // Strict CSP to neutralize XSS
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://*.whatsapp.com; connect-src 'self' wss://*.supabase.co https://*.supabase.co; font-src 'self' data:;"
  );

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
