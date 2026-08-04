import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { CheckoutProcessor } from './checkout.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'checkout',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, CheckoutProcessor],
})
export class OrdersModule {}
