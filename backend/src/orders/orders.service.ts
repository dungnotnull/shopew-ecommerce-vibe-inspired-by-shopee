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
    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });

    if (!address) {
      throw new BadRequestException('Địa chỉ giao hàng không hợp lệ');
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
