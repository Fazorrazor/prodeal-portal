-- 1. Enable RLS on public tables
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_divisions" ON divisions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_write_divisions" ON divisions FOR ALL TO authenticated USING (get_user_role() = 'admin');

ALTER TABLE inquiry_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_events" ON inquiry_events FOR ALL TO authenticated USING (get_user_role() = 'admin');

-- 2. Restrict guest insert inquiry
DROP POLICY IF EXISTS "guest_insert_inquiry" ON inquiries;
CREATE POLICY "guest_insert_inquiry" ON inquiries
  FOR INSERT TO anon
  WITH CHECK (status = 'new' AND assigned_staff IS NULL);

-- 3. Restrict staff update inquiry
DROP POLICY IF EXISTS "staff_update_own_division" ON inquiries;
CREATE POLICY "staff_update_own_division" ON inquiries
  FOR UPDATE TO authenticated
  USING (
    division_id = (SELECT division_id FROM staff_members WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    division_id = (SELECT division_id FROM staff_members WHERE auth_user_id = auth.uid())
  );

-- 4. Restrict admin update inquiry
DROP POLICY IF EXISTS "admin_update_all" ON inquiries;
CREATE POLICY "admin_update_all" ON inquiries
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- 5. Revoke EXECUTE from anon for get_user_role
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO service_role;

-- 6. Set search_path for SECURITY DEFINER and triggers
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;

-- 7. Drop broad SELECT policy on public bucket to prevent listing
DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;
