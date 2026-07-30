import { apiClient } from './api-client';

export interface AdminDashboardData {
  totalUsers: number;
  totalShops: number;
  activeDisputes: number;
  totalGMV: number;
}

// Service gọi API thực tế Cổng Quản Trị Admin từ Backend NestJS (/api/admin)
export const adminService = {
  // Gọi API lấy dữ liệu tổng quan Admin Dashboard: GET /api/admin/dashboard (Yêu cầu JWT Bearer + Role ADMIN)
  getDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data || response.data;
  },
};
