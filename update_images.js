const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://abfphaytysoeghuzisiw.supabase.co',
  'sb_secret_MJkN04WbALDsLDCeGsFisg_4dRT_k1E'
);

async function main() {
  // Update Sand Fixing Agent image
  const { error: err1 } = await supabase
    .from('products')
    .update({ image_path: '/assets/chemicals/Sand fixing agent.png' })
    .eq('name', 'Sand Fixing Agent');
    
  if (err1) console.error(err1);
  else console.log('Updated Sand Fixing Agent image');

  // Update Self Leveling Sealant image
  const { error: err2 } = await supabase
    .from('products')
    .update({ image_path: '/assets/chemicals/Self leveling sealant.png' })
    .eq('name', 'Self Leveling Sealant');

  if (err2) console.error(err2);
  else console.log('Updated Self Leveling Sealant image');
}

main();
