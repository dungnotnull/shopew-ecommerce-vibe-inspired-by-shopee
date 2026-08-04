import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async upsertCart(userId: number, dto: AddToCartDto) {
    // Validate SKU
    const sku = await this.prisma.sKU.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!sku) {
      throw new NotFoundException('SKU không tồn tại');
    }

    if (dto.quantity > sku.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    if (dto.quantity === 0) {
      // Remove item
      await this.prisma.cartItem.deleteMany({
        where: {
          userId,
          variantId: dto.variantId,
        },
      });
      return { success: true, message: 'Đã xóa khỏi giỏ hàng' };
    }

    // Upsert
    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        userId_variantId: {
          userId,
          variantId: dto.variantId,
        },
      },
      update: {
        quantity: dto.quantity,
      },
      create: {
        userId,
        variantId: dto.variantId,
        productId: sku.productId,
        shopId: sku.product.shopId,
        quantity: dto.quantity,
      },
    });

    return cartItem;
  }

  async getCart(userId: number) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        shop: true,
        product: true,
        sku: true,
      },
    });

    // Group by shopId
    const shopsMap = new Map<number, any>();

    for (const item of items) {
      if (!shopsMap.has(item.shopId)) {
        shopsMap.set(item.shopId, {
          shopId: item.shop.id,
          shopName: item.shop.name,
          isMall: item.shop.isMall,
          items: [],
        });
      }
      const shopGroup = shopsMap.get(item.shopId);
      shopGroup.items.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.sku.price,
      });
    }

    return { shops: Array.from(shopsMap.values()) };
  }
}
