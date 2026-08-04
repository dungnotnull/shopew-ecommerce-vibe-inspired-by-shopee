import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

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
}
