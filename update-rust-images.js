const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateRustAgent() {
  const sku = 'CHEM-ARC-07';
  const mainImage = '/assets/chemicals/rust-conversion-agent.jpg';
  const galleryImages = [
    '/assets/chemicals/rust-conversion-agent.jpg',
    '/assets/chemicals/rust-conversion-agent-2.jpg'
  ];

  // 1. Get current product
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();

  if (fetchErr || !product) {
    console.error('Failed to fetch product:', fetchErr);
    return;
  }

  // 2. Update metadata
  const metadata = product.metadata || {};
  metadata.gallery_images = galleryImages;

  // 3. Update database
  const { error: updateErr } = await supabase
    .from('products')
    .update({ 
      image_path: mainImage,
      metadata: metadata 
    })
    .eq('sku', sku);

  if (updateErr) {
    console.error('Failed to update product:', updateErr);
  } else {
    console.log(`Successfully updated ${sku} with new images!`);
  }
}

updateRustAgent();
