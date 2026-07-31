import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new NotFoundException('Shop not found.');
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
