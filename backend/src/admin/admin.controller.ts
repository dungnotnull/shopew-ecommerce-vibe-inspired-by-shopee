import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  
  @Get('dashboard')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lấy dữ liệu tổng quan cho Admin Dashboard' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê Admin' })
  getDashboard() {
    // Trả về mock data tương ứng với frontend AdminDashboardPage
    return {
      totalUsers: 12850,
      totalShops: 845,
      activeDisputes: 3,
      totalGMV: 4520000000,
    };
  }
}
