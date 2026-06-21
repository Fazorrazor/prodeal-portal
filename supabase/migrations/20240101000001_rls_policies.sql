ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guest_insert_inquiry" ON inquiries
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "guest_select_own_inquiry" ON inquiries
  FOR SELECT TO anon
  USING (false);

CREATE POLICY "staff_select_own_division" ON inquiries
  FOR SELECT TO authenticated
  USING (
    division_id = ANY(
      ARRAY(
        SELECT unnest(division_ids) FROM staff_members
        WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "admin_select_all" ON inquiries
  FOR SELECT TO authenticated
  USING (
    get_user_role() = 'admin'
  );

CREATE POLICY "staff_update_own_division" ON inquiries
  FOR UPDATE TO authenticated
  USING (
    division_id = ANY(
      ARRAY(
        SELECT unnest(division_ids) FROM staff_members
        WHERE auth_user_id = auth.uid()
      )
    )
  )
  WITH CHECK (true);


ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_self" ON staff_members
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM staff_members WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "admin_all_staff" ON staff_members
  FOR ALL TO authenticated
  USING (
    get_user_role() = 'admin'
  );

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_products" ON products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "admin_write_products" ON products
  FOR ALL TO authenticated
  USING (
    get_user_role() = 'admin'
    
  );
