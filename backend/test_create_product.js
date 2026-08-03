const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const p = await prisma.product.create({
      data: {
        shopId: 1, // Assume shop 1 exists
        categoryId: 1, // Assume category 1 exists
        name: 'Test Product No Variant',
        description: 'Test',
        priceMin: 10000,
        priceMax: 10000,
        images: ['img.png'],
      }
    });

    const sku = await prisma.sKU.create({
      data: {
        productId: p.id,
        price: 10000,
        originalPrice: 10000,
        stock: 50,
        tierIndex: [],
        skuCode: 'TEST-SKU-1',
      }
    });
    console.log("SUCCESS:", p.id, sku.id);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
