---
description: 
---

# Workflow: Debug Supabase RLS Issue

## Steps

1. State the exact symptom:
   - Which table is affected?
   - Which operation: SELECT, INSERT, UPDATE, DELETE?
   - Which user role: anon, authenticated staff, or admin?
   - What was returned vs what was expected?

2. Check which Supabase client is being used in the affected code:
   - createBrowserClient (anon key — RLS APPLIES)
   - createServerClient with service role key (RLS BYPASSED)
   - If the wrong client is used, that is the bug — fix it first

3. List all RLS policies currently on the table by querying:
   SELECT policyname, cmd, roles, qual, with_check
   FROM pg_policies WHERE tablename = 'your_table';

4. Simulate the failing query as the correct role:
   - For anon: set role anon; then run the query
   - For authenticated: set role authenticated;
     set local request.jwt.claims to '{"sub":"user-uuid"}';

5. Common RLS failure patterns to check in order:
   a. Policy exists but uses auth.uid() and the client is anon
   b. Staff policy filters by division_id but the staff record
      has a null division_id in the database
   c. Admin policy checks for role = 'admin' but the staff_members
      row has a different casing or value
   d. INSERT policy WITH CHECK is too restrictive
   e. Multiple conflicting policies on the same table/operation

6. After identifying the root cause, write the fix as a new
   migration file — never alter policies directly in the dashboard
   without a corresponding migration file in source control