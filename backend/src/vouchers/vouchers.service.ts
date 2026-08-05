import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) { }

  async createVoucher(data: any) {
    let shopId = data.shopId;

    // If created by seller, find their shop ID
    if (data.userId && !shopId) {
      const shop = await this.prisma.shop.findUnique({
        where: { userId: data.userId }
      });
      if (!shop) throw new BadRequestException('Seller does not have a shop');
      shopId = shop.id;
    }

    return this.prisma.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        discountPercentage: data.discountPercentage,
        maxDiscount: data.maxDiscount,
        minOrderValue: data.minOrderValue,
        shopId: shopId || null,
        maxUsage: data.maxUsage,
        expiresAt: new Date(data.expiresAt)
      }
    });
  }

  async saveVoucher(userId: number, voucherId: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: voucherId }
    });

    if (!voucher) throw new BadRequestException('Voucher không tồn tại');
    if (!voucher.isActive || voucher.expiresAt < new Date()) {
      throw new BadRequestException('Voucher đã hết hạn hoặc không hoạt động');
    }

    try {
      await this.prisma.userVoucher.create({
        data: { userId, voucherId }
      });
      return { success: true };
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Bạn đã lưu voucher này rồi');
      }
      throw e;
    }
  }

  async getWalletVouchers(userId: number) {
    return this.prisma.userVoucher.findMany({
      where: { userId, isUsed: false },
      include: {
        voucher: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPublicPlatformVouchers() {
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        shopId: null,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    return vouchers.filter(v => v.usedCount < v.maxUsage);
  }

  async getPublicShopVouchers(shopId: number) {
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        shopId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    return vouchers.filter(v => v.usedCount < v.maxUsage);
  }

  // --- PLATFORM VOUCHERS (ADMIN) ---

  async getPlatformVouchers() {
    return this.prisma.voucher.findMany({
      where: { shopId: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updatePlatformVoucher(id: number, data: any) {
    return this.prisma.voucher.update({
      where: { id, shopId: null },
      data: {
        code: data.code?.toUpperCase(),
        discountPercentage: data.discountPercentage,
        maxDiscount: data.maxDiscount,
        minOrderValue: data.minOrderValue,
        maxUsage: data.maxUsage,
        isActive: data.isActive,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      }
    });
  }

  async deletePlatformVoucher(id: number) {
    return this.prisma.voucher.delete({
      where: { id, shopId: null }
    });
  }

  // --- SHOP VOUCHERS (SELLER) ---

  async getShopVouchers(userId: number) {
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new BadRequestException('Seller does not have a shop');

    return this.prisma.voucher.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateShopVoucher(userId: number, id: number, data: any) {
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new BadRequestException('Seller does not have a shop');

    // Ensure the voucher belongs to this shop
    const voucher = await this.prisma.voucher.findFirst({
      where: { id, shopId: shop.id }
    });
    if (!voucher) throw new BadRequestException('Voucher not found or access denied');

    return this.prisma.voucher.update({
      where: { id },
      data: {
        code: data.code?.toUpperCase(),
        discountPercentage: data.discountPercentage,
        maxDiscount: data.maxDiscount,
        minOrderValue: data.minOrderValue,
        maxUsage: data.maxUsage,
        isActive: data.isActive,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      }
    });
  }

  async deleteShopVoucher(userId: number, id: number) {
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new BadRequestException('Seller does not have a shop');

    const voucher = await this.prisma.voucher.findFirst({
      where: { id, shopId: shop.id }
    });
    if (!voucher) throw new BadRequestException('Voucher not found or access denied');

    return this.prisma.voucher.delete({
      where: { id }
    });
  }
}
