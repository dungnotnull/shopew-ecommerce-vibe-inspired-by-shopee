import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';

@Module({
  controllers: [SellerController]
})
export class SellerModule {}
