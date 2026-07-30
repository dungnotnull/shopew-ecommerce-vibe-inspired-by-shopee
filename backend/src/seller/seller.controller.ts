import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Seller')
@Controller('seller')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SellerController {

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
}
