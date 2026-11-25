# Stack, Security & Dependency Update Checklist

Use this checklist monthly and before major releases to keep `prodeal-portal`, GitHub Actions CI, Supabase, and Vercel aligned with zero silent runtime or security drift.

## 1. Verified Baseline (Nov 2026)

| Layer | Component | Target / Baseline | Notes |
| :--- | :--- | :--- | :--- |
| **Runtime (CI / Local)** | Node.js | `>= 22` | Matches `@supabase/supabase-js` native WebSocket support |
| **Framework** | `next` | `16.4.x` | Keep synced with `eslint-config-next`; monitor RCE/cache advisories |
| **UI** | `react` / `react-dom` | `18.x` | Plan major React 19 upgrade in a dedicated tested branch |
| **Validation** | `zod` | `^4.6.7` | Cleared `GHSA-mrhx-c7xc-m3w5` (memory exhaustion DoS) |
| **Database / Auth** | `@supabase/supabase-js` | `^2.107.0` | All `public.*` tables enforce RLS + `is_active = true` |
| **Rate Limit / Queue** | `@upstash/ratelimit`, `@upstash/redis`, `@upstash/qstash` | Latest minor | Trusted edge IP + IPv6 `/64` quota keys |
| **Email Alerts** | `resend` | `^6.16.0` | 6s timeout + `next/server` `after()` non-blocking dispatch |
| **CI Scanners** | CodeQL + Trivy (`v0.36.0` SHA-pinned) + `vet-repo.mjs` | Weekly Monday `06:00 UTC` + PR/push | Review `.trivyignore.yaml` monthly |

## 2. Admin Subdomain & Edge Security Variables (Vercel Production)

| Variable | Purpose | Required in Prod? |
| :--- | :--- | :--- |
| `ADMIN_SUBDOMAIN_HOST` | Dedicated admin hostname (e.g., `desk.prodealindustries.com`). Public domain returns `404` on `/admin*` and `/api/admin*`. | Recommended (Option A) |
| `NEXT_PUBLIC_ADMIN_SUBDOMAIN_HOST` | Same hostname as above, so Supabase invite redirects in `InviteInterceptor` open directly on the admin subdomain. | Pair with `ADMIN_SUBDOMAIN_HOST` |
| `SECURITY_ALERT_EMAIL` | Recipient inbox for breach/lockout/probe alerts (defaults to `prodealsystems@hotmail.com`). | Recommended |
| `SECURITY_ALERT_FROM` | Verified Resend sender address for security alerts. | Optional |
| `CLOUDFLARE_ORIGIN_SECRET` | Optional origin lock header (`x-origin-edge-secret`) when fronted by Cloudflare proxy. | Optional |
| `CRON_SECRET` | Fail-closed Bearer secret for `/api/cron/retry-whatsapp`. | **Required** |

## 3. Monthly Maintenance Procedure

1. Run `npm outdated` and review security advisories (`npm audit --omit=dev --audit-level=high`).
2. Apply backward-compatible patch/minor updates in a dedicated commit; never install `-rc` / `-beta` / `-canary` tags in production dependencies.
3. Review `.trivyignore.yaml` and expire any resolved exceptions.
4. Confirm Vercel Node.js runtime, `.github/workflows/ci.yml` (`node-version: '22'`), and local Node stay aligned.
5. Run the full verification gate before pushing:
   ```bash
   npm run verify
   npm audit --omit=dev --audit-level=high
   npm run build
   ```
