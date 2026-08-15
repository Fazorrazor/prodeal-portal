---
description: 
---

# Workflow: New API Route

## Steps

1. State the route path, HTTP method, and which actor calls it
   (guest/anon, authenticated staff, or internal server-to-server)

2. Write the Zod input schema FIRST in lib/validators/ — confirm
   with the developer before touching the route file

3. Scaffold the route handler in this exact order:
   a. Rate limit check (Upstash) — return 429 if exceeded
   b. Zod validation of request body — return 400 with field errors
   c. Auth check IF this is an /admin route (supabase.auth.getUser)
   d. Database operation using the correct client:
      - anon key client for public routes
      - service role client ONLY for admin routes
   e. Return consistent shape: { data } on success, { error } on failure

4. Confirm the response never exposes raw Supabase errors, Postgres
   error codes, or stack traces

5. Add the route to the API route map comment block at the top of
   the file — keep the master list in app/api/README.md up to date

6. State which RLS policy protects the database operation this
   route performs — if none exists yet, flag it as a required task