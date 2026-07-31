import axios from 'axios';

// Khởi tạo instance Axios tập trung trỏ tới API Endpoint (mặc định qua Proxy /api tới Backend NestJS Port 3000)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
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

// Response Interceptor: Tự động "giải nén" (unwrap) wrapper response.data.data của NestJS TransformInterceptor
apiClient.interceptors.response.use(
  (response) => {
    // Nếu response từ NestJS Backend chứa thuộc tính bọc 'data', tự động trích xuất lấy dữ liệu lõi
    if (response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Xóa thông tin xác thực cũ
      localStorage.removeItem('shopew_token');
      localStorage.removeItem('shopew_user');
    }
    return Promise.reject(error);
  }
);
