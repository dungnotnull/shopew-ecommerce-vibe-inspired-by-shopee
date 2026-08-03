const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: 1, email: 'admin@shopew.com', role: 'SELLER' },
  'super-secret-jwt-key'
);

async function run() {
  const payload = {
    name: 'Test No Variant 4',
    description: 'ABC',
    categoryId: 1,
    priceMin: 150000,
    priceMax: 150000,
    discountPercentage: 0,
    isMall: false,
    isPreferred: true,
    images: [],
    variantGroups: [],
    skus: []
  };

  const res = await fetch('http://localhost:3000/api/seller/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('Create Response:', data);

  const getRes = await fetch('http://localhost:3000/api/seller/products', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const getData = await getRes.json();
  console.log('Get Response length:', getData.length);
  if (getData.length > 0) {
     console.log('First product skus length:', getData[0].skus?.length);
     console.log('First product sku:', getData[0].skus?.[0]);
  }
}
run();
