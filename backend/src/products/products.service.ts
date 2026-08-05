import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private shopsService: ShopsService) { }

  async getProductDetails(id: number, userId?: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variantGroups: { include: { options: true } },
        skus: true,
        shop: { select: { id: true, name: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    let isLiked = false;
    if (userId) {
      const like = await this.prisma.productLike.findUnique({
        where: { userId_productId: { userId, productId: id } }
      });
      isLiked = !!like;
    }

    // Check flash sale override
    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } },
    });
    
    let isFlashSale = false;
    let minFsPrice = Infinity;
    let maxFsPrice = -Infinity;

    if (activeSession) {
      const fsItems = await this.prisma.flashSaleItem.findMany({
        where: { sessionId: activeSession.id, productId: id },
      });
      
      if (fsItems.length > 0) {
        const fsMap = new Map(fsItems.map(i => [i.skuId, i]));
        product.skus = product.skus.map(sku => {
          const fs = fsMap.get(sku.id);
          if (fs && fs.promotionalStock > 0) {
            isFlashSale = true;
            const fsPrice = Math.floor(sku.originalPrice * (1 - fs.discountPercentage / 100));
            minFsPrice = Math.min(minFsPrice, fsPrice);
            maxFsPrice = Math.max(maxFsPrice, fsPrice);
            
            return {
              ...sku,
              price: fsPrice,
              discountPercentage: fs.discountPercentage,
              isDiscount: true
            };
          }
          return sku;
        });
      }
    }
    
    if (isFlashSale) {
      product.priceMin = minFsPrice;
      product.priceMax = maxFsPrice;
      (product as any).isFlashSale = true;
    }

    return { ...product, isLiked };
  }

  async searchProducts(query: any, userId?: number) {
    const { q, category_id, price_min, price_max, rating, isMall, isPreferred, sort, order, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) where.name = { contains: q, mode: 'insensitive' };
    if (category_id) where.categoryId = category_id;
    if (price_min !== undefined || price_max !== undefined) {
      where.priceMin = {};
      if (price_min !== undefined) where.priceMin.gte = price_min;
      if (price_max !== undefined) where.priceMin.lte = price_max;
    }
    if (rating !== undefined) where.rating = { gte: rating };
    if (isMall !== undefined) where.isMall = isMall;
    if (isPreferred !== undefined) where.isPreferred = isPreferred;

    let orderBy: any = {};
    if (sort === 'sold') orderBy = { soldCount: order || 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: order || 'desc' };
    else if (sort === 'price') orderBy = { priceMin: order || 'asc' };
    else orderBy = { viewCount: 'desc' }; // default relevance

    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        shop: { select: { id: true, name: true } },
        skus: { take: 1 }
      }
    });

    const total = await this.prisma.product.count({ where });

    let userLikedProductIds = new Set<number>();
    if (userId && products.length > 0) {
      const likes = await this.prisma.productLike.findMany({
        where: {
          userId,
          productId: { in: products.map(p => p.id) }
        },
        select: { productId: true }
      });
      userLikedProductIds = new Set(likes.map(l => l.productId));
    }

    // Fetch active flash sale to override prices
    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } }
    });

    let fsMap = new Map();
    if (activeSession && products.length > 0) {
      const fsItems = await this.prisma.flashSaleItem.findMany({
        where: {
          sessionId: activeSession.id,
          productId: { in: products.map(p => p.id) }
        },
        include: { sku: true }
      });
      // Just take the first flash sale item for the product for display purposes
      fsMap = new Map(fsItems.map(i => [i.productId, i]));
    }

    const mapped = products.map(p => {
      let promotionalPrice = p.promotionalPrice;
      let discountPercentage = p.skus && p.skus.length > 0 ? Math.max(0, ...p.skus.map(s => s.discountPercentage || 0)) : 0;
      
      const fs = fsMap.get(p.id);
      if (fs && fs.promotionalStock > 0) {
        promotionalPrice = Math.floor(fs.sku.originalPrice * (1 - fs.discountPercentage / 100));
        discountPercentage = fs.discountPercentage;
      }

      return {
        id: p.id,
        name: p.name,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        promotionalPrice,
        discountPercentage,
        rating: p.rating,
        soldCount: p.soldCount,
        likeCount: p.likeCount,
        isLiked: userLikedProductIds.has(p.id),
        isMall: p.isMall,
        isPreferred: p.isPreferred,
        images: p.images,
        thumbnailUrl: p.skus && p.skus.length > 0 ? p.skus[0]?.thumbnailUrl : null,
        shopId: p.shopId,
        shopName: p.shop?.name || ''
      };
    });

    return {
      data: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getSellerProducts(userId: number) {
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) return [];
    return this.prisma.product.findMany({
      where: { shopId: shop.id },
      include: {
        variantGroups: { include: { options: true } },
        skus: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSellerProductById(userId: number, productId: number) {
    const shop = await this.prisma.shop.findUnique({ where: { userId } });
    if (!shop) throw new ForbiddenException();

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variantGroups: { include: { options: true } },
        skus: true,
      },
    });

    if (!product) throw new NotFoundException();
    if (product.shopId !== shop.id) throw new ForbiddenException();

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

    // Bọc toàn bộ quá trình tạo vào Transaction để đảm bảo tính ACID
    const productId = await this.prisma.$transaction(async (tx: any) => {
      // Create SPU
      const product = await tx.product.create({
        data: {
          shopId: shop.id,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          attributes: data.attributes,
          priceMin: data.priceMin || 0,
          priceMax: data.priceMax || 0,
          promotionalPrice: data.promotionalPrice || 0,
          images: data.images || [],
        },
      });

      if (data.variantGroups && data.variantGroups.length > 0) {
        for (let i = 0; i < data.variantGroups.length; i++) {
          const group = data.variantGroups[i];
          const createdGroup = await tx.productVariantGroup.create({
            data: { productId: product.id, name: group.name },
          });
          if (group.options) {
            for (let opt of group.options) {
              await tx.productVariantOption.create({
                data: { groupId: createdGroup.id, value: opt },
              });
            }
          }
        }
      }

      if (data.skus && data.skus.length > 0) {
        for (const sku of data.skus) {
          await tx.sKU.create({
            data: {
              productId: product.id,
              price: sku.price ?? data.priceMin ?? 0,
              originalPrice: sku.originalPrice ?? data.priceMax ?? 0,
              stock: sku.stock ?? data.stock ?? 0,
              tierIndex: sku.tierIndex || [],
              skuCode: sku.skuCode || `DEFAULT-${product.id}-${Date.now()}`,
              isDiscount: sku.isDiscount || false,
              discountPercentage: sku.isDiscount ? (sku.discountPercentage || 0) : 0,
            }
          });
        }
      } else {
        // Logic: Implement Auto-generation of a "Default SKU" if the SPU is created without any variant groups.
        await tx.sKU.create({
          data: {
            productId: product.id,
            price: data.priceMin || 0,
            originalPrice: data.priceMax || 0,
            stock: data.stock || 100, // Đặt mặc định 100 để hiển thị được FE nếu payload thiếu
            tierIndex: [],
            skuCode: data.skuCode || `DEFAULT-${product.id}-${Date.now()}`,
          }
        });
      }

      return product.id;
    });

    return this.getProductDetails(productId);
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
        promotionalPrice: data.promotionalPrice,
        images: data.images,
      },
    });

    // Update SKUs to sync stock and price
    if (data.skus && Array.isArray(data.skus)) {
      await Promise.all(
        data.skus.map((sku: any) => {
          if (sku.id) {
            return this.prisma.sKU.update({
              where: { id: sku.id },
              data: {
                ...(sku.price !== undefined && { price: sku.price }),
                ...(sku.originalPrice !== undefined && { originalPrice: sku.originalPrice }),
                ...(sku.stock !== undefined && { stock: sku.stock }),
                ...(sku.skuCode !== undefined && { skuCode: sku.skuCode }),
                ...(sku.isDiscount !== undefined && { isDiscount: sku.isDiscount }),
                ...(sku.discountPercentage !== undefined && { discountPercentage: sku.discountPercentage }),
              },
            });
          }
        })
      );
    }

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
