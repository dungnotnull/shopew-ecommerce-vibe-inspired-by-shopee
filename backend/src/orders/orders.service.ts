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
}
