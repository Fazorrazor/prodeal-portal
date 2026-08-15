---
description: 
---

# Workflow: Admin Ticket Feature

## Steps

1. Confirm this feature is inside /admin/* — if not, stop and flag it

2. Verify the middleware.ts auth guard covers this route — do not
   add separate auth checks inside the component itself, the middleware
   is the single source of truth

3. Identify which staff role(s) can access this feature:
   - agent: own division's tickets only
   - manager: own division + reporting
   - admin: all divisions, all data

4. Use the Supabase SERVICE ROLE client for admin API routes
   (the anon client respects RLS which may block admin operations)
   The service role client must ONLY be imported in server-side files

5. Apply this UX standard for all admin data tables:
   - Skeleton loader with same column count as real table (10 rows)
   - Empty state with a helpful message, not a blank table
   - Status badges must be color-coded consistently:
     new → red, in_progress → amber, quoted → blue, closed → gray
   - Timestamps displayed in local Ghana time (en-GH locale)
   - Every row must have a direct link to the full ticket detail

6. Any status change or note update must write to inquiry_events
   table as an audit trail entry — never update inquiries silently

7. Confirm this feature does not accidentally expose data from a
   division the logged-in staff member is not assigned to