import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Add to cart or update quantity' })
  @ApiResponse({ status: 201, description: 'Cart item upserted' })
  upsertCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.upsertCart(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch cart grouped by shop' })
  @ApiResponse({ status: 200, description: 'Cart fetched successfully' })
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }
}
