import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CheckoutDto } from './dto/checkout.dto';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectQueue('checkout') private readonly checkoutQueue: Queue,
    private prisma: PrismaService,
  ) { }

  async checkout(userId: number, dto: CheckoutDto) {
    // Validate shipping address
    let address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });

    if (!address) {
      address = await this.prisma.address.findFirst({ where: { userId } });
    }

    if (!address) {
      throw new BadRequestException('Vui lòng thêm địa chỉ giao hàng trước khi thanh toán');
    }

    const orderGroupId = randomUUID();

    // Push to queue
    await this.checkoutQueue.add('process-checkout', {
      orderGroupId,
      userId,
      dto,
    });

    return {
      orderGroupId,
      status: 'PENDING_PAYMENT',
    };
  }

  async calculateCheckout(userId: number, dto: CheckoutDto) {
    const variantIds = (dto.cartItems || []).map((item: any) => item.variantId);
    if (variantIds.length === 0) {
      return { totalAmount: 0, discountAmount: 0, finalAmount: 0, shopOrders: [] };
    }

    const skus = await this.prisma.sKU.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
    });

    const activeSession = await this.prisma.flashSaleSession.findFirst({
      where: { isActive: true, startTime: { lte: new Date() }, endTime: { gte: new Date() } }
    });

    let flashSaleItemsMap = new Map();
    if (activeSession) {
      const fsItems = await this.prisma.flashSaleItem.findMany({
        where: { sessionId: activeSession.id, skuId: { in: variantIds } }
      });
      flashSaleItemsMap = new Map(fsItems.map(item => [item.skuId, item]));
    }

    const shopVoucherMap = new Map();
    if (dto.shopVouchers) {
      for (const sv of dto.shopVouchers) {
        const voucher = await this.prisma.voucher.findFirst({
          where: { id: sv.voucherId, shopId: sv.shopId, isActive: true, expiresAt: { gte: new Date() } }
        });
        if (voucher) shopVoucherMap.set(sv.shopId, voucher);
      }
    }

    const skuMap = new Map(skus.map(s => [s.id, s]));
    const shopOrders = new Map<number, any>();
    let globalTotalAmount = 0;
    let globalDiscountAmount = 0;

    for (const item of (dto.cartItems || [])) {
      const sku = skuMap.get(item.variantId);
      if (!sku) throw new BadRequestException(`SKU ${item.variantId} không tồn tại`);

      const fsItem = flashSaleItemsMap.get(sku.id);
      let price = sku.price;
      
      if (fsItem && fsItem.promotionalStock >= item.quantity) {
        price = Math.floor(sku.originalPrice * (1 - fsItem.discountPercentage / 100));
      } else if (sku.stock < item.quantity) {
        throw new BadRequestException(`SKU ${item.variantId} vượt quá số lượng tồn kho`);
      }

      const shopId = sku.product.shopId;
      if (!shopOrders.has(shopId)) {
        shopOrders.set(shopId, { shopId, totalAmount: 0, discountAmount: 0, finalAmount: 0, appliedVoucher: null });
      }
      const orderData = shopOrders.get(shopId);
      orderData.totalAmount += price * item.quantity;
    }

    for (const [shopId, orderData] of shopOrders) {
      const voucher = shopVoucherMap.get(shopId);
      let shopDiscount = 0;
      if (voucher && orderData.totalAmount >= voucher.minOrderValue) {
        shopDiscount = Math.floor(orderData.totalAmount * (voucher.discountPercentage / 100));
        if (voucher.maxDiscount > 0 && shopDiscount > voucher.maxDiscount) {
          shopDiscount = voucher.maxDiscount;
        }
        orderData.appliedVoucher = voucher;
      }
      orderData.discountAmount = shopDiscount;
      orderData.finalAmount = orderData.totalAmount - shopDiscount;
      if (orderData.finalAmount < 0) orderData.finalAmount = 0;

      globalTotalAmount += orderData.totalAmount;
      globalDiscountAmount += shopDiscount;
    }

    let appliedPlatformVoucher = null;
    let platformDiscount = 0;
    let finalAmount = globalTotalAmount - globalDiscountAmount;

    if (dto.platformVoucherId) {
      const platformVoucher = await this.prisma.voucher.findFirst({
        where: { id: dto.platformVoucherId, shopId: null, isActive: true, expiresAt: { gte: new Date() } }
      });
      if (platformVoucher && finalAmount >= platformVoucher.minOrderValue) {
        platformDiscount = Math.floor(finalAmount * (platformVoucher.discountPercentage / 100));
        if (platformVoucher.maxDiscount > 0 && platformDiscount > platformVoucher.maxDiscount) {
          platformDiscount = platformVoucher.maxDiscount;
        }
        appliedPlatformVoucher = platformVoucher;
        globalDiscountAmount += platformDiscount;
        finalAmount -= platformDiscount;
        if (finalAmount < 0) finalAmount = 0;
      }
    }

    return {
      totalAmount: globalTotalAmount,
      discountAmount: globalDiscountAmount,
      finalAmount,
      shopOrders: Array.from(shopOrders.values()),
      appliedPlatformVoucher
    };
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        shop: { select: { id: true, name: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            sku: { select: { id: true, tierIndex: true } }
          }
        }
      }
    });
  }

  async getOrderDetails(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        shop: { select: { id: true, name: true } },
        shippingAddress: true,
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            sku: { select: { id: true, tierIndex: true } }
          }
        }
      }
    });

    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    return order;
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId }
    });

    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PROCESSING') {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng khi đang chờ thanh toán hoặc đang xử lý');
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore stock and soldCount
      const orderItems = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of orderItems) {
        await tx.sKU.update({
          where: { id: item.skuId },
          data: { stock: { increment: item.quantity } }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { soldCount: { decrement: item.quantity } }
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
    });
  }

  async payOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId }
    });

    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Đơn hàng không ở trạng thái chờ thanh toán');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' }
    });
  }

  async rebuyOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { orderItems: true }
    });

    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        const existingCartItem = await tx.cartItem.findFirst({
          where: { userId, variantId: item.skuId }
        });

        if (existingCartItem) {
          await tx.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + item.quantity }
          });
        } else {
          await tx.cartItem.create({
            data: {
              userId,
              shopId: order.shopId,
              productId: item.productId,
              variantId: item.skuId,
              quantity: item.quantity
            }
          });
        }
      }
      return { message: 'Đã thêm các sản phẩm vào giỏ hàng' };
    });
  }
}
