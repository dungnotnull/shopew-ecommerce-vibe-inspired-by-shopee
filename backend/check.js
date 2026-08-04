const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Products:', await prisma.product.count());
}
main().then(() => prisma.$disconnect());
