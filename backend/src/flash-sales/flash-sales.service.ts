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
      promotionalPrice: Math.floor(item.sku.originalPrice * (1 - item.discountPercentage / 100)),
      discountPercentage: item.discountPercentage,
      soldCount: item.soldCount,
      stock: item.promotionalStock,
      thumbnailUrl: item.sku.thumbnailUrl,
    }));

    return { success: true, data };
  }

  async createFlashSaleSession(data: { startTime: string, endTime: string }) {
    const session = await this.prisma.flashSaleSession.create({
      data: {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        isActive: true
      }
    });
    return session;
  }

  async registerFlashSaleItem(sellerId: number, data: { sessionId: number, productId: number, skuId: number, promotionalStock: number, discountPercentage: number }) {
    // Verify product belongs to seller
    const shop = await this.prisma.shop.findUnique({ where: { userId: sellerId } });
    if (!shop) throw new Error('Seller does not have a shop');

    const product = await this.prisma.product.findFirst({
      where: { id: data.productId, shopId: shop.id }
    });
    if (!product) throw new Error('Product not found or does not belong to shop');

    // Verify sku belongs to product
    const sku = await this.prisma.sKU.findFirst({
      where: { id: data.skuId, productId: data.productId }
    });
    if (!sku) throw new Error('SKU not found');

    const item = await this.prisma.flashSaleItem.create({
      data: {
        sessionId: data.sessionId,
        productId: data.productId,
        skuId: data.skuId,
        promotionalStock: data.promotionalStock,
        discountPercentage: data.discountPercentage
      }
    });
    return item;
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

  // --- ADMIN METHODS ---

  async getAdminSessions() {
    return this.prisma.flashSaleSession.findMany({
      orderBy: { startTime: 'desc' }
    });
  }

  async updateAdminSession(id: number, data: any) {
    return this.prisma.flashSaleSession.update({
      where: { id },
      data: {
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        isActive: data.isActive
      }
    });
  }

  async deleteAdminSession(id: number) {
    return this.prisma.flashSaleSession.delete({
      where: { id }
    });
  }

  // --- SELLER METHODS ---

  async getSellerSessions() {
    // Return sessions that are currently active or upcoming
    return this.prisma.flashSaleSession.findMany({
      where: {
        isActive: true,
        endTime: { gte: new Date() }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getSellerRegisteredItems(sellerId: number, sessionId: number) {
    const shop = await this.prisma.shop.findUnique({ where: { userId: sellerId } });
    if (!shop) throw new Error('Seller does not have a shop');

    return this.prisma.flashSaleItem.findMany({
      where: {
        sessionId,
        product: { shopId: shop.id }
      },
      include: {
        product: true,
        sku: true
      }
    });
  }
}
