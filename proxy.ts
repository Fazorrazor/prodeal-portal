import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  classifyAdminHostRequest,
  constantTimeEqual,
  sanitizeSafeRedirect,
} from './lib/security';

const BLOCKED_SCANNER_SEGMENTS = [
  '/.env',
  '/wp-admin',
  '/wp-login.php',
  '/phpmyadmin',
  '/.git',
  '/config.json',
  '/xmlrpc.php',
];

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://abfphaytysoeghuzisiw.supabase.co https://*.supabase.co https://via.placeholder.com",
  "font-src 'self' data:",
  "connect-src 'self' https://abfphaytysoeghuzisiw.supabase.co wss://abfphaytysoeghuzisiw.supabase.co https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function applySecurityHeaders(response: NextResponse, noIndex = false): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  if (noIndex) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  return response;
}

export async function proxy(req: NextRequest) {
  // 1. Optional Edge/Cloudflare Origin Lock (enforced when CLOUDFLARE_ORIGIN_SECRET is configured in prod)
  const expectedOriginSecret = process.env.CLOUDFLARE_ORIGIN_SECRET;
  if (process.env.NODE_ENV === 'production' && expectedOriginSecret) {
    const provided = req.headers.get('x-origin-edge-secret') || '';
    if (!constantTimeEqual(provided, expectedOriginSecret)) {
      return applySecurityHeaders(
        new NextResponse('Forbidden: direct origin access is disabled.', { status: 403 })
      );
    }
  }

  const pathname = req.nextUrl.pathname;
  const lowerPath = pathname.toLowerCase();

  // 2. Fast fail-closed 404 for vulnerability scanners and decommissioned /ops or /api/chat routes
  const isDecommissioned =
    lowerPath === '/ops' ||
    lowerPath.startsWith('/ops/') ||
    lowerPath === '/api/chat' ||
    lowerPath.startsWith('/api/chat/');
  const isScannerProbe = BLOCKED_SCANNER_SEGMENTS.some((seg) => lowerPath.includes(seg));

  if (isDecommissioned || isScannerProbe) {
    return applySecurityHeaders(new NextResponse('Not Found', { status: 404 }));
  }

  // 3. Dedicated Admin Subdomain Isolation (Option A)
  // When ADMIN_SUBDOMAIN_HOST is set (e.g. desk.prodealindustries.com), /admin* and /api/admin*
  // return a hard 404 on the public domain, and clean paths on the admin subdomain rewrite to /admin*.
  const hostHeader = req.headers.get('host');
  const hostDecision = classifyAdminHostRequest(hostHeader, pathname);

  if (hostDecision.action === 'block_not_found') {
    return applySecurityHeaders(new NextResponse('Not Found', { status: 404 }), true);
  }

  const effectivePath =
    hostDecision.action === 'rewrite_to_admin' ? hostDecision.targetPath : pathname;
  const isAdminSurface =
    hostDecision.action === 'allow_admin' ||
    hostDecision.action === 'rewrite_to_admin' ||
    (hostDecision.action === 'allow_public' && hostDecision.isAdminSubdomain);

  const isAdminPagePath = effectivePath === '/admin' || effectivePath.startsWith('/admin/');

  let res: NextResponse;
  if (hostDecision.action === 'rewrite_to_admin') {
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = hostDecision.targetPath;
    res = NextResponse.rewrite(rewriteUrl);
  } else {
    res = NextResponse.next();
  }

  // 4. Admin route session enforcement via verified supabase.auth.getUser()
  if (isAdminPagePath) {
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isPublicAdminAuthRoute =
      effectivePath.startsWith('/admin/login') || effectivePath.startsWith('/admin/update-password');

    if (!isPublicAdminAuthRoute && !user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirectTo', sanitizeSafeRedirect(effectivePath, '/admin', '/admin'));
      return applySecurityHeaders(NextResponse.redirect(redirectUrl), true);
    }

    if (effectivePath.startsWith('/admin/login') && user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      redirectUrl.search = '';
      return applySecurityHeaders(NextResponse.redirect(redirectUrl), true);
    }
  }

  return applySecurityHeaders(res, isAdminSurface);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
