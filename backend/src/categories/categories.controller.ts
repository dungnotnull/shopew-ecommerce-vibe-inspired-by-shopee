import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get full category tree' })
  @ApiResponse({ status: 200, description: 'Return the full category tree.' })
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }
}
