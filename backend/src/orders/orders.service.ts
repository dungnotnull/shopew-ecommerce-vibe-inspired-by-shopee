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
  ) {}

  async checkout(userId: number, dto: CheckoutDto) {
    // Validate shipping address
    let address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });

    if (!address) {
      address = await this.prisma.address.findFirst({ where: { userId } });
    }

    if (!address) {
      address = await this.prisma.address.create({
        data: {
          userId,
          street: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
          city: 'Quận 1',
          state: 'TP. Hồ Chí Minh',
          zipCode: '700000',
          isDefault: true,
        },
      });
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
}
