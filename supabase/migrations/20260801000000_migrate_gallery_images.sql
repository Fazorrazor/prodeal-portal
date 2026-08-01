ALTER TABLE products ADD COLUMN gallery_images TEXT[] DEFAULT '{}';

UPDATE products
SET gallery_images = ARRAY(
  SELECT jsonb_array_elements_text(metadata->'gallery_images')
)
WHERE metadata ? 'gallery_images' AND jsonb_typeof(metadata->'gallery_images') = 'array';

UPDATE products
SET metadata = metadata - 'gallery_images'
WHERE metadata ? 'gallery_images';
