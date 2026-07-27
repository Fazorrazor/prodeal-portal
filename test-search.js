const Fuse = require('fuse.js');
const list = [
  { name: 'Dessini K11 Universal Waterproof Coating', sku: 'DES-001' },
  { name: 'Dessini Anti-Rust Conversion Agent', sku: 'DES-002' }
];
const fuse = new Fuse(list, {
  keys: ['name'],
  useExtendedSearch: true,
  threshold: 0.4
});

const q = 'Dessini Coating';
const terms = q.split(/\s+/).filter(Boolean);

const searchObj = {
  $and: terms.map(term => ({ name: term }))
};

console.log(JSON.stringify(fuse.search(searchObj), null, 2));
