import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddressesService } from './addresses.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('User Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('v1/users/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của User' })
  async getUserAddresses(@Request() req: any) {
    return this.addressesService.getUserAddresses(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm địa chỉ mới' })
  async createAddress(@Request() req: any, @Body() body: any) {
    return this.addressesService.createAddress(req.user.id, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật địa chỉ' })
  async updateAddress(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.addressesService.updateAddress(req.user.id, Number(id), body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa địa chỉ' })
  async deleteAddress(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.deleteAddress(req.user.id, Number(id));
  }
}
