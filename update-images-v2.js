const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const updates = [
    {
      sku: 'CHEM-ARC-07', // Rust Conversion Agent
      images: [
        '/assets/chemicals/gallery/IMG-20260719-WA0000.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0003.jpg'
      ]
    },
    {
      sku: 'CHEM-TIR-06', // Thermal Insulation & Sunscreen Roof Coating
      images: [
        '/assets/chemicals/gallery/IMG-20260719-WA0001.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0002.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0012.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0014.jpg'
      ]
    },
    {
      sku: 'CHEM-RBR-02', // Liquid Rubber Roof Waterproofing
      images: [
        '/assets/chemicals/gallery/IMG-20260719-WA0013.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0008.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0009.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0010.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0011.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0018.jpg'
      ]
    },
    {
      sku: 'CHEM-K11-05', // K11 Universal Waterproof Coating
      images: [
        '/assets/chemicals/gallery/IMG-20260719-WA0004.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0005.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0016.jpg'
      ]
    },
    {
      sku: 'CHEM-SFA-03', // Sand Fixing Agent
      images: [
        '/assets/chemicals/gallery/IMG-20260719-WA0006.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0017.jpg'
      ]
    },
    {
      sku: 'CHEM-TWC-04', // Transparent Waterproof Coating
      images: [
        '/assets/chemicals/gallery/IMG-20260719-WA0007.jpg',
        '/assets/chemicals/gallery/IMG-20260719-WA0015.jpg'
      ]
    },
    {
      sku: 'CHEM-EPX-01', // Epoxy Sand Floor Paint
      images: []
    },
    {
      sku: 'CHEM-SLS-04', // Self Leveling Sealant
      images: []
    },
    {
      sku: 'CHEM-TAL-08', // Tile Adhesive Liquid Additive
      images: []
    }
  ];

  for (const update of updates) {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('sku', update.sku)
      .single();

    if (product) {
      const metadata = product.metadata || {};
      metadata.gallery_images = update.images;

      const { error } = await supabase
        .from('products')
        .update({ metadata })
        .eq('sku', update.sku);

      if (error) {
        console.error(`Error updating ${update.sku}:`, error);
      } else {
        console.log(`Successfully updated ${update.sku} (${update.images.length} images)`);
      }
    } else {
      console.log(`Product ${update.sku} not found`);
    }
  }
}

main();
