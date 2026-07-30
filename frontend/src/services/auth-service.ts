import { apiClient } from './api-client';
import { RegisterRequestPayload, LoginRequestPayload, UserProfile } from '../types/auth';

// Service gọi API thực tế tới Backend NestJS (/api/auth) đồng bộ với AuthController mới nhất
export const authService = {
  // Gọi API Đăng ký tài khoản tới các endpoint phân quyền tương ứng trên Backend:
  // - Customer: POST /api/auth/register
  // - Seller: POST /api/auth/register-seller
  // - Admin: POST /api/auth/register-admin
  register: async (payload: RegisterRequestPayload): Promise<{ access_token: string; user: UserProfile }> => {
    let endpoint = '/auth/register';
    if (payload.role === 'SELLER') {
      endpoint = '/auth/register-seller';
    } else if (payload.role === 'ADMIN') {
      endpoint = '/auth/register-admin';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, ...dto } = payload;
    const response = await apiClient.post(endpoint, dto);
    return response.data.data || response.data;
  },

  // Gọi API Đăng nhập thực tế: POST /api/auth/login
  login: async (payload: LoginRequestPayload): Promise<{ access_token: string; user: UserProfile }> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data.data || response.data;
  },

  // Gọi API lấy thông tin Profile & Role của người dùng hiện tại từ CSDL: GET /api/auth/me
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data || response.data;
  },

  // Gọi API Khôi phục mật khẩu: POST /api/auth/forgot-password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data.data || response.data;
  },
};
