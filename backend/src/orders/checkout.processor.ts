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

      const skuMap = new Map(skus.map(s => [s.id, s]));
      const shopOrders = new Map<number, any>();

      for (const item of (dto.cartItems || [])) {
        const sku = skuMap.get(item.variantId);
        if (!sku) {
          throw new Error(`SKU ${item.variantId} không tồn tại`);
        }
        if (sku.stock < item.quantity) {
          throw new Error(`SKU ${item.variantId} vượt quá số lượng tồn kho`);
        }

        const shopId = sku.product.shopId;
        if (!shopOrders.has(shopId)) {
          shopOrders.set(shopId, { shopId, totalAmount: 0, items: [] });
        }
        const orderData = shopOrders.get(shopId);
        
        const price = sku.price;
        orderData.totalAmount += price * item.quantity;
        orderData.items.push({
          productId: sku.productId,
          skuId: sku.id,
          quantity: item.quantity,
          price: price
        });
      }

      // Create orders for each shop
      for (const [shopId, orderData] of shopOrders) {
        const order = await tx.order.create({
          data: {
            orderGroupId,
            userId,
            shopId,
            shippingAddressId: dto.shippingAddressId,
            totalAmount: orderData.totalAmount,
            status: 'PENDING_PAYMENT',
            orderItems: {
              create: orderData.items
            }
          }
        });
        
        // Deduct stock, increment soldCount
        for (const item of orderData.items) {
          await tx.sKU.update({
            where: { id: item.skuId },
            data: { stock: { decrement: item.quantity } }
          });
          
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
