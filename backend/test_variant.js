async function run() {
  const res = await fetch('http://localhost:3000/api/v1/products');
  const payload = await res.json();
  const products = payload.data.data;
  console.log("Total:", products.length);
  
  for (const p of products) {
    const dRes = await fetch(`http://localhost:3000/api/v1/products/${p.id}`);
    const d = await dRes.json();
    const product = d.data;
    if (!product.variantGroups || product.variantGroups.length === 0) {
       console.log(`Product ${product.id} HAS NO VARIANT GROUPS! Name: ${product.name}`);
    }
  }
}
run();
