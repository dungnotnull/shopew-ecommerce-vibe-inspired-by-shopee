import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }



  async getDailyDiscover(page: number = 1, limit: number = 20, userId?: number) {
    const skip = (page - 1) * limit;

    const products = await this.prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { viewCount: 'desc' },
      include: {
        shop: {
          select: { id: true, name: true }
        },
        skus: {
          take: 1
        }
      }
    });

    let userLikedProductIds = new Set<number>();
    if (userId && products.length > 0) {
      const likes = await this.prisma.productLike.findMany({
        where: {
          userId,
          productId: { in: products.map(p => p.id) }
        },
        select: { productId: true }
      });
      userLikedProductIds = new Set(likes.map(l => l.productId));
    }

    // Fetch active flash sale to override prices
    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } }
    });

    let fsMap = new Map();
    if (activeSession && products.length > 0) {
      const fsItems = await this.prisma.flashSaleItem.findMany({
        where: {
          sessionId: activeSession.id,
          productId: { in: products.map(p => p.id) }
        },
        include: { sku: true }
      });
      // Just take the first flash sale item for the product for display purposes
      fsMap = new Map(fsItems.map(i => [i.productId, i]));
    }

    const mapped = products.map(p => {
      let promotionalPrice = p.promotionalPrice;
      let discountPercentage = p.skus[0]?.discountPercentage || 0;
      
      const fs = fsMap.get(p.id);
      if (fs && fs.promotionalStock > 0) {
        promotionalPrice = Math.floor(fs.sku.originalPrice * (1 - fs.discountPercentage / 100));
        discountPercentage = fs.discountPercentage;
      }

      return {
        id: p.id,
        name: p.name,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        promotionalPrice,
        discountPercentage,
        rating: p.rating,
        soldCount: p.soldCount,
        likeCount: p.likeCount,
        isLiked: userLikedProductIds.has(p.id),
        isMall: p.isMall,
        isPreferred: p.isPreferred,
        thumbnailUrl: p.skus[0]?.thumbnailUrl || null,
        images: p.images,
        shopId: p.shopId,
        shopName: p.shop?.name
      };
    });

    const total = await this.prisma.product.count();

    return {
      data: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
