-- Migration to add soft delete functionality for divisions
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Deactivate 3D Signages and Souvenirs & Printing for now
UPDATE divisions SET is_active = false WHERE slug IN ('signages', 'printing');
