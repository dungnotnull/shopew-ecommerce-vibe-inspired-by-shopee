import { create } from 'zustand';
import { UserProfile } from '../types/auth';
import { authService } from '../services/auth-service';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthSession: (token: string, user: UserProfile) => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

// Zustand Store quản lý trạng thái xác thực người dùng kết nối trực tiếp API Backend
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Thiết lập session sau khi đăng nhập/đăng ký thành công từ API Backend
  setAuthSession: (token, user) => {
    localStorage.setItem('shopew_token', token);
    localStorage.setItem('shopew_user', JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Cập nhật thông tin profile cục bộ
  updateUser: (updatedUser) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedUser };
      localStorage.setItem('shopew_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  // Đăng xuất xóa bỏ token và thông tin user
  logout: () => {
    localStorage.removeItem('shopew_token');
    localStorage.removeItem('shopew_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Gọi API GET /api/auth/me để khôi phục phiên làm việc thực tế từ Backend khi mở lại trang
  initAuth: async () => {
    const token = localStorage.getItem('shopew_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      // Gọi API thực tế xác thực Token và lấy thông tin Profile + Role từ Server NestJS
      const userProfile = await authService.getMe();
      localStorage.setItem('shopew_user', JSON.stringify(userProfile));
      set({
        token,
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token không hợp lệ hoặc server từ chối -> Clear session
      localStorage.removeItem('shopew_token');
      localStorage.removeItem('shopew_user');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
