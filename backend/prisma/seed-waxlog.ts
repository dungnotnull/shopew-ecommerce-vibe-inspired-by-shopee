import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
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
  const email = 'waxlog828@hamham.uk';
  console.log(`Checking user ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { shop: true }
  });

  if (!user) {
    console.error(`User ${email} not found!`);
    return;
  }

  let shop = user.shop;
  if (!shop) {
    console.log(`User has no shop. Creating shop for ${email}...`);
    
    // Check role, must be SELLER or ADMIN
    if (user.role === 'CUSTOMER') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SELLER' }
      });
      console.log(`Upgraded user role to SELLER`);
    }

    shop = await prisma.shop.create({
      data: {
        userId: user.id,
        name: `Gian hàng của ${user.fullName}`,
        description: `Chào mừng đến với gian hàng của ${user.fullName}!`,
        isMall: false,
        isPreferred: true,
        rating: 4.8
      }
    });
  }

  console.log(`Found shop: ${shop.name} (ID: ${shop.id})`);
  console.log(`Creating 10 products for ${email}...`);

  for (let i = 1; i <= 10; i++) {
    const categoryId = i % 2 === 0 ? 10 : (i % 3 === 0 ? 1 : 11);
    const basePrice = Math.floor(Math.random() * 800000) + 200000;
    
    const images = [
      sampleImages[Math.floor(Math.random() * sampleImages.length)],
      sampleImages[Math.floor(Math.random() * sampleImages.length)]
    ];

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: categoryId,
        name: `Sản Phẩm Độc Quyền Của Waxlog Số ${i}`,
        description: `Đây là sản phẩm đặc biệt của shop Waxlog, số lượng có hạn. Chất lượng cực tốt, giá cả phải chăng!`,
        priceMin: basePrice,
        priceMax: basePrice + 100000,
        promotionalPrice: basePrice - 30000,
        images: images,
        rating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0 - 5.0
        soldCount: Math.floor(Math.random() * 2000),
        likeCount: Math.floor(Math.random() * 500),
        viewCount: Math.floor(Math.random() * 5000),
        isMall: shop.isMall,
        isPreferred: shop.isPreferred,
        attributes: { "Thương hiệu": "Waxlog Exclusive", "Tình trạng": "Mới 100%" },
        
        variantGroups: {
          create: [
            {
              name: 'Kích cỡ',
              options: { create: [{ value: 'Nhỏ' }, { value: 'Lớn' }] }
            }
          ]
        }
      },
      include: { variantGroups: { include: { options: true } } }
    });

    const sku1 = await prisma.sKU.create({
      data: {
        productId: product.id,
        skuCode: `WX-SKU-${product.id}-S`,
        price: basePrice - 30000,
        originalPrice: basePrice,
        stock: Math.floor(Math.random() * 100) + 10,
        isDiscount: true,
        discountPercentage: 10,
        tierIndex: [0],
        thumbnailUrl: images[0]
      }
    });

    const sku2 = await prisma.sKU.create({
      data: {
        productId: product.id,
        skuCode: `WX-SKU-${product.id}-L`,
        price: basePrice + 50000,
        originalPrice: basePrice + 100000,
        stock: Math.floor(Math.random() * 100) + 10,
        isDiscount: false,
        discountPercentage: 0,
        tierIndex: [1],
        thumbnailUrl: images[1]
      }
    });
  }

  console.log('✅ Created 10 products successfully for waxlog828@hamham.uk!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
