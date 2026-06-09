INSERT INTO storage.buckets (id, name, public) 
VALUES ('inquiry-attachments', 'inquiry-attachments', false) 
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT DO NOTHING;

-- Storage RLS policy that restricts uploads by MIME type and file size
CREATE POLICY "Restrict upload types" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'inquiry-attachments'
    AND (metadata->>'mimetype') IN (
      'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'application/postscript', 'application/illustrator', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    AND (metadata->>'size')::int <= 10485760
  );

CREATE POLICY "Allow public read product-images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');
