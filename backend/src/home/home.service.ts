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
      where: { discountPercentage: { gt: 0 } },
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
        discountPercentage: product.discountPercentage,
        soldCount: product.soldCount,
        stock: totalStock, // Actual total stock instead of 100
        thumbnailUrl: product.skus[0]?.thumbnailUrl || null,
      };
    });
  }

  async getDailyDiscover(page: number = 1, limit: number = 20) {
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

    const mapped = products.map(p => ({
      id: p.id,
      name: p.name,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      discountPercentage: p.discountPercentage,
      rating: p.rating,
      soldCount: p.soldCount,
      likeCount: p.likeCount,
      isMall: p.isMall,
      isPreferred: p.isPreferred,
      thumbnailUrl: p.skus[0]?.thumbnailUrl || null,
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
