INSERT INTO divisions (slug, display_name, type) VALUES
  ('signages',  '3D Signages',            'project'),
  ('printing',  'Souvenirs & Printing',   'order'),
  ('bowls',     'Disposable Bowls',       'inventory'),
  ('chemicals', 'Chemicals',              'technical')
ON CONFLICT (slug) DO NOTHING;
