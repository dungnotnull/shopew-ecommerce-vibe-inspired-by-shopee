import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Master Data (Categories)...');
  
  // Category 1: Thời Trang Nam
  const cat1 = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Thời Trang Nam',
      attributes: { "Chất liệu": "string" }
    }
  });
  
  // Category 11: Áo Thun (Child of 1)
  const cat11 = await prisma.category.upsert({
    where: { id: 11 },
    update: {},
    create: {
      id: 11,
      name: 'Áo Thun',
      parentId: 1,
      attributes: { "Chất liệu": "string", "Kiểu cổ": "string" }
    }
  });

  // Category 10: Điện thoại di động
  const cat10 = await prisma.category.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      name: 'Điện thoại di động',
      attributes: { "RAM": "string", "Thương hiệu": "string" }
    }
  });

  console.log('Seeding Master Data (Banners)...');
  
  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Siêu Sale Thời Trang',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000',
      linkUrl: '/search?category_id=1',
      sortOrder: 1
    }
  });

  await prisma.banner.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Công Nghệ Đỉnh Cao',
      imageUrl: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&q=80&w=2000',
      linkUrl: '/search?category_id=10',
      sortOrder: 2
    }
  });

  console.log('Seeding Master Data (System Admin)...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopew.com' },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@shopew.com',
      password: hashedPassword,
      fullName: 'System Admin',
      phone: '0987654321',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Default system admin initialized successfully: ${admin.email}`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
