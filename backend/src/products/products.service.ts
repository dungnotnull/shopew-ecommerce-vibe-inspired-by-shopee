import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private shopsService: ShopsService) {}

  async getProductDetails(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variantGroups: { include: { options: true } },
        skus: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async toggleLike(userId: number, productId: number) {
    const existing = await this.prisma.productLike.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.productLike.delete({ where: { userId_productId: { userId, productId } } });
      await this.prisma.product.update({ where: { id: productId }, data: { likeCount: { decrement: 1 } } });
      return { liked: false };
    } else {
      await this.prisma.productLike.create({ data: { userId, productId } });
      await this.prisma.product.update({ where: { id: productId }, data: { likeCount: { increment: 1 } } });
      return { liked: true };
    }
  }

  async createProduct(userId: number, data: any) {
    const shop = await this.shopsService.getShopByUserId(userId);
    
    // Create SPU
    const product = await this.prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        attributes: data.attributes,
        priceMin: data.priceMin || 0,
        priceMax: data.priceMax || 0,
        discountPercentage: data.discountPercentage || 0,
      },
    });

    if (data.variantGroups && data.variantGroups.length > 0) {
      for (let i = 0; i < data.variantGroups.length; i++) {
        const group = data.variantGroups[i];
        const createdGroup = await this.prisma.productVariantGroup.create({
          data: { productId: product.id, name: group.name },
        });
        if (group.options) {
          for (let opt of group.options) {
            await this.prisma.productVariantOption.create({
              data: { groupId: createdGroup.id, value: opt },
            });
          }
        }
      }
    }

    if (data.skus && data.skus.length > 0) {
      for (const sku of data.skus) {
        await this.prisma.sKU.create({
          data: {
            productId: product.id,
            price: sku.price,
            originalPrice: sku.originalPrice,
            stock: sku.stock,
            tierIndex: sku.tierIndex,
            skuCode: sku.skuCode,
          }
        });
      }
    } else {
      // Logic: Implement Auto-generation of a "Default SKU" if the SPU is created without any variant groups.
      await this.prisma.sKU.create({
         data: {
           productId: product.id,
           price: data.priceMin || 0,
           originalPrice: data.priceMax || 0,
           stock: data.stock || 0,
           tierIndex: [],
           skuCode: data.skuCode || `DEFAULT-${product.id}`,
         }
      });
    }

    return this.getProductDetails(product.id);
  }

  async updateProduct(userId: number, productId: number, data: any) {
    const shop = await this.shopsService.getShopByUserId(userId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException();
    if (product.shopId !== shop.id) throw new ForbiddenException();

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        attributes: data.attributes,
        categoryId: data.categoryId,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        discountPercentage: data.discountPercentage,
      },
    });
    // In a real scenario we'd also handle updating variant groups and SKUs carefully.
    return this.getProductDetails(productId);
  }

  async deleteProduct(userId: number, productId: number) {
    const shop = await this.shopsService.getShopByUserId(userId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException();
    if (product.shopId !== shop.id) throw new ForbiddenException();
    
    await this.prisma.product.delete({ where: { id: productId } });
    return { success: true };
  }
}
