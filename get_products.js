const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://abfphaytysoeghuzisiw.supabase.co',
  'sb_publishable_0CY2oRUrkqchXqQ0wjgmDg_52nTF_O9'
);

async function main() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

main();
