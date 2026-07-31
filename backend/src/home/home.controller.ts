import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Home')
@Controller('v1/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Get active promotional banners' })
  async getBanners() {
    return this.homeService.getBanners();
  }

  @Get('flash-sale')
  @ApiOperation({ summary: 'Get flash sale items' })
  async getFlashSale() {
    return this.homeService.getFlashSale();
  }

  @Get('daily-discover')
  @ApiOperation({ summary: 'Get paginated daily discover products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDailyDiscover(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.homeService.getDailyDiscover(page, limit);
  }
}
