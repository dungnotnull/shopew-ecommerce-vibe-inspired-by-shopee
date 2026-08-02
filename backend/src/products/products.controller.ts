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
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@ApiTags('Products')
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get products list (alias for search)' })
  async getProductsList(@Request() req: any, @Query() query: SearchProductsDto) {
    const userId = req.user?.id;
    return this.productsService.searchProducts(query, userId);
  }

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search and filter products' })
  async searchProducts(@Request() req: any, @Query() query: SearchProductsDto) {
    const userId = req.user?.id;
    return this.productsService.searchProducts(query, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SPU and its SKUs (public)' })
  async getProduct(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.productsService.getProductDetails(+id, userId);
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

  @Get(':id')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get product details for the current seller' })
  async getProduct(@Request() req: any, @Param('id') id: string) {
    return this.productsService.getSellerProductById(req.user.id, +id);
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
