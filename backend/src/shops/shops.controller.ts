import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Shops')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('v1/shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Create shop profile' })
  @ApiResponse({ status: 201, description: 'Shop created.' })
  async createShop(@Request() req: any, @Body() data: any) {
    return this.shopsService.createShop(req.user.id, data);
  }

  @Get('me')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get current seller shop' })
  @ApiResponse({ status: 200, description: 'Shop profile.' })
  async getMyShop(@Request() req: any) {
    return this.shopsService.getShopByUserId(req.user.id);
  }

  @Put('me')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Update shop profile' })
  @ApiResponse({ status: 200, description: 'Shop updated.' })
  async updateMyShop(@Request() req: any, @Body() data: any) {
    return this.shopsService.updateShop(req.user.id, data);
  }
}
