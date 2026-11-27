/**
 * Shared security primitives for Pro Deal Portal.
 * Pure TypeScript (Edge, Node.js, and Browser compatible).
 */

export const ALLOWED_DIVISION_SLUGS = new Set([
  'signages',
  'printing',
  'bowls',
  'chemicals',
] as const);

export type AllowedDivisionSlug = 'signages' | 'printing' | 'bowls' | 'chemicals';

export function isValidDivisionSlug(value: unknown): value is AllowedDivisionSlug {
  return typeof value === 'string' && ALLOWED_DIVISION_SLUGS.has(value as AllowedDivisionSlug);
}

/**
 * Normalizes a Host header value (strips port, trailing dot, whitespace, and lowercases).
 */
export function normalizeHostname(rawHost: string | null | undefined): string {
  if (!rawHost) return '';
  let clean = rawHost.trim().toLowerCase();
  if (clean.startsWith('[')) {
    const endBracket = clean.indexOf(']');
    if (endBracket !== -1) clean = clean.slice(1, endBracket);
  } else {
    clean = clean.split(':')[0];
  }
  return clean.replace(/\.+$/, '');
}

export function isLocalDevelopmentHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost');
}

export function getConfiguredAdminHost(): string | null {
  const raw = process.env.ADMIN_SUBDOMAIN_HOST || process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN_HOST;
  const host = normalizeHostname(raw);
  return host || null;
}

export function getAdminPortalOrigin(): string {
  const adminHost = getConfiguredAdminHost();
  if (adminHost) {
    const protocol = isLocalDevelopmentHost(adminHost) ? 'http' : 'https';
    return `${protocol}://${adminHost}`;
  }
  return 'https://www.prodealindustries.com';
}

const ADMIN_SUBDOMAIN_SHORT_PREFIXES = [
  '/login',
  '/update-password',
  '/tickets',
  '/staff',
];

export type AdminHostRouteDecision =
  | { action: 'block_not_found' }
  | { action: 'rewrite_to_admin'; targetPath: string }
  | { action: 'allow_admin'; isAdminSubdomain: boolean }
  | { action: 'allow_public'; isAdminSubdomain: boolean };

/**
 * Dedicated Admin Subdomain router (Option A):
 * - When `configuredAdminHost` is set (e.g. desk.prodealindustries.com):
 *   - Public host requests to /admin* or /api/admin* receive a hard 404 (except localhost dev).
 *   - Admin subdomain root "/" and short paths ("/login", "/tickets", etc.) rewrite cleanly to /admin*.
 * - When unset: falls back cleanly without locking out existing deployments until DNS is attached.
 */
export function classifyAdminHostRequest(
  requestHost: string | null | undefined,
  pathname: string,
  configuredAdminHost: string | null = getConfiguredAdminHost()
): AdminHostRouteDecision {
  const host = normalizeHostname(requestHost);
  const lowerPath = pathname.toLowerCase();
  const isAdminPath = lowerPath === '/admin' || lowerPath.startsWith('/admin/');
  const isAdminApi = lowerPath === '/api/admin' || lowerPath.startsWith('/api/admin/');
  const isLocal = isLocalDevelopmentHost(host);

  const normalizedAdminHost = normalizeHostname(configuredAdminHost);

  if (!normalizedAdminHost) {
    return isAdminPath || isAdminApi
      ? { action: 'allow_admin', isAdminSubdomain: false }
      : { action: 'allow_public', isAdminSubdomain: false };
  }

  const isAdminSubdomain =
    host === normalizedAdminHost || (isLocal && (host.startsWith('desk.') || host.startsWith('admin.')));

  if (isAdminSubdomain) {
    if (isAdminPath || isAdminApi) {
      return { action: 'allow_admin', isAdminSubdomain: true };
    }
    if (pathname === '/') {
      return { action: 'rewrite_to_admin', targetPath: '/admin' };
    }
    const matchesShortAdminPath = ADMIN_SUBDOMAIN_SHORT_PREFIXES.some(
      (prefix) => lowerPath === prefix || lowerPath.startsWith(`${prefix}/`)
    );
    if (matchesShortAdminPath) {
      return { action: 'rewrite_to_admin', targetPath: `/admin${pathname}` };
    }
    return { action: 'allow_public', isAdminSubdomain: true };
  }

  // Non-admin public hostname: hide /admin and /api/admin behind a hard 404 (localhost exempt for local dev)
  if (!isLocal && (isAdminPath || isAdminApi)) {
    return { action: 'block_not_found' };
  }

  return isAdminPath || isAdminApi
    ? { action: 'allow_admin', isAdminSubdomain: false }
    : { action: 'allow_public', isAdminSubdomain: false };
}

