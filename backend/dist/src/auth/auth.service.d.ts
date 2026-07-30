import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        _mockResetTokenForTesting?: undefined;
    } | {
        message: string;
        _mockResetTokenForTesting: string;
    }>;
}
