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
    // Tự động xóa Content-Type nếu payload là FormData để trình duyệt gán boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

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

// Helper chuẩn hóa đường dẫn hình ảnh tĩnh từ Backend (xử lý bóc tách localhost hardcode, /uploads & /api/uploads)
export const formatImageUrl = (url?: string | null, absolute = false): string => {
  if (!url) return '';
  let clean = url.trim();

  // Bóc tách loại bỏ domain localhost nếu bị lỡ gán cứng host/port của frontend/backend
  if (clean.includes('localhost:3000') || clean.includes('localhost:3001')) {
    clean = clean.replace(/^https?:\/\/localhost:(3000|3001)/, '');
  }

  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }

  let relativePath = clean;
  if (clean.startsWith('/uploads/')) {
    relativePath = `/api${clean}`;
  } else if (clean.startsWith('uploads/')) {
    relativePath = `/api/${clean}`;
  } else if (!clean.startsWith('/') && !clean.startsWith('api/')) {
    relativePath = `/api/uploads/${clean}`;
  }

  if (absolute && typeof window !== 'undefined') {
    return `${window.location.origin}${relativePath}`;
  }
  return relativePath;
};

