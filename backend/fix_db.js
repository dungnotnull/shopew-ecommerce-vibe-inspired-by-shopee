const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (p.images && Array.isArray(p.images)) {
      const newImages = p.images.map(img => img.replace(/^\/uploads\//, '/api/uploads/'));
      if (JSON.stringify(newImages) !== JSON.stringify(p.images)) {
        await prisma.product.update({ where: { id: p.id }, data: { images: newImages } });
        console.log('Updated product', p.id);
      }
    }
  }
  const skus = await prisma.sKU.findMany();
  for (const sku of skus) {
    if (sku.thumbnailUrl && sku.thumbnailUrl.startsWith('/uploads/')) {
      await prisma.sKU.update({ where: { id: sku.id }, data: { thumbnailUrl: sku.thumbnailUrl.replace(/^\/uploads\//, '/api/uploads/') } });
      console.log('Updated SKU', sku.id);
    }
  }
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (cat.imageUrl && cat.imageUrl.startsWith('/uploads/')) {
      await prisma.category.update({ where: { id: cat.id }, data: { imageUrl: cat.imageUrl.replace(/^\/uploads\//, '/api/uploads/') } });
      console.log('Updated Category', cat.id);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
