import { apiClient, formatImageUrl } from './api-client';

export interface AdminDashboardData {
  totalUsers: number;
  totalShops: number;
  activeDisputes: number;
  totalGMV: number;
}

export interface AdminBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerPayload {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Service gọi API thực tế Cổng Quản Trị Admin từ Backend NestJS (/api/admin)
export const adminService = {
  // Lấy dữ liệu tổng quan Admin Dashboard: GET /api/admin/dashboard
  getDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data || response.data;
  },

  // --- QUẢN LÝ NGƯỜI DÙNG (ADMIN USER MANAGEMENT) ---
  // Lấy danh sách Người dùng có phân trang: GET /api/admin/users
  getUsers: async (page = 1, limit = 20): Promise<{ data: AdminUser[]; total: number; totalPages: number }> => {
    const response = await apiClient.get('/admin/users', { params: { page, limit } });
    const resData = response.data;
    let rawList: AdminUser[] = [];
    let total = 0;
    let totalPages = 1;

    if (Array.isArray(resData)) {
      rawList = resData;
      total = resData.length;
    } else if (resData && typeof resData === 'object') {
      if (Array.isArray(resData.data)) {
        rawList = resData.data;
        total = resData.total ?? rawList.length;
        totalPages = resData.totalPages ?? Math.ceil(total / limit) ?? 1;
      } else if (Array.isArray(resData.users)) {
        rawList = resData.users;
        total = resData.total ?? rawList.length;
        totalPages = resData.totalPages ?? Math.ceil(total / limit) ?? 1;
      }
    }

    return { data: rawList, total, totalPages };
  },

  // Lấy chi tiết thông tin Người dùng: GET /api/admin/users/:id
  getUserDetail: async (id: number): Promise<AdminUser> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.data || response.data;
  },

  // Cập nhật thông tin Người dùng: PUT /api/admin/users/:id
  updateUser: async (id: number, payload: { fullName?: string; phone?: string; role?: 'CUSTOMER' | 'SELLER' | 'ADMIN' }): Promise<AdminUser> => {
    const response = await apiClient.put(`/admin/users/${id}`, payload);
    return response.data.data || response.data;
  },

  // Cập nhật trạng thái Khóa/Mở khóa tài khoản: PUT /api/admin/users/:id/status
  updateUserStatus: async (id: number, isActive: boolean): Promise<AdminUser> => {
    const response = await apiClient.put(`/admin/users/${id}/status`, { isActive });
    return response.data.data || response.data;
  },

  // Xóa tài khoản Người dùng: DELETE /api/admin/users/:id
  deleteUser: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // --- QUẢN LÝ BANNER ---
  // Lấy danh sách Banners cho Admin: GET /api/admin/banners
  getBanners: async (page = 1, limit = 50): Promise<{ data: AdminBanner[]; total: number }> => {
    const response = await apiClient.get('/admin/banners', { params: { page, limit } });
    const resData = response.data;
    let rawList: any[] = [];
    let total = 0;
    if (Array.isArray(resData)) {
      rawList = resData;
      total = resData.length;
    } else if (resData && typeof resData === 'object') {
      if (Array.isArray(resData.data)) {
        rawList = resData.data;
        total = resData.total ?? rawList.length;
      } else if (Array.isArray(resData.banners)) {
        rawList = resData.banners;
        total = resData.total ?? rawList.length;
      }
    }
    const formattedList: AdminBanner[] = rawList.map((b: any) => ({
      ...b,
      imageUrl: formatImageUrl(b.imageUrl),
    }));
    return { data: formattedList, total };
  },

  // Tạo mới Banner: POST /api/admin/banners
  createBanner: async (payload: CreateBannerPayload): Promise<AdminBanner> => {
    const response = await apiClient.post('/admin/banners', payload);
    return response.data;
  },

  // Cập nhật Banner: PUT /api/admin/banners/:id
  updateBanner: async (id: number, payload: Partial<CreateBannerPayload>): Promise<AdminBanner> => {
    const response = await apiClient.put(`/admin/banners/${id}`, payload);
    return response.data;
  },

  // Xóa Banner: DELETE /api/admin/banners/:id
  deleteBanner: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/admin/banners/${id}`);
    return response.data;
  },

  // Upload hình ảnh Banner / Admin Assets: POST /api/v1/upload
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/v1/upload', formData);
    const data = response.data;
    const rawUrl = typeof data === 'string' ? data : (data?.url || data?.data?.url || (typeof data === 'object' && data !== null ? data.url : ''));
    return formatImageUrl(rawUrl, false);
  },
};


