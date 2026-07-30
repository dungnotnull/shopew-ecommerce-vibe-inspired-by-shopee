import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
