import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsInt()
  variantId: number;

  @IsInt()
  quantity: number;
}

export class ShopVoucherDto {
  @IsInt()
  shopId: number;

  @IsInt()
  voucherId: number;
}

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];

  @IsInt()
  shippingAddressId: number;

  @IsOptional()
  @IsInt()
  platformVoucherId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopVoucherDto)
  shopVouchers?: ShopVoucherDto[];

  @IsOptional()
  @IsInt()
  useCoins?: number;
}
