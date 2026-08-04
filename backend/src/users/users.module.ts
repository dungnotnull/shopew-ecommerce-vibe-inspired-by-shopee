import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AddressesController } from './addresses/addresses.controller';
import { AddressesService } from './addresses/addresses.service';

@Module({
  controllers: [AddressesController],
  providers: [UsersService, AddressesService],
  exports: [UsersService],
})
export class UsersModule {}
