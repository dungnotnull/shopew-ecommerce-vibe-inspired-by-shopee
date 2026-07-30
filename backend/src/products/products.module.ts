import { Module } from '@nestjs/common';
import { ProductsController, SellerProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [PrismaModule, ShopsModule],
  controllers: [ProductsController, SellerProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
