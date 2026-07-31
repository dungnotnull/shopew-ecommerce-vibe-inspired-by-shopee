import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = "postgresql://root:rootpassword@localhost:5432/shopew?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Category";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Product";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"SKU"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "SKU";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"ProductVariantGroup"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "ProductVariantGroup";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"ProductVariantOption"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "ProductVariantOption";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Shop"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "Shop";`);
  console.log('Fixed PostgreSQL sequences successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
