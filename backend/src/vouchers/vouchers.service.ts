import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async validateAndApplyVoucher(voucherId: number, orderTotal: number, shopId?: number) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher || !voucher.isActive) {
      throw new BadRequestException('Voucher không hợp lệ hoặc đã hết hạn');
    }
    
    if (voucher.expiresAt < new Date()) {
      throw new BadRequestException('Voucher đã hết hạn');
    }

    if (voucher.usedCount >= voucher.maxUsage) {
      throw new BadRequestException('Voucher đã hết lượt sử dụng');
    }

    if (orderTotal < voucher.minOrderValue) {
      throw new BadRequestException(`Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue}đ`);
    }

    if (voucher.shopId && voucher.shopId !== shopId) {
      throw new BadRequestException('Voucher không áp dụng cho shop này');
    }

    let discount = Math.floor(orderTotal * (voucher.discountPercentage / 100));
    if (discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }

    return discount;
  }

  async incrementVoucherUsage(voucherId: number) {
    await this.prisma.voucher.update({
      where: { id: voucherId },
      data: { usedCount: { increment: 1 } }
    });
  }
}
