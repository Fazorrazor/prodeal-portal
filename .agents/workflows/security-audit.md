---
description: 
---

# Workflow: Security Audit

## Steps

1. Scan for exposed secrets:
   grep -r "SERVICE_ROLE\|WA_ACCESS_TOKEN\|REDIS_TOKEN" src/
   Any result in a 'use client' file or non-API route is a critical issue

2. Verify file upload security — all three layers must be present:
   a. react-dropzone accept prop in FileUploadZone.tsx
   b. MIME + size check in /api/upload/route.ts
   c. Supabase Storage policy on inquiry-attachments bucket
   Flag if any layer is missing

3. Verify rate limiting is applied to these routes:
   - POST /api/inquiries
   - POST /api/upload
   - POST /api/whatsapp
   Flag any route that is missing Upstash rate limit check

4. Check all /admin API routes for auth verification:
   Every /api/admin/* handler must call supabase.auth.getUser()
   and return 401 if no valid session — the middleware is defence-in-depth,
   not the only protection

5. Check RLS is enabled on all tables:
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public';
   Any table with rowsecurity = false is a finding

6. Check for prompt injection surface in the WhatsApp message builder:
   User-supplied fields (contact_name, company_name, notes) must be
   sanitised before being embedded in the WhatsApp message body —
   strip markdown control characters that could manipulate the message

7. Produce a findings report with severity: Critical / High / Medium / Low
   Do not attempt to fix all findings in one task — list them first