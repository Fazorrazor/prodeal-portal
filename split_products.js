const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://abfphaytysoeghuzisiw.supabase.co',
  'sb_secret_MJkN04WbALDsLDCeGsFisg_4dRT_k1E'
);

async function main() {
  const originalId = '62b6b5f8-c6a8-46bf-aee6-a5969b054810';

  // Fetch the original to clone properties
  const { data: original, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', originalId)
    .single();

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  // 1. Update the original to be "Sand Fixing Agent"
  const { error: updateErr } = await supabase
    .from('products')
    .update({
      name: 'Sand Fixing Agent',
      sku: 'CHEM-SFA-03',
      description: 'Advanced sand fixing agent compound.',
      image_path: null // User will generate new images
    })
    .eq('id', originalId);

  if (updateErr) {
    console.error('Update error:', updateErr);
    return;
  }
  console.log('Updated original product to Sand Fixing Agent');

  // 2. Insert new product "Self Leveling Sealant"
  const { data: newProduct, error: insertErr } = await supabase
    .from('products')
    .insert({
      division_id: original.division_id,
      sku: 'CHEM-SLS-04',
      name: 'Self Leveling Sealant',
      description: 'High-performance self-leveling sealant.',
      category: original.category,
      metadata: original.metadata,
      image_path: null, // User will generate new images
      is_active: original.is_active,
      sort_order: original.sort_order + 1
    })
    .select();

  if (insertErr) {
    console.error('Insert error:', insertErr);
    return;
  }
  
  console.log('Inserted Self Leveling Sealant product', newProduct);
}

main();
