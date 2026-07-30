// Đĩnh nghĩa Type thông tin User xác thực
export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  createdAt?: string;
}

// Payload Đăng nhập
export interface LoginRequestPayload {
  email: string;
  passwordHash: string;
}

// Response Đăng nhập từ API
export interface AuthResponseData {
  accessToken: string;
  user: UserProfile;
}

// Payload Đăng ký tài khoản
export interface RegisterRequestPayload {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
}
