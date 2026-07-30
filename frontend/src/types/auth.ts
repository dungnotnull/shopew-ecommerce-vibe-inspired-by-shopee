// Định nghĩa Type thông tin User xác thực khớp với Prisma Model & DTO Backend
export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
}

// Payload Đăng nhập khớp với LoginDto Backend
export interface LoginRequestPayload {
  email: string;
  password: string;
}

// Response Đăng nhập / Đăng ký từ API
export interface AuthResponseData {
  accessToken: string;
  user: UserProfile;
}

// Payload Đăng ký tài khoản khớp với RegisterDto Backend
export interface RegisterRequestPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}
