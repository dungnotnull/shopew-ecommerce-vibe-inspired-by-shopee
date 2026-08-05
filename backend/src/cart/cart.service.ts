import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  async addToCart(userId: number, dto: AddToCartDto) {
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

  async updateCartItem(userId: number, variantId: number, quantity: number) {
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
      include: {
        sku: true,
      },
    });

    if (!existingCartItem) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    if (quantity > existingCartItem.sku.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    const cartItem = await this.prisma.cartItem.update({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
      data: {
        quantity,
      },
    });

    return cartItem;
  }

  async removeCartItem(userId: number, variantId: number) {
    await this.prisma.cartItem.deleteMany({
      where: {
        userId,
        variantId,
      },
    });
    return { success: true, message: 'Đã xóa khỏi giỏ hàng' };
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

    // Check if there is an active flash sale
    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } }
    });

    let fsMap = new Map();
    if (activeSession) {
      const fsItems = await this.prisma.flashSaleItem.findMany({
        where: { sessionId: activeSession.id }
      });
      fsMap = new Map(fsItems.map(i => [i.skuId, i]));
    }

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
      
      let activePrice = item.sku.price;
      const fsItem = fsMap.get(item.variantId);
      if (fsItem && fsItem.promotionalStock > 0) {
        activePrice = Math.floor(item.sku.originalPrice * (1 - fsItem.discountPercentage / 100));
      }

      shopGroup.items.push({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.sku.thumbnailUrl || (item.product.images && item.product.images.length > 0 ? item.product.images[0] : ''),
        skuId: item.variantId,
        skuCode: item.sku.skuCode || '',
        variantId: item.variantId,
        price: activePrice,
        originalPrice: item.sku.originalPrice,
        quantity: item.quantity,
        tierIndex: item.sku.tierIndex,
      });
    }

    return { shops: Array.from(shopsMap.values()) };
  }
}
