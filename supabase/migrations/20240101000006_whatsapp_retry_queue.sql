ALTER TABLE inquiries 
ADD COLUMN wa_status TEXT DEFAULT 'pending',
ADD COLUMN wa_retry_count INT DEFAULT 0;

-- Backfill existing rows so they aren't stuck in pending
UPDATE inquiries SET wa_status = 'sent' WHERE wa_message_id IS NOT NULL;
UPDATE inquiries SET wa_status = 'failed' WHERE wa_message_id IS NULL AND status != 'new';

CREATE INDEX idx_inquiries_wa_status ON inquiries(wa_status);
