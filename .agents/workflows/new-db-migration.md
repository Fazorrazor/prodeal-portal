---
description: 
---

# Workflow: New Database Migration

## Steps

1. State exactly what is changing and why — one sentence

2. Write the migration SQL file in supabase/migrations/ with the
   naming convention: YYYYMMDDHHMMSS_description.sql
   Never write raw SQL directly against the production database

3. For new tables, include in this order:
   a. CREATE TABLE with all columns, types, and constraints
   b. Indexes on foreign keys and any column used in WHERE clauses
   c. updated_at trigger if the table will be updated (not insert-only)
   d. RLS: ALTER TABLE x ENABLE ROW LEVEL SECURITY
   e. RLS policies for each actor: anon, authenticated staff, admin

4. Before finalising, answer these questions explicitly:
   - Can an anon user read this table? Should they?
   - Can an anon user write to this table? Is that intentional?
   - Can a staff member from Division A see Division B's data?
   - Is the service role key needed for any operation on this table?

5. Update the TypeScript types by running:
   supabase gen types typescript --local > lib/supabase/database.types.ts

6. Write one sentence confirming the migration is reversible or
   flag if it contains a destructive operation (DROP, DELETE data)