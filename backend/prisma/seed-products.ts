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

const sampleImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
  'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800',
];

async function main() {
  console.log('Cleaning up old mock data...');
  await prisma.flashSaleItem.deleteMany({});
  
  // Delete old mock sellers (which cascades to shops, products, etc.)
  await prisma.user.deleteMany({
    where: { email: { startsWith: 'seller' } }
  });

  console.log('Seeding Mock Users and Shops...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const sellers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `seller${i}@shopew.com` },
      update: {},
      create: {
        email: `seller${i}@shopew.com`,
        password: hashedPassword,
        fullName: `Shopew Seller ${i}`,
        role: Role.SELLER,
        phone: `098765430${i}`,
        shop: {
          create: {
            name: `Gian hàng Official ${i}`,
            description: `Shop chính hãng ${i} cung cấp các sản phẩm tốt nhất.`,
            isMall: i === 1,
            isPreferred: i === 2,
            rating: 4.5 + (i * 0.1),
          }
        }
      },
      include: { shop: true }
    });
    if (user.shop) sellers.push(user.shop);
  }

  console.log('Seeding 30 Products...');
  
  let fsSession = await prisma.flashSaleSession.findFirst({ where: { isActive: true }});
  if (!fsSession) {
    fsSession = await prisma.flashSaleSession.create({
      data: {
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24h
        isActive: true
      }
    });
  }

  for (let i = 1; i <= 30; i++) {
    const shop = sellers[i % sellers.length];
    const categoryId = i % 2 === 0 ? 10 : (i % 3 === 0 ? 1 : 11);
    const basePrice = Math.floor(Math.random() * 500000) + 100000;
    
    const images = [
      sampleImages[i % sampleImages.length],
      sampleImages[(i + 1) % sampleImages.length]
    ];

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: categoryId,
        name: `Sản Phẩm Mẫu Cao Cấp Siêu Xịn Số ${i} - Chính Hãng 100%`,
        description: `Đây là thông tin mô tả chi tiết của Sản Phẩm ${i}. Chất lượng tuyệt vời, độ bền cực cao, bảo hành 12 tháng. Mua ngay để nhận ưu đãi!`,
        priceMin: basePrice,
        priceMax: basePrice + 50000,
        promotionalPrice: basePrice - 20000,
        images: images,
        rating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0 - 5.0
        soldCount: Math.floor(Math.random() * 5000),
        likeCount: Math.floor(Math.random() * 1000),
        viewCount: Math.floor(Math.random() * 10000),
        isMall: shop.isMall,
        isPreferred: shop.isPreferred,
        attributes: { "Thương hiệu": "Shopew Brand", "Chất liệu": "Cao cấp" },
        
        variantGroups: {
          create: [
            {
              name: 'Màu sắc',
              options: { create: [{ value: 'Đen' }, { value: 'Trắng' }] }
            }
          ]
        }
      },
      include: { variantGroups: { include: { options: true } } }
    });

    const sku1 = await prisma.sKU.create({
      data: {
        productId: product.id,
        skuCode: `SKU-${product.id}-B`,
        price: basePrice - 20000,
        originalPrice: basePrice,
        stock: Math.floor(Math.random() * 200) + 10,
        isDiscount: true,
        discountPercentage: 15,
        tierIndex: [0], // First option
        thumbnailUrl: images[0]
      }
    });

    const sku2 = await prisma.sKU.create({
      data: {
        productId: product.id,
        skuCode: `SKU-${product.id}-W`,
        price: basePrice + 30000,
        originalPrice: basePrice + 50000,
        stock: Math.floor(Math.random() * 200) + 10,
        isDiscount: false,
        discountPercentage: 0,
        tierIndex: [1], // Second option
        thumbnailUrl: images[1]
      }
    });

    if (i <= 6) {
      await prisma.flashSaleItem.create({
        data: {
          sessionId: fsSession.id,
          productId: product.id,
          skuId: sku1.id,
          promotionalStock: 50,
          soldCount: Math.floor(Math.random() * 40),
          discountPercentage: 40
        }
      });
    }
  }

  console.log('✅ Created 30 products successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
