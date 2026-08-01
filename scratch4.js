const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim().replace(/"/g, '') : '';
const key = keyMatch ? keyMatch[1].trim().replace(/"/g, '') : '';

fetch(`${url}/rest/v1/products?select=name,metadata&limit=100`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(r => r.json())
.then(data => {
  const withImages = data.filter(d => d.metadata && d.metadata.images);
  console.log('Products with metadata.images:', withImages.length);
  if (withImages.length > 0) {
    console.log(JSON.stringify(withImages[0], null, 2));
  }
})
.catch(e => console.error(e));
