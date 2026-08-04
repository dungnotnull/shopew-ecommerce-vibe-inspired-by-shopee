import { Controller, Get } from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Flash Sales')
@Controller('v1/home/flash-sale')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active flash sale items' })
  @ApiResponse({ status: 200, description: 'List of flash sale items' })
  getActiveFlashSales() {
    return this.flashSalesService.getActiveFlashSales();
  }
}
