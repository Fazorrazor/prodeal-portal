import 'server-only';
import { after } from 'next/server';
import { createServiceRoleClient } from './supabase/server';
import { isRateLimitConfigured, ratelimitRedis } from './ratelimit';
import {
  escapeHtml,
  extractTrustedClientIp,
  redactSensitiveMetadata,
  sanitizeHeaderLine,
} from './security';

export type SecurityAlertSeverity = 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RequestTelemetry {
  ip: string;
  quotaKey: string;
  device: string;
  browser: string;
  isAutomatedTool: boolean;
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
  locationSummary: string;
  mapUrl: string | null;
  rawUserAgent: string;
}

export interface SecurityAlertInput {
  severity: SecurityAlertSeverity;
  title: string;
  summary: string;
  cooldownKey: string;
  endpoint?: string;
  actor?: string | null;
  reasonCode?: string;
  probeCategory?: string | null;
  probePreview?: string | null;
  telemetry?: RequestTelemetry | null;
  extra?: Record<string, string | number | boolean | null | undefined>;
}

export const RESEND_TIMEOUT_MS = 6000;
const COOLDOWN_SECONDS = 15 * 60; // 15 minutes
const localCooldownMap = new Map<string, number>();

function safeDecodeHeader(val: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  try {
    return decodeURIComponent(trimmed).slice(0, 80);
  } catch {
    return trimmed.slice(0, 80);
  }
}

export function parseDeviceAndBrowser(
  uaRaw: string | null | undefined,
  headerList?: { get(name: string): string | null }
): { device: string; browser: string; isAutomatedTool: boolean } {
  const ua = String(uaRaw || '').trim();
  const secPlatform = headerList?.get('sec-ch-ua-platform')?.replace(/["']/g, '').trim() || '';

  const botMatch = ua.match(
    /(sqlmap|nikto|nmap|nuclei|acunetix|burp|owasp|zgrab|masscan|curl|wget|python-requests|python-urllib|httpx|aiohttp|go-http-client|postmanruntime|insomnia|headlesschrome|playwright|puppeteer|scrapy|bot|spider|crawler)/i
  );
  if (!ua || botMatch) {
    return {
      device: botMatch ? `Automated Tool / Scanner (${botMatch[1]})` : 'Unknown / Empty User-Agent',
      browser: botMatch ? botMatch[1] : 'None',
      isAutomatedTool: true,
    };
  }

  let device = secPlatform || 'Desktop / Unknown';
  if (/iPhone/i.test(ua)) {
    const v = ua.match(/OS (\d+[_\.]\d+)/i)?.[1]?.replace(/_/g, '.');
    device = `iPhone${v ? ` (iOS ${v})` : ''}`;
  } else if (/iPad/i.test(ua)) {
    const v = ua.match(/OS (\d+[_\.]\d+)/i)?.[1]?.replace(/_/g, '.');
    device = `iPad${v ? ` (iPadOS ${v})` : ''}`;
  } else if (/Android/i.test(ua)) {
    const ver = ua.match(/Android\s+([0-9.]+)/i)?.[1];
    device = `Android${ver ? ` ${ver}` : ''}`;
  } else if (/Windows NT/i.test(ua)) {
    device = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    device = 'macOS';
  } else if (/Linux/i.test(ua)) {
    device = 'Linux';
  }

  let browser = 'Unknown Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Chrome\/|CriOS\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  return { device, browser, isAutomatedTool: false };
}

export function extractRequestTelemetry(headerList: { get(name: string): string | null }): RequestTelemetry {
  const { ip, quotaKey } = extractTrustedClientIp(headerList);
  const rawUserAgent = String(headerList.get('user-agent') || '').slice(0, 260);
  const { device, browser, isAutomatedTool } = parseDeviceAndBrowser(rawUserAgent, headerList);

  const city = safeDecodeHeader(headerList.get('x-vercel-ip-city') || headerList.get('cf-ipcity'));
  const region = safeDecodeHeader(headerList.get('x-vercel-ip-country-region') || headerList.get('cf-region'));
  const country = safeDecodeHeader(headerList.get('x-vercel-ip-country') || headerList.get('cf-ipcountry'));
  const timezone = safeDecodeHeader(headerList.get('x-vercel-ip-timezone'));
  const latRaw = headerList.get('x-vercel-ip-latitude')?.trim() || null;
  const lngRaw = headerList.get('x-vercel-ip-longitude')?.trim() || null;
  const latOk = latRaw && /^-?\d+(?:\.\d+)?$/.test(latRaw) ? latRaw : null;
  const lngOk = lngRaw && /^-?\d+(?:\.\d+)?$/.test(lngRaw) ? lngRaw : null;

  const locParts = [city, region, country].filter(Boolean);
  const locationSummary =
    locParts.length > 0
      ? `${locParts.join(', ')}${timezone ? ` (${timezone})` : ''}`
      : ip === '127.0.0.1' || ip === '::1'
        ? 'Localhost (Development)'
        : 'Unknown / Proxy-Hidden';

  const mapUrl = latOk && lngOk ? `https://maps.google.com/?q=${latOk},${lngOk}` : null;

  return {
    ip,
    quotaKey,
    device,
    browser,
    isAutomatedTool,
    city,
    region,
    country,
    timezone,
    locationSummary,
    mapUrl,
    rawUserAgent,
  };
}

async function acquireAlertCooldown(cooldownKey: string): Promise<boolean> {
  const redisKey = `alert:cd:${cooldownKey.slice(0, 120)}`;
  if (isRateLimitConfigured) {
    try {
      const result = await ratelimitRedis.set(redisKey, '1', { ex: COOLDOWN_SECONDS, nx: true });
      return result === 'OK';
    } catch {
      // Fall back to process-local cooldown
    }
  }

  const now = Date.now();
  const expiresAt = localCooldownMap.get(cooldownKey);
  if (expiresAt && expiresAt > now) {
    return false;
  }
  if (localCooldownMap.size >= 500) {
    localCooldownMap.clear();
  }
  localCooldownMap.set(cooldownKey, now + COOLDOWN_SECONDS * 1000);
  return true;
}

export async function deliverSecurityAlertEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<'RESEND' | 'AUDIT_LOG_ONLY'> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    return 'AUDIT_LOG_ONLY';
  }

  const from =
    process.env.SECURITY_ALERT_FROM?.trim() || 'Prodeal Security Alerts <alerts@prodealindustries.com>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: sanitizeHeaderLine(subject, 180),
        html,
        text,
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
    if (res.ok) return 'RESEND';
  } catch (err) {
    console.warn('[SecurityAlert] Resend dispatch failed; preserved in system_error_logs:', err);
  }

  return 'AUDIT_LOG_ONLY';
}

