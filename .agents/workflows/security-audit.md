---
description: Hardened security audit and pre-push verification checklist for Pro Deal Portal
---

# Workflow: Security Audit (Guidance Mode)

Apply `.agents/skills/security-audit/SKILL.md` (Guidance Mode) and `.agents/skills/supabase-postgres-best-practices/SKILL.md`.

## Automated Gates (Run First)
```bash
npm run verify
npm audit --omit=dev --audit-level=high
```

## Manual Trust-Boundary Checklist

1. **Secrets & Client Isolation:**
   - Confirm zero server secrets (`SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `META_WA_ACCESS_TOKEN`, `CRON_SECRET`, `RESEND_API_KEY`) are referenced inside `'use client'` components.
   - Confirm `lib/logger.ts` redacts sensitive keys via `redactSensitiveMetadata()` before writing to console or `system_error_logs`.

2. **File Upload Defense-in-Depth (All 4 Layers):**
   - `FileUploadZone.tsx` `accept` prop excludes `image/svg+xml`.
   - `lib/upload/validateFile.ts` enforces MIME allowlist + 10 MB cap + `verifyFileMagicBytes()`.
   - `app/api/upload/route.ts` validates `divisionSlug` with `isValidDivisionSlug()` and strips traversal chars.
   - Supabase Storage policy on `inquiry-attachments` excludes `image/svg+xml` and caps size at 10 MB.

3. **Edge IP & Rate Limiting:**
   - All rate-limited routes (`/api/upload`, `/api/inquiries/[id]`, `/api/search`, `/api/admin/*`, `submitInquiry`, `submitSupportRequest`) key limits via `extractTrustedClientIp(...).quotaKey` (never raw leftmost `x-forwarded-for`).

4. **Admin Auth & Deactivation Enforcement:**
   - All `/api/admin/*` handlers, destructive Server Actions, and admin RSC layouts authorize via `getVerifiedActiveStaff()` (`supabase.auth.getUser()` + `staff.is_active === true`).
   - Deactivating staff via `PATCH /api/admin/staff/[id]` also bans the user in Supabase Auth.

5. **PostgreSQL RLS & Privileges:**
   - Verify all `public.*` tables have `rowsecurity = true`.
   - Verify `public.get_user_role()` uses `SET search_path = ''`, `(SELECT auth.uid())`, and `is_active = true`.
   - Verify `staff_update_own_division` enforces matching division membership in both `USING` and `WITH CHECK`.

6. **Decommissioned Surfaces:**
   - Confirm `/ops`, `lib/ops`, and `/api/chat` remain absent and `proxy.ts` fast-404s `/ops*` and `/api/chat*`.
