import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async createShop(userId: number, data: any) {
    const existing = await this.prisma.shop.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Shop already exists for this user.');

    return this.prisma.shop.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
    });
  }

  async getShopByUserId(userId: number) {
    let shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) {
      // Tự động khởi tạo Shop mặc định cho Seller nếu chưa có
      shop = await this.prisma.shop.create({
        data: {
          userId,
          name: 'Gian Hàng Kênh Người Bán',
          description: 'Cửa hàng phân phối sản phẩm chính hãng trên Shopew Enterprise.',
        },
      });
    }
    return shop;
  }

  async updateShop(userId: number, data: any) {
    const shop = await this.getShopByUserId(userId);
    return this.prisma.shop.update({
      where: { id: shop.id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }
}
