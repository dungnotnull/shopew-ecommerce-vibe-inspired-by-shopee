import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall statistics for dashboard' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get list of users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUsers(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.adminService.getUsers(+page, +limit);
  }

  @Get('shops')
  @ApiOperation({ summary: 'Get list of shops' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getShops(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.adminService.getShops(+page, +limit);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products across platform' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProducts(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.adminService.getProducts(+page, +limit);
  }

  // --- Banners Management ---
  @Get('banners')
  @ApiOperation({ summary: 'Get all banners for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getBanners(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.adminService.getBanners(+page, +limit);
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create a new banner' })
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.adminService.createBanner(dto);
  }

  @Put('banners/:id')
  @ApiOperation({ summary: 'Update a banner' })
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.adminService.updateBanner(+id, dto);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete a banner' })
  async deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(+id);
  }
}
