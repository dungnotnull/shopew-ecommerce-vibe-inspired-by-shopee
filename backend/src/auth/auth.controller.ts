import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'Customer successfully registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto, 'CUSTOMER');
  }

  @Post('register-seller')
  @ApiOperation({ summary: 'Register a new seller account' })
  @ApiResponse({ status: 201, description: 'Seller successfully registered' })
  registerSeller(@Body() dto: RegisterDto) {
    return this.authService.register(dto, 'SELLER');
  }

  @Post('register-admin')
  @ApiOperation({ summary: 'Register a new admin account' })
  @ApiResponse({ status: 201, description: 'Admin successfully registered' })
  registerAdmin(@Body() dto: RegisterDto) {
    return this.authService.register(dto, 'ADMIN');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset mock token generated' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile and role' })
  @ApiResponse({ status: 200, description: 'Returns the latest user profile' })
  getMe(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = req.user;
    return result;
  }
}
