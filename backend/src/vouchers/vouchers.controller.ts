import { Controller, Post, Get, Put, Delete, Body, UseGuards, Request, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { VouchersService } from './vouchers.service';

@ApiTags('Vouchers')
@Controller('v1')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) { }

  @Get('vouchers/public/platform')
  @ApiOperation({ summary: 'Lấy danh sách voucher hệ thống (Platform) đang phát hành' })
  async getPublicPlatformVouchers() {
    return this.vouchersService.getPublicPlatformVouchers();
  }

  @Get('vouchers/public/shop/:shopId')
  @ApiOperation({ summary: 'Lấy danh sách voucher của một Shop đang phát hành' })
  async getPublicShopVouchers(@Param('shopId') shopId: string) {
    return this.vouchersService.getPublicShopVouchers(Number(shopId));
  }

  @Post('admin/vouchers')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin tạo voucher hệ thống (Platform)' })
  async createPlatformVoucher(@Body() dto: any) {
    return this.vouchersService.createVoucher({
      ...dto,
      shopId: null
    });
  }

  @Get('admin/vouchers')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin lấy danh sách voucher hệ thống (Platform)' })
  async getPlatformVouchers() {
    return this.vouchersService.getPlatformVouchers();
  }

  @Put('admin/vouchers/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin cập nhật voucher hệ thống' })
  async updatePlatformVoucher(@Param('id') id: string, @Body() dto: any) {
    return this.vouchersService.updatePlatformVoucher(Number(id), dto);
  }

  @Delete('admin/vouchers/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xóa voucher hệ thống' })
  async deletePlatformVoucher(@Param('id') id: string) {
    return this.vouchersService.deletePlatformVoucher(Number(id));
  }

  @Post('seller/vouchers')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller tạo voucher cho Shop' })
  async createShopVoucher(@Request() req: any, @Body() dto: any) {
    return this.vouchersService.createVoucher({
      ...dto,
      userId: req.user.id
    });
  }

  @Get('seller/vouchers')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller lấy danh sách voucher của Shop' })
  async getShopVouchers(@Request() req: any) {
    return this.vouchersService.getShopVouchers(req.user.id);
  }

  @Put('seller/vouchers/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller cập nhật voucher của Shop' })
  async updateShopVoucher(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.vouchersService.updateShopVoucher(req.user.id, Number(id), dto);
  }

  @Delete('seller/vouchers/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller xóa voucher của Shop' })
  async deleteShopVoucher(@Request() req: any, @Param('id') id: string) {
    return this.vouchersService.deleteShopVoucher(req.user.id, Number(id));
  }

  @Post('vouchers/save')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Lưu voucher vào ví User' })
  async saveVoucher(@Request() req: any, @Body('voucherId') voucherId: number) {
    if (!voucherId) throw new BadRequestException('voucherId is required');
    return this.vouchersService.saveVoucher(req.user.id, voucherId);
  }

  @Get('vouchers/wallet')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Lấy danh sách voucher trong ví User' })
  async getWalletVouchers(@Request() req: any) {
    return this.vouchersService.getWalletVouchers(req.user.id);
  }
}
