import { create } from 'zustand';
import { UserProfile, AuthResponseData } from '../types/auth';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: AuthResponseData) => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
  logout: () => void;
  initAuth: () => void;
}

// Zustand Store quản lý trạng thái xác thực toàn ứng dụng
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Thiết lập session đăng nhập mới
  setAuth: (data) => {
    localStorage.setItem('shopew_token', data.accessToken);
    localStorage.setItem('shopew_user', JSON.stringify(data.user));
    set({
      token: data.accessToken,
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Cập nhật thông tin profile người dùng
  updateUser: (updatedUser) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedUser };
      localStorage.setItem('shopew_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  // Đăng xuất xóa bỏ token và user data
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

  // Đọc dữ liệu từ LocalStorage khi khởi chạy ứng dụng
  initAuth: () => {
    const token = localStorage.getItem('shopew_token');
    const storedUser = localStorage.getItem('shopew_user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ token, user, isAuthenticated: true, isLoading: false });
        return;
      } catch {
        // Nếu parse JSON lỗi thì tự động dọn sạch local storage
        localStorage.removeItem('shopew_token');
        localStorage.removeItem('shopew_user');
      }
    }
    set({ isLoading: false });
  },
}));
