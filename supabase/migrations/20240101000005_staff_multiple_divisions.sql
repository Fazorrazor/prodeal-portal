-- Drop old policies that depend on division_id
DROP POLICY IF EXISTS "staff_select_own_division" ON inquiries;
DROP POLICY IF EXISTS "staff_update_own_division" ON inquiries;

-- Add the new array column
ALTER TABLE staff_members ADD COLUMN division_ids uuid[] DEFAULT '{}';

-- Migrate existing data
UPDATE staff_members 
SET division_ids = ARRAY[division_id] 
WHERE division_id IS NOT NULL;

-- Drop old column and add index for array searches
ALTER TABLE staff_members DROP COLUMN division_id;

CREATE INDEX idx_staff_members_division_ids ON staff_members USING GIN (division_ids);

-- Recreate policies with array logic
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
