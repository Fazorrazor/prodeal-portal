-- Create indexes for performance optimization
-- These indexes speed up lookups on frequently filtered or sorted columns.

-- 1. Inquiries table indexes
-- The tracking_uuid is used by clients to fetch their specific ticket, so it needs to be O(1) fast.
CREATE INDEX IF NOT EXISTS idx_inquiries_tracking_uuid ON inquiries(tracking_uuid);

-- The admin portal filters inquiries by division and status constantly.
CREATE INDEX IF NOT EXISTS idx_inquiries_division_id ON inquiries(division_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- The admin portal sorts inquiries by newest first.
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- 2. Products table indexes
-- The client-facing catalog filters products by division and active status.
CREATE INDEX IF NOT EXISTS idx_products_division_id ON products(division_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- The catalog also filters products by category within a division.
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
