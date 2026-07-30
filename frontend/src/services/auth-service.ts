import { apiClient } from './api-client';
import { RegisterRequestPayload, LoginRequestPayload, UserProfile } from '../types/auth';

// Service gọi API thực tế tới Backend NestJS (/api/auth)
export const authService = {
  // Gọi API Đăng ký tài khoản mới: POST /api/auth/register
  register: async (payload: RegisterRequestPayload): Promise<{ access_token: string }> => {
    const response = await apiClient.post('/auth/register', payload);
    // Backend trả về dạng { success: true, data: { access_token } }
    return response.data.data || response.data;
  },

  // Gọi API Đăng nhập: POST /api/auth/login
  login: async (payload: LoginRequestPayload): Promise<{ access_token: string }> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data.data || response.data;
  },

  // Gọi API lấy thông tin Profile & Role của người dùng hiện tại: GET /api/auth/me
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
