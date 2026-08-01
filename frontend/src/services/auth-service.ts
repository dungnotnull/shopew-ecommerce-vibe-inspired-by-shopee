import { apiClient } from './api-client';
import { RegisterRequestPayload, LoginRequestPayload, UserProfile } from '../types/auth';

// Service gọi API thực tế tới Backend NestJS (/api/auth) tách bạch rõ ràng theo từng Role
export const authService = {
  // 1. Gọi API Đăng ký Khách Hàng (Role CUSTOMER): POST /api/auth/register
  registerCustomer: async (payload: Omit<RegisterRequestPayload, 'role'>): Promise<{ access_token: string; user: UserProfile }> => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  // 2. Gọi API Đăng ký Kênh Người Bán (Role SELLER): POST /api/auth/register-seller
  registerSeller: async (payload: Omit<RegisterRequestPayload, 'role'>): Promise<{ access_token: string; user: UserProfile }> => {
    const response = await apiClient.post('/auth/register-seller', payload);
    return response.data;
  },

  // 3. Gọi API Đăng ký Quản Trị Viên (Role ADMIN): POST /api/auth/register-admin
  registerAdmin: async (payload: Omit<RegisterRequestPayload, 'role'>): Promise<{ access_token: string; user: UserProfile }> => {
    const response = await apiClient.post('/auth/register-admin', payload);
    return response.data;
  },

  // Hàm helper điều hướng đăng ký tự động theo Role
  register: async (payload: RegisterRequestPayload): Promise<{ access_token: string; user: UserProfile }> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, ...dto } = payload;
    if (role === 'SELLER') {
      return authService.registerSeller(dto);
    } else if (role === 'ADMIN') {
      return authService.registerAdmin(dto);
    } else {
      return authService.registerCustomer(dto);
    }
  },

  // Gọi API Đăng nhập thực tế: POST /api/auth/login
  login: async (payload: LoginRequestPayload): Promise<{ access_token: string; user: UserProfile }> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  // Gọi API lấy thông tin Profile & Role của người dùng hiện tại từ CSDL: GET /api/auth/me
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Gọi API Khôi phục mật khẩu: POST /api/auth/forgot-password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
};
