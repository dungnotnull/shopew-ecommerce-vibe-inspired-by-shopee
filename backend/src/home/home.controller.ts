import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Request } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@ApiTags('Home')
@Controller('v1/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('banners')
  @ApiOperation({ summary: 'Get active promotional banners' })
  async getBanners() {
    return this.homeService.getBanners();
  }



  @Get('daily-discover')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated daily discover products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDailyDiscover(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const userId = req.user?.id;
    return this.homeService.getDailyDiscover(page, limit, userId);
  }
}