/**
 * Dispatches a non-blocking security alert (with 15-minute cooldown) via Next.js after().
 * Persists permanently to `system_error_logs` and emails via Resend (6s timeout).
 */
export function sendSecurityAlert(input: SecurityAlertInput): Promise<void> {
  const task = (async () => {
    try {
      const allowed = await acquireAlertCooldown(input.cooldownKey);
      if (!allowed) return;

      const timestampUtc = new Date().toISOString();
      const t = input.telemetry;

      // 1. Permanent audit record in Supabase system_error_logs
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createServiceRoleClient();
          await supabase.from('system_error_logs').insert({
            context: `SECURITY_ALERT:${input.reasonCode || input.severity}`,
            error_message: `${input.title} — ${input.summary}`.slice(0, 2000),
            error_stack: null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: redactSensitiveMetadata({
              severity: input.severity,
              endpoint: input.endpoint,
              actor: input.actor,
              probeCategory: input.probeCategory,
              probePreview: input.probePreview,
              telemetry: t,
              extra: input.extra,
              timestampUtc,
            }) as any,
          });
        }
      } catch (dbErr) {
        console.warn('[SecurityAlert] Failed to persist alert to system_error_logs:', dbErr);
      }

      // 2. Skip outbound email in local dev unless explicitly requested
      if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_SECURITY_EMAILS !== 'true') {
        return;
      }

      const recipient =
        process.env.SECURITY_ALERT_EMAIL?.trim() || 'prodealsystems@hotmail.com';
      const subject = `[${input.severity}] Prodeal Security: ${input.title}`;

      const rows: Array<[string, string]> = [
        ['Severity', input.severity],
        ['Time (UTC)', timestampUtc],
        ['Endpoint', input.endpoint || 'N/A'],
        ['Actor / Account', input.actor || 'Unauthenticated'],
        ['Reason Code', input.reasonCode || 'N/A'],
        ['Client IP', t ? `${t.ip} (Quota: ${t.quotaKey})` : 'Unknown'],
        ['Location', t ? t.locationSummary : 'Unknown'],
        ['Device / Browser', t ? `${t.device} / ${t.browser}` : 'Unknown'],
      ];
      if (input.probeCategory) rows.push(['Probe Category', input.probeCategory]);
      if (input.probePreview) rows.push(['Probe Sample', input.probePreview]);

      const tableRowsHtml = rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:12px;font-weight:600;width:150px;">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:12px;font-family:monospace;">${escapeHtml(v)}</td></tr>`
        )
        .join('');

      const mapHtml = t?.mapUrl
        ? `<p style="margin:12px 0 0 0;font-size:12px;"><a href="${escapeHtml(t.mapUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0052cc;">View approximate location on Google Maps</a></p>`
        : '';

      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:620px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="margin:0 0 8px 0;color:#0f172a;font-size:18px;">[${escapeHtml(input.severity)}] ${escapeHtml(input.title)}</h2>
          <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.5;">${escapeHtml(input.summary)}</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">${tableRowsHtml}</table>
          ${mapHtml}
          <p style="margin:16px 0 0 0;color:#94a3b8;font-size:11px;">Automated Prodeal Industries Security Notification (15-minute cooldown active per incident key).</p>
        </div>
      `;

      const text = [
        `[${input.severity}] ${input.title}`,
        input.summary,
        '',
        ...rows.map(([k, v]) => `${k}: ${v}`),
      ].join('\n');

      await deliverSecurityAlertEmail(recipient, subject, html, text);
    } catch (err) {
      console.warn('[SecurityAlert] Unexpected dispatch error:', err);
    }
  })();

  try {
    after(() => task);
  } catch {
    // Outside request scope (e.g., unit tests)
  }

  return task;
}
