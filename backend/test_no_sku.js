const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const shop = await prisma.shop.findFirst();
  if (!shop) { console.log('No shop'); return; }

  const p = await prisma.product.create({
    data: {
      shopId: shop.id,
      categoryId: 1, // Assume 1 exists
      name: 'No Variant Product FE Bug Test',
      description: 'Desc',
      priceMin: 120000,
      priceMax: 120000,
      stock: 50, // wait! Prisma Product schema DOES NOT HAVE stock!
      images: [],
    }
  });

  console.log('Created product without SKU:', p);
}
run();
