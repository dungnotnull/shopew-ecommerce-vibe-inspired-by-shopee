import { Controller, Get, UseGuards, Request, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { SellerService } from './seller.service';

@ApiTags('Seller')
@Controller('v1/seller')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('dashboard')
  @ApiBearerAuth()
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Lấy dữ liệu tổng quan cho Seller Dashboard' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê Seller' })
  getDashboard(@Request() req: any) {
    // Trả về mock data tương ứng với frontend SellerDashboardPage
    return {
      shopName: req.user.fullName + ' Shop',
      revenueThisMonth: 125400000,
      newOrders: 48,
      totalSPUs: 124,
      shopRating: 4.9,
      todo: {
        pendingConfirmation: 12,
        pendingPickup: 5,
        returnRequests: 2,
        lockedProducts: 0
      }
    };
  }

  @Get('orders')
  @ApiBearerAuth()
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của Shop' })
  async getShopOrders(@Request() req: any) {
    return this.sellerService.getShopOrders(req.user.id);
  }

  @Put('orders/:id/status')
  @ApiBearerAuth()
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  async updateOrderStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: OrderStatus
  ) {
    return this.sellerService.updateOrderStatus(req.user.id, Number(id), status);
  }
}