/**
 * Runtime string validation helper preventing scanner TypeErrors on malformed payloads.
 */
export function ensureSafeString(value: unknown, maxLength = 256): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

/**
 * Constant-time string comparison (works in Edge, Node, and browser runtimes).
 */
export function constantTimeEqual(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (typeof provided !== 'string' || typeof expected !== 'string' || !provided || !expected) {
    return false;
  }
  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(expected);
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

function expandIpv6ToHextets(ip: string): string[] | null {
  let clean = ip.toLowerCase().trim();
  const zoneIdx = clean.indexOf('%');
  if (zoneIdx !== -1) clean = clean.slice(0, zoneIdx);
  if (!clean.includes(':')) return null;

  const lastColon = clean.lastIndexOf(':');
  const tail = clean.slice(lastColon + 1);
  if (tail.includes('.')) {
    const ipv4Parts = tail.split('.').map((n) => Number(n));
    if (ipv4Parts.length !== 4 || ipv4Parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
      return null;
    }
    const h1 = ((ipv4Parts[0] << 8) | ipv4Parts[1]).toString(16);
    const h2 = ((ipv4Parts[2] << 8) | ipv4Parts[3]).toString(16);
    clean = `${clean.slice(0, lastColon + 1)}${h1}:${h2}`;
  }

  const doubleColonParts = clean.split('::');
  if (doubleColonParts.length > 2) return null;

  let left = doubleColonParts[0] ? doubleColonParts[0].split(':').filter(Boolean) : [];
  const right =
    doubleColonParts.length === 2 && doubleColonParts[1]
      ? doubleColonParts[1].split(':').filter(Boolean)
      : [];

  if (doubleColonParts.length === 1) {
    if (left.length !== 8) return null;
  } else {
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;
    left = [...left, ...Array(missing).fill('0'), ...right];
  }

  if (left.length !== 8 || left.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) {
    return null;
  }
  return left.map((g) => g.padStart(4, '0'));
}

/**
 * Normalizes IPv4 and IPv6 addresses into rate-limit quota keys.
 * Collapses IPv6 addresses to /64 prefixes to prevent /128 address-rotation bypasses.
 */
export function normalizeIpToQuotaKey(rawIp: string | null | undefined): string {
  let clean = String(rawIp || '').trim();
  if (!clean) return 'unknown';

  if (clean.startsWith('[')) {
    const endBracket = clean.indexOf(']');
    if (endBracket !== -1) clean = clean.slice(1, endBracket);
  } else if (clean.includes('.') && clean.includes(':') && !clean.includes('::')) {
    clean = clean.split(':')[0];
  }

  const mappedMatch = clean.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (mappedMatch) clean = mappedMatch[1];

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) {
    const octets = clean.split('.').map(Number);
    if (octets.every((o) => Number.isInteger(o) && o >= 0 && o <= 255)) {
      return octets.join('.');
    }
    return 'unknown';
  }

  const hextets = expandIpv6ToHextets(clean);
  if (hextets) {
    return `${hextets.slice(0, 4).join(':')}::/64`;
  }

  return 'unknown';
}

/**
 * Extracts client IP strictly from trusted edge headers (Cloudflare / Vercel Edge)
 * rather than trusting client-spoofable leftmost X-Forwarded-For entries.
 */
