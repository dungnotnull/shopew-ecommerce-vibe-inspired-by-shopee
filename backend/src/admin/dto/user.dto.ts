import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Role of the user' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Full name of the user' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Role of the user' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Is the user active or banned' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'Is the user active or banned' })
  @IsBoolean()
  isActive: boolean;
}
