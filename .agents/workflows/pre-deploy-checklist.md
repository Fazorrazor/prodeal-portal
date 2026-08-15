---
description: 
---

# Workflow: Pre-Deploy Checklist

Run through every item. Do not mark done until verified.

## Environment & Secrets
- [ ] All required env vars are set in Vercel dashboard (not just .env.local)
- [ ] SUPABASE_SERVICE_ROLE_KEY is NOT in any client bundle
  (run: grep -r "SERVICE_ROLE" .next/ — should return nothing)
- [ ] META_WA_ACCESS_TOKEN is set and the token has not expired
- [ ] UPSTASH_REDIS_REST_URL and TOKEN are set

## Security
- [ ] Every new API route has rate limiting applied
- [ ] Every new API route validates input with Zod before db operations
- [ ] Every new /admin route is covered by middleware.ts matcher
- [ ] File upload route still enforces MIME type + 10MB limit server-side
- [ ] No console.log statements left that output user data or secrets

## Database
- [ ] All new migrations have been applied to production Supabase
  (run: supabase db push)
- [ ] New tables have RLS enabled and policies written
- [ ] TypeScript types regenerated after schema changes

## UX Smoke Test (do these manually in a preview deployment)
- [ ] Quote Builder opens and closes correctly on mobile (390px)
- [ ] All 4 division forms submit without error
- [ ] Tracking UUID is displayed after submission and copy works
- [ ] /track/[trackingId] shows correct status for a test inquiry
- [ ] Admin login works and redirects correctly
- [ ] Admin ticket list loads with correct division filtering
- [ ] File upload rejects files over 10MB with a clear error message
- [ ] File upload rejects disallowed file types with a clear error message

## Performance
- [ ] Homepage ISR revalidation is set (not accidentally set to 0)
- [ ] /divisions/bowls revalidate is 300 (not longer)
- [ ] /track/ routes have cache: 'no-store'
- [ ] No large unoptimised images — all using next/image with sizes prop