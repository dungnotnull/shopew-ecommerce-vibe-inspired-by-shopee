import { apiClient } from './api-client';

export interface SellerDashboardData {
  shopName: string;
  revenueThisMonth: number;
  newOrders: number;
  totalSPUs: number;
  shopRating: number;
  todo: {
    pendingConfirmation: number;
    pendingPickup: number;
    returnRequests: number;
    lockedProducts: number;
  };
}

// Service gọi API thực tế Kênh Người Bán từ Backend NestJS (/api/seller & /api/v1/shops)
export const sellerService = {
  // Gọi API lấy dữ liệu tổng quan Seller Dashboard: GET /api/seller/dashboard (Yêu cầu JWT Bearer + Role SELLER)
  getDashboard: async (): Promise<SellerDashboardData> => {
    const response = await apiClient.get('/seller/dashboard');
    return response.data.data || response.data;
  },

  // Gọi API Khởi Tạo Gian Hàng Shop cho Seller: POST /api/v1/shops
  createShop: async (data: { name: string; description?: string }) => {
    const response = await apiClient.post('/v1/shops', data);
    return response.data;
  },
};
