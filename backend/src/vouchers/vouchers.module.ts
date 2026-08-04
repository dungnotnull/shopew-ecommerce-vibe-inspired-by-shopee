import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VouchersService],
  exports: [VouchersService]
})
export class VouchersModule {}
