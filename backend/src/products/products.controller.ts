import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';

@ApiTags('Products')
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search and filter products' })
  async searchProducts(@Query() query: SearchProductsDto) {
    return this.productsService.searchProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SPU and its SKUs (public)' })
  async getProduct(@Param('id') id: string) {
    return this.productsService.getProductDetails(+id);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Toggle like/wishlist' })
  async toggleLike(@Request() req: any, @Param('id') id: string) {
    return this.productsService.toggleLike(req.user.id, +id);
  }
}

@ApiTags('Seller Products')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('seller/products')
export class SellerProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get list of SPU and SKUs for the current seller' })
  async getProducts(@Request() req: any) {
    return this.productsService.getSellerProducts(req.user.id);
  }

  @Post()
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Create SPU, Variant Groups, and SKUs' })
  async createProduct(@Request() req: any, @Body() data: CreateProductDto) {
    return this.productsService.createProduct(req.user.id, data);
  }

  @Put(':id')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Update SPU & SKUs' })
  async updateProduct(@Request() req: any, @Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.updateProduct(req.user.id, +id, data);
  }

  @Delete(':id')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Delete SPU' })
  async deleteProduct(@Request() req: any, @Param('id') id: string) {
    return this.productsService.deleteProduct(req.user.id, +id);
  }
}
