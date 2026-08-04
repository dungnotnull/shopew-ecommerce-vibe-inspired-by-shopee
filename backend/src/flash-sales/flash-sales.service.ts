import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class FlashSalesService implements OnModuleInit {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async onModuleInit() {
    await this.syncStockToRedis();
  }

  async syncStockToRedis() {
    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } },
      include: { items: true }
    });

    if (activeSession) {
      for (const item of activeSession.items) {
        const key = `flash_sale:${activeSession.id}:sku:${item.skuId}`;
        const exists = await this.redis.exists(key);
        if (!exists) {
          await this.redis.set(key, item.promotionalStock);
        }
      }
    }
  }

  async getActiveFlashSales() {
    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } },
      include: {
        items: {
          include: {
            product: true,
            sku: true,
          }
        }
      }
    });

    if (!activeSession) return { success: true, data: [] };

    const data = activeSession.items.map(item => ({
      id: item.productId,
      name: item.product.name,
      priceMin: item.product.priceMin,
      priceMax: item.product.priceMax,
      discountPercentage: item.discountPercentage,
      soldCount: item.soldCount,
      stock: item.promotionalStock,
      thumbnailUrl: item.sku.thumbnailUrl,
    }));

    return { success: true, data };
  }

  async decrementStock(sessionId: number, skuId: number, quantity: number): Promise<boolean> {
    const key = `flash_sale:${sessionId}:sku:${skuId}`;
    const remaining = await this.redis.decrby(key, quantity);
    
    if (remaining < 0) {
      await this.redis.incrby(key, quantity);
      return false;
    }
    return true;
  }
}
