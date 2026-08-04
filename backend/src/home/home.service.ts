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

  async getFlashSale() {
    // Return products with discount > 0
    const products = await this.prisma.product.findMany({
      where: { skus: { some: { isDiscount: true } } },
      take: 10,
      orderBy: { soldCount: 'desc' },
      include: {
        skus: true
      }
    });

    return products.map(product => {
      const totalStock = product.skus.reduce((sum, sku) => sum + sku.stock, 0);
      return {
        id: product.id,
        name: product.name,
        priceMin: product.priceMin,
        priceMax: product.priceMax,
        promotionalPrice: product.promotionalPrice,
        discountPercentage: Math.max(0, ...product.skus.map(s => s.discountPercentage || 0)),
        soldCount: product.soldCount,
        stock: totalStock, // Actual total stock instead of 100
        thumbnailUrl: product.skus[0]?.thumbnailUrl || null,
        images: product.images,
      };
    });
  }

  async getDailyDiscover(page: number = 1, limit: number = 10, userId?: number) {
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

    const mapped = products.map(p => ({
      id: p.id,
      name: p.name,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      discountPercentage: p.skus[0]?.discountPercentage || 0,
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
    }));

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
