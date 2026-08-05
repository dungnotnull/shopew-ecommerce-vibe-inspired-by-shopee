import { Controller, Post, Body, UseGuards, Request, Get, Param, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout cart items' })
  @ApiResponse({ status: 201, description: 'Checkout job queued' })
  async checkout(@Request() req: any, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy lịch sử đơn hàng của User' })
  async getUserOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn hàng' })
  async getOrderDetails(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderDetails(req.user.id, Number(id));
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  async cancelOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.id, Number(id));
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Mock API thanh toán thành công' })
  async payOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.payOrder(req.user.id, Number(id));
  }

  @Post(':id/rebuy')
  @ApiOperation({ summary: 'Mua lại đơn hàng (Thêm tất cả sản phẩm vào giỏ hàng)' })
  async rebuyOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.rebuyOrder(req.user.id, Number(id));
  }
}
