import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Flash Sales')
@Controller('v1')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Get('home/flash-sale')
  @ApiOperation({ summary: 'Get active flash sale items' })
  @ApiResponse({ status: 200, description: 'List of flash sale items' })
  getActiveFlashSales() {
    return this.flashSalesService.getActiveFlashSales();
  }

  @Post('admin/flash-sales')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin tạo phiên Flash Sale' })
  createFlashSaleSession(@Body() dto: any) {
    return this.flashSalesService.createFlashSaleSession(dto);
  }

  @Post('seller/flash-sales/register')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller đăng ký sản phẩm tham gia Flash Sale' })
  registerFlashSaleItem(@Request() req: any, @Body() dto: any) {
    return this.flashSalesService.registerFlashSaleItem(req.user.id, dto);
  }
}