export function extractTrustedClientIp(headerList: { get(name: string): string | null }): {
  ip: string;
  quotaKey: string;
} {
  const cfIp = headerList.get('cf-connecting-ip')?.trim();
  const vercelForwarded = headerList.get('x-vercel-forwarded-for')?.trim();
  const xRealIp = headerList.get('x-real-ip')?.trim();
  const xForwardedFor = headerList.get('x-forwarded-for')?.trim();

  let chosenIp = '';
  if (cfIp) {
    chosenIp = cfIp;
  } else if (vercelForwarded) {
    const hops = vercelForwarded.split(',').map((h) => h.trim()).filter(Boolean);
    chosenIp = hops[hops.length - 1] || '';
  } else if (xRealIp) {
    chosenIp = xRealIp;
  } else if (xForwardedFor) {
    // Take rightmost hop appended by the reverse proxy, never the client-spoofable leftmost hop.
    const hops = xForwardedFor.split(',').map((h) => h.trim()).filter(Boolean);
    chosenIp = hops[hops.length - 1] || '';
  }

  const quotaKey = normalizeIpToQuotaKey(chosenIp);
  return {
    ip: chosenIp || '127.0.0.1',
    quotaKey: quotaKey === 'unknown' ? '127.0.0.1' : quotaKey,
  };
}

/**
 * Validates relative redirect targets to block open redirects (https://, //evil.com, javascript:, etc.).
 */
export function sanitizeSafeRedirect(
  rawUrl: unknown,
  allowedPrefix = '/admin',
  fallback = '/admin'
): string {
  if (typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }
  if (/[\r\n\0]/.test(trimmed)) {
    return fallback;
  }
  if (allowedPrefix && trimmed !== allowedPrefix && !trimmed.startsWith(`${allowedPrefix}/`) && !trimmed.startsWith(`${allowedPrefix}?`)) {
    return fallback;
  }
  return trimmed;
}

/**
 * Escapes HTML special characters for safe interpolation inside HTML email templates.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Neutralizes Excel/Google Sheets CSV formula injection (leading =, +, -, @, tab, CR).
 */
export function neutralizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Strips WhatsApp markdown control characters and line-break spoofing from user-supplied fields.
 */
export function sanitizeWhatsAppText(value: unknown, maxLength = 160): string {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[*_~`<>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Strips CR/LF characters from email subjects and header values to prevent header injection.
 */
export function sanitizeHeaderLine(value: unknown, maxLength = 200): string {
  return String(value ?? '')
    .replace(/[\r\n\0]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

const SENSITIVE_LOG_KEYS = new Set([
  'password',
  'passcode',
  'token',
  'secret',
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'api_key',
  'apikey',
  'x-api-key',
  'access_token',
  'refresh_token',
  'service_role_key',
]);

/**
 * Recursively redacts sensitive keys before persisting error/audit metadata to logs or DB.
 */
export function redactSensitiveMetadata(data: unknown, depth = 0): unknown {
  if (depth > 6) return '[TRUNCATED]';
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.slice(0, 50).map((item) => redactSensitiveMetadata(item, depth + 1));
  }
  if (typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      if (SENSITIVE_LOG_KEYS.has(lower) || /(?:secret|token|password|cookie|authorization)/i.test(lower)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redactSensitiveMetadata(v, depth + 1);
      }
    }
    return out;
  }
  if (typeof data === 'string' && data.length > 2000) {
    return `${data.slice(0, 2000)}...[TRUNCATED]`;
  }
  return data;
}

/**
 * Lightweight attack probe classifier (XSS, SQLi, traversal, type tampering, payload bloat).
 */
export function detectAttackProbe(
  value: unknown,
  maxLength = 1000
): { suspicious: boolean; category?: string } {
  if (value === null || value === undefined || value === '') {
    return { suspicious: false };
  }
  if (typeof value !== 'string') {
    return { suspicious: true, category: 'TYPE_TAMPERING' };
  }
  if (value.length > maxLength) {
    return { suspicious: true, category: 'PAYLOAD_BLOAT' };
  }
  if (/<\s*script\b|javascript:|on(?:error|load|click|mouseover)\s*=|<\s*(?:iframe|svg|object|embed)\b/i.test(value)) {
    return { suspicious: true, category: 'XSS_PROBE' };
  }
  if (/(?:\bunion\s+(?:all\s+)?select\b|'\s*or\s+['"]?\d+['"]?\s*=\s*['"]?\d+|\bdrop\s+table\b|--\s*$)/i.test(value)) {
    return { suspicious: true, category: 'SQL_OR_FILTER_INJECTION' };
  }
  if (/(?:\.\.[/\\]){2,}|(?:^|[;\s|&])(?:curl|wget)\s+[^\n|]+\|\s*(?:ba)?sh\b/i.test(value)) {
    return { suspicious: true, category: 'CMD_OR_PATH_TRAVERSAL' };
  }
  return { suspicious: false };
}
