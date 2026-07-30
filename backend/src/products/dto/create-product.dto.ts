import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class VariantGroupDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: ['Red', 'Blue'] })
  @IsArray()
  @IsString({ each: true })
  options: string[];
}

export class SkuDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 150000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: [0, 1] })
  @IsArray()
  @IsNumber({}, { each: true })
  tierIndex: number[];

  @ApiPropertyOptional({ example: 'SKU-123' })
  @IsString()
  @IsOptional()
  skuCode?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ example: 'Áo thun nam' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Áo thun nam thời trang 2026...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: { brand: 'Shopew', material: 'Cotton' } })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ example: 200000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'SP-123' })
  @IsString()
  @IsOptional()
  skuCode?: string;

  @ApiPropertyOptional({ type: [VariantGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantGroupDto)
  @IsOptional()
  variantGroups?: VariantGroupDto[];

  @ApiPropertyOptional({ type: [SkuDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuDto)
  @IsOptional()
  skus?: SkuDto[];
}
