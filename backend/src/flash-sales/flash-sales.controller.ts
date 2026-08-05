import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
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

  @Get('admin/flash-sales')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xem danh sách Flash Sale Session' })
  getAdminSessions() {
    return this.flashSalesService.getAdminSessions();
  }

  @Put('admin/flash-sales/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin cập nhật Flash Sale Session' })
  updateAdminSession(@Param('id') id: string, @Body() dto: any) {
    return this.flashSalesService.updateAdminSession(Number(id), dto);
  }

  @Delete('admin/flash-sales/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xóa Flash Sale Session' })
  deleteAdminSession(@Param('id') id: string) {
    return this.flashSalesService.deleteAdminSession(Number(id));
  }

  @Get('seller/flash-sales/sessions')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller lấy danh sách Session khả dụng' })
  getSellerSessions() {
    return this.flashSalesService.getSellerSessions();
  }

  @Get('seller/flash-sales/:sessionId/items')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Seller xem sản phẩm đã đăng ký trong Session' })
  getSellerRegisteredItems(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.flashSalesService.getSellerRegisteredItems(req.user.id, Number(sessionId));
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
