import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class SellerService {
  constructor(private prisma: PrismaService) {}

  async getShopOrders(userId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { userId }
    });

    if (!shop) throw new BadRequestException('User does not have a shop');

    return this.prisma.order.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        shippingAddress: true,
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            sku: { select: { id: true, tierIndex: true } }
          }
        }
      }
    });
  }

  async updateOrderStatus(userId: number, orderId: number, status: OrderStatus) {
    const shop = await this.prisma.shop.findUnique({
      where: { userId }
    });

    if (!shop) throw new BadRequestException('User does not have a shop');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, shopId: shop.id }
    });

    if (!order) throw new BadRequestException('Order not found');

    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot update status for cancelled or delivered orders');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}
