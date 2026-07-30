import axios from 'axios';

// Khởi tạo instance Axios tập trung với Base URL chuẩn /api/v1
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Tự động gắn Bearer Token nếu tồn tại trong LocalStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopew_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi hệ thống 401 Unauthorized hoặc 403 Forbidden
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hết hạn token -> Clear session và chuyển hướng đăng nhập
      localStorage.removeItem('shopew_token');
      localStorage.removeItem('shopew_user');
    }
    return Promise.reject(error);
  }
);
