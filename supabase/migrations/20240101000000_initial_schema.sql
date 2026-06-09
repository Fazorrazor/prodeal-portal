CREATE TABLE divisions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  type         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE staff_members (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL,
  division_id    uuid REFERENCES divisions(id),
  role           TEXT DEFAULT 'agent',
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_uuid   TEXT UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(8), 'hex'),
  division_id     uuid REFERENCES divisions(id) NOT NULL,
  assigned_staff  uuid REFERENCES staff_members(id),
  contact_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT NOT NULL,
  company_name    TEXT,
  inquiry_payload JSONB NOT NULL DEFAULT '{}',
  attachments     JSONB DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'new',
  internal_notes  TEXT,
  wa_sent_at      TIMESTAMPTZ,
  wa_message_id   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_inquiries_division    ON inquiries(division_id);
CREATE INDEX idx_inquiries_status      ON inquiries(status);
CREATE INDEX idx_inquiries_tracking    ON inquiries(tracking_uuid);
CREATE INDEX idx_inquiries_created_at  ON inquiries(created_at DESC);

CREATE TABLE inquiry_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id   uuid REFERENCES inquiries(id) ON DELETE CASCADE,
  actor_id     uuid,
  event_type   TEXT NOT NULL,
  payload      JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id   uuid REFERENCES divisions(id) NOT NULL,
  sku           TEXT,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  metadata      JSONB DEFAULT '{}',
  image_path    TEXT,
  is_active     BOOLEAN DEFAULT true,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
