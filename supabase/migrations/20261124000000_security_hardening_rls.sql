-- ============================================================================
-- Security Hardening Migration (Applied Live via Supabase MCP)
-- Non-destructive ALTER POLICY + private schema SECURITY DEFINER helper
-- ============================================================================

-- 1. Index staff_members.auth_user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_staff_members_auth_user_id
  ON public.staff_members (auth_user_id);

-- 2. Create non-exposed private schema and active-staff role helper
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.staff_members
  WHERE auth_user_id = (SELECT auth.uid())
    AND is_active = true
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION private.get_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.get_user_role() FROM anon;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO service_role;

-- 3. Harden legacy public functions & revoke direct public/anon/authenticated RPC access
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.staff_members
  WHERE auth_user_id = (SELECT auth.uid())
    AND is_active = true
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO service_role;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_db_table_stats'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.get_db_table_stats() FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.get_db_table_stats() FROM anon;
    REVOKE EXECUTE ON FUNCTION public.get_db_table_stats() FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.get_db_table_stats() TO service_role;
    ALTER FUNCTION public.get_db_table_stats() SET search_path = '';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'match_anomalies'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.match_anomalies(public.vector, double precision, integer) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.match_anomalies(public.vector, double precision, integer) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.match_anomalies(public.vector, double precision, integer) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.match_anomalies(public.vector, double precision, integer) TO service_role;
    ALTER FUNCTION public.match_anomalies(public.vector, double precision, integer) SET search_path = '';
  END IF;
END $$;

-- 4. Close anonymous read exposure on legacy ops_network_traces & lock ops_network_embeddings
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ops_network_traces'
      AND policyname = 'Anon can read ops network traces'
  ) THEN
    ALTER POLICY "Anon can read ops network traces" ON public.ops_network_traces
      USING (false);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'ops_network_embeddings'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ops_network_embeddings'
      AND policyname = 'Service Role manages ops network embeddings'
  ) THEN
    CREATE POLICY "Service Role manages ops network embeddings" ON public.ops_network_embeddings
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 5. Tighten inquiries RLS in-place (is_active = true, WITH CHECK restored, cached auth.uid())
ALTER POLICY "staff_select_own_division" ON public.inquiries
  USING (
    division_id = ANY(
      ARRAY(
        SELECT unnest(division_ids)
        FROM public.staff_members
        WHERE auth_user_id = (SELECT auth.uid())
          AND is_active = true
      )
    )
  );

ALTER POLICY "staff_update_own_division" ON public.inquiries
  USING (
    division_id = ANY(
      ARRAY(
        SELECT unnest(division_ids)
        FROM public.staff_members
        WHERE auth_user_id = (SELECT auth.uid())
          AND is_active = true
      )
    )
  )
  WITH CHECK (
    division_id = ANY(
      ARRAY(
        SELECT unnest(division_ids)
        FROM public.staff_members
        WHERE auth_user_id = (SELECT auth.uid())
          AND is_active = true
      )
    )
  );

ALTER POLICY "admin_select_all" ON public.inquiries
  USING ((SELECT private.get_user_role()) = 'admin');

ALTER POLICY "admin_update_all" ON public.inquiries
  USING ((SELECT private.get_user_role()) = 'admin')
  WITH CHECK ((SELECT private.get_user_role()) = 'admin');

-- 6. Tighten staff_members, divisions, products, inquiry_events, support_tickets, system_error_logs
ALTER POLICY "staff_select_self" ON public.staff_members
  USING (auth_user_id = (SELECT auth.uid()) AND is_active = true);

ALTER POLICY "admin_all_staff" ON public.staff_members
  USING ((SELECT private.get_user_role()) = 'admin')
  WITH CHECK ((SELECT private.get_user_role()) = 'admin');

ALTER POLICY "admin_write_divisions" ON public.divisions
  USING ((SELECT private.get_user_role()) = 'admin')
  WITH CHECK ((SELECT private.get_user_role()) = 'admin');

ALTER POLICY "admin_write_products" ON public.products
  USING ((SELECT private.get_user_role()) = 'admin')
  WITH CHECK ((SELECT private.get_user_role()) = 'admin');

ALTER POLICY "admin_all_events" ON public.inquiry_events
  USING ((SELECT private.get_user_role()) = 'admin')
  WITH CHECK ((SELECT private.get_user_role()) = 'admin');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'inquiry_events'
      AND policyname = 'staff_select_own_division_events'
  ) THEN
    CREATE POLICY "staff_select_own_division_events" ON public.inquiry_events
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.inquiries i
          WHERE i.id = inquiry_events.inquiry_id
            AND i.division_id = ANY(
              ARRAY(
                SELECT unnest(division_ids)
                FROM public.staff_members
                WHERE auth_user_id = (SELECT auth.uid())
                  AND is_active = true
              )
            )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'inquiry_events'
      AND policyname = 'staff_insert_own_division_events'
  ) THEN
    CREATE POLICY "staff_insert_own_division_events" ON public.inquiry_events
      FOR INSERT TO authenticated
      WITH CHECK (
        actor_id = (SELECT auth.uid())
        AND EXISTS (
          SELECT 1
          FROM public.inquiries i
          WHERE i.id = inquiry_events.inquiry_id
            AND i.division_id = ANY(
              ARRAY(
                SELECT unnest(division_ids)
                FROM public.staff_members
                WHERE auth_user_id = (SELECT auth.uid())
                  AND is_active = true
              )
            )
        )
      );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_tickets' AND policyname = 'Admins can view support tickets') THEN
    ALTER POLICY "Admins can view support tickets" ON public.support_tickets
      TO authenticated
      USING ((SELECT private.get_user_role()) = 'admin');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_tickets' AND policyname = 'Admins can update support tickets') THEN
    ALTER POLICY "Admins can update support tickets" ON public.support_tickets
      TO authenticated
      USING ((SELECT private.get_user_role()) = 'admin')
      WITH CHECK ((SELECT private.get_user_role()) = 'admin');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'support_tickets' AND policyname = 'Admins can delete support tickets') THEN
    ALTER POLICY "Admins can delete support tickets" ON public.support_tickets
      TO authenticated
      USING ((SELECT private.get_user_role()) = 'admin');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_error_logs' AND policyname = 'Admins can view error logs') THEN
    ALTER POLICY "Admins can view error logs" ON public.system_error_logs
      TO authenticated
      USING ((SELECT private.get_user_role()) = 'admin');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_error_logs' AND policyname = 'Admins can view system error logs') THEN
    ALTER POLICY "Admins can view system error logs" ON public.system_error_logs
      TO authenticated
      USING ((SELECT private.get_user_role()) = 'admin');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Restrict upload types') THEN
    ALTER POLICY "Restrict upload types" ON storage.objects
      WITH CHECK (
        bucket_id = 'inquiry-attachments'
        AND (metadata->>'mimetype') IN (
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
          'application/postscript',
          'application/illustrator',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        AND (metadata->>'size')::int <= 10485760
      );
  END IF;
END $$;
