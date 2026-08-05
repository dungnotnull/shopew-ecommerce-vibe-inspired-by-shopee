import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Processor('checkout')
export class CheckoutProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { orderGroupId, userId, dto } = job.data;
    
    // Process transaction
    await this.prisma.$transaction(async (tx) => {
      // Collect variant IDs
      const variantIds = (dto.cartItems || []).map((item: any) => item.variantId);
      
      if (variantIds.length === 0) return;

      // Select for update
      // Prisma raw query for locking
      await tx.$queryRaw`SELECT id FROM "SKU" WHERE id IN (${Prisma.join(variantIds)}) FOR UPDATE`;

      const skus = await tx.sKU.findMany({
        where: { id: { in: variantIds } },
        include: { product: true }
      });

      // Fetch active Flash Sale Items for these SKUs
      const activeSession = await tx.flashSaleSession.findFirst({
        where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } }
      });

      let flashSaleItemsMap = new Map();
      if (activeSession) {
        const fsItems = await tx.flashSaleItem.findMany({
          where: { sessionId: activeSession.id, skuId: { in: variantIds } }
        });
        flashSaleItemsMap = new Map(fsItems.map(item => [item.skuId, item]));
      }

      // Prepare Vouchers Map
      const shopVoucherMap = new Map();
      if (dto.shopVouchers) {
        for (const sv of dto.shopVouchers) {
          const voucher = await tx.voucher.findFirst({
            where: { id: sv.voucherId, shopId: sv.shopId, isActive: true, expiresAt: { gte: new Date() } }
          });
          if (voucher) shopVoucherMap.set(sv.shopId, voucher);
        }
      }

      const skuMap = new Map(skus.map(s => [s.id, s]));
      const shopOrders = new Map<number, any>();
      let globalTotalAmount = 0;

      for (const item of (dto.cartItems || [])) {
        const sku = skuMap.get(item.variantId);
        if (!sku) throw new Error(`SKU ${item.variantId} không tồn tại`);

        const fsItem = flashSaleItemsMap.get(sku.id);
        
        let price = sku.price;
        let isFlashSale = false;

        // Apply Flash Sale
        if (fsItem && fsItem.promotionalStock >= item.quantity) {
          price = Math.floor(sku.originalPrice * (1 - fsItem.discountPercentage / 100));
          isFlashSale = true;
        } else if (sku.stock < item.quantity) {
          throw new Error(`SKU ${item.variantId} vượt quá số lượng tồn kho`);
        }

        const shopId = sku.product.shopId;
        if (!shopOrders.has(shopId)) {
          shopOrders.set(shopId, { shopId, totalAmount: 0, items: [], appliedVoucher: null });
        }
        const orderData = shopOrders.get(shopId);
        
        orderData.totalAmount += price * item.quantity;
        orderData.items.push({
          productId: sku.productId,
          skuId: sku.id,
          quantity: item.quantity,
          price: price,
          isFlashSale,
          fsItemId: fsItem ? fsItem.id : null
        });
      }

      // Apply Shop Vouchers
      for (const [shopId, orderData] of shopOrders) {
        const voucher = shopVoucherMap.get(shopId);
        if (voucher && orderData.totalAmount >= voucher.minOrderValue) {
          let discount = Math.floor(orderData.totalAmount * (voucher.discountPercentage / 100));
          if (voucher.maxDiscount > 0 && discount > voucher.maxDiscount) discount = voucher.maxDiscount;
          
          orderData.totalAmount -= discount;
          if (orderData.totalAmount < 0) orderData.totalAmount = 0;
          orderData.appliedVoucher = voucher;

          // Update Voucher Usage
          await tx.voucher.update({ where: { id: voucher.id }, data: { usedCount: { increment: 1 } } });
          await tx.userVoucher.updateMany({
            where: { userId, voucherId: voucher.id },
            data: { isUsed: true }
          });
        }
        globalTotalAmount += orderData.totalAmount;
      }

      // Apply Platform Voucher
      let appliedPlatformVoucher = null;
      if (dto.platformVoucherId) {
        const platformVoucher = await tx.voucher.findFirst({
          where: { id: dto.platformVoucherId, shopId: null, isActive: true, expiresAt: { gte: new Date() } }
        });
        if (platformVoucher && globalTotalAmount >= platformVoucher.minOrderValue) {
          let discount = Math.floor(globalTotalAmount * (platformVoucher.discountPercentage / 100));
          if (platformVoucher.maxDiscount > 0 && discount > platformVoucher.maxDiscount) discount = platformVoucher.maxDiscount;
          
          globalTotalAmount -= discount;
          if (globalTotalAmount < 0) globalTotalAmount = 0;
          appliedPlatformVoucher = platformVoucher;

          await tx.voucher.update({ where: { id: platformVoucher.id }, data: { usedCount: { increment: 1 } } });
          await tx.userVoucher.updateMany({
            where: { userId, voucherId: platformVoucher.id },
            data: { isUsed: true }
          });
        }
      }

      // Distributed Platform Discount proportionally among shops (simplified for this mock: we just apply it to the first shop order or subtract proportionally if needed. Actually Shopee subtracts it at the platform level, but our Order model stores totalAmount per shop).
      // We will just let the globalPlatformVoucherId sit on the first order, or all orders. The schema has `platformVoucherId` on Order.

      // Create orders for each shop
      for (const [shopId, orderData] of shopOrders) {
        // Simple proportion for platform discount (optional), or just save the raw shop orderAmount.
        // If platform voucher applied, totalAmount = orderData.totalAmount - (orderData.totalAmount / globalTotalAmount_before) * discount.
        // For simplicity, we just save the shop total amount.

        const order = await tx.order.create({
          data: {
            orderGroupId,
            userId,
            shopId,
            shippingAddressId: dto.shippingAddressId,
            totalAmount: orderData.totalAmount, // Not deducting platform voucher here to keep shop revenue correct
            status: 'PENDING_PAYMENT',
            platformVoucherId: appliedPlatformVoucher ? appliedPlatformVoucher.id : null,
            shopVoucherId: orderData.appliedVoucher ? orderData.appliedVoucher.id : null,
            orderItems: {
              create: orderData.items.map((item: any) => ({
                productId: item.productId,
                skuId: item.skuId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });
        
        // Deduct stock, increment soldCount
        for (const item of orderData.items) {
          if (item.isFlashSale) {
            await tx.flashSaleItem.update({
              where: { id: item.fsItemId },
              data: { promotionalStock: { decrement: item.quantity }, soldCount: { increment: item.quantity } }
            });
            await tx.sKU.update({
              where: { id: item.skuId },
              data: { stock: { decrement: item.quantity } }
            });
          } else {
            await tx.sKU.update({
              where: { id: item.skuId },
              data: { stock: { decrement: item.quantity } }
            });
          }
          
          await tx.product.update({
            where: { id: item.productId },
            data: { soldCount: { increment: item.quantity } }
          });
        }
      }

      // Remove from cart
      await tx.cartItem.deleteMany({
        where: {
          userId,
          variantId: { in: variantIds }
        }
      });
      
    }, {
      timeout: 10000,
    });
  }
}

