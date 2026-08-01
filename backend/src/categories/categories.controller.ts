import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get full category tree' })
  @ApiResponse({ status: 200, description: 'Return the full category tree.' })
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  async createCategory(@Body() data: any) {
    return this.categoriesService.createCategory(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.updateCategory(+id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(+id);
  }
}
