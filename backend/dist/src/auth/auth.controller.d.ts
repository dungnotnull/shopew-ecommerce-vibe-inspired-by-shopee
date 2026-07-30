import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
        };
    }>;
    registerSeller(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
        };
    }>;
    registerAdmin(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        _mockResetTokenForTesting?: undefined;
    } | {
        message: string;
        _mockResetTokenForTesting: string;
    }>;
    getMe(req: any): any;
}
