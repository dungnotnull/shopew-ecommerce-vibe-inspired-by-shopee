import { Controller, Post, Get, Body, UseGuards, Request, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { VouchersService } from './vouchers.service';

@ApiTags('Vouchers')
@Controller('v1')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

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

  @Post('vouchers/save')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lưu voucher vào ví User' })
  async saveVoucher(@Request() req: any, @Body('voucherId') voucherId: number) {
    if (!voucherId) throw new BadRequestException('voucherId is required');
    return this.vouchersService.saveVoucher(req.user.id, voucherId);
  }

  @Get('vouchers/wallet')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy danh sách voucher trong ví User' })
  async getWalletVouchers(@Request() req: any) {
    return this.vouchersService.getWalletVouchers(req.user.id);
  }
}
