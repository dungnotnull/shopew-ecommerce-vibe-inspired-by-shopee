import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ (Cộng dồn số lượng)' })
  @ApiResponse({ status: 201, description: 'Cart item added' })
  addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Put(':variantId')
  @ApiOperation({ summary: 'Cập nhật chính xác số lượng sản phẩm' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  updateCartItem(@Request() req: any, @Param('variantId') variantId: string, @Body() body: { quantity: number }) {
    return this.cartService.updateCartItem(req.user.id, Number(variantId), body.quantity);
  }

  @Delete(':variantId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiResponse({ status: 200, description: 'Cart item deleted' })
  removeCartItem(@Request() req: any, @Param('variantId') variantId: string) {
    return this.cartService.removeCartItem(req.user.id, Number(variantId));
  }

  @Get()
  @ApiOperation({ summary: 'Fetch cart grouped by shop' })
  @ApiResponse({ status: 200, description: 'Cart fetched successfully' })
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }
}
