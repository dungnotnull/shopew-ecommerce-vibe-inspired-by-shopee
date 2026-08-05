import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  async upsertCart(userId: number, dto: AddToCartDto) {
    // Validate SKU
    const sku = await this.prisma.sKU.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!sku) {
      throw new NotFoundException('SKU không tồn tại');
    }

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId: dto.variantId,
        },
      },
    });

    const newQuantity = existingCartItem
      ? existingCartItem.quantity + dto.quantity
      : dto.quantity;

    if (newQuantity > sku.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    if (newQuantity <= 0) {
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
        quantity: newQuantity,
      },
      create: {
        userId,
        variantId: dto.variantId,
        productId: sku.productId,
        shopId: sku.product.shopId,
        quantity: newQuantity,
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
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.sku.thumbnailUrl || (item.product.images && item.product.images.length > 0 ? item.product.images[0] : ''),
        skuId: item.variantId,
        skuCode: item.sku.skuCode || '',
        variantId: item.variantId,
        price: item.sku.price,
        originalPrice: item.sku.originalPrice,
        quantity: item.quantity,
        tierIndex: item.sku.tierIndex,
      });
    }

    return { shops: Array.from(shopsMap.values()) };
  }
}
