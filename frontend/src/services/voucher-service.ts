import { apiClient } from './api-client';

export interface Voucher {
  id: number;
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrderValue: number;
  maxUsage: number;
  usedCount?: number;
  expiresAt: string;
  shopId?: number | null;
  shop?: {
    id: number;
    name: string;
  };
}

export interface FlashSaleSession {
  id: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  createdAt?: string;
  itemsCount?: number;
}

export interface FlashSaleItem {
  id: number;
  sessionId?: number;
  productId: number;
  productName?: string;
  skuId?: number;
  priceMin?: number;
  priceMax?: number;
  price?: number;
  originalPrice?: number;
  discountPercentage: number;
  soldCount: number;
  promotionalStock?: number;
  stock: number;
  thumbnailUrl: string;
  skuCode?: string;
}

export const voucherService = {
  // --- VOUCHERS USER ---
  // Lấy danh sách Voucher trong ví của User: GET /api/v1/vouchers/wallet
  getWalletVouchers: async (): Promise<Voucher[]> => {
    try {
      const response = await apiClient.get('/v1/vouchers/wallet');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Lưu Voucher vào Ví User: POST /api/v1/vouchers/save
  saveVoucher: async (voucherId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/v1/vouchers/save', { voucherId });
    return response.data?.data || response.data;
  },

  // --- VOUCHERS ADMIN (PLATFORM) ---
  // Admin lấy danh sách Voucher Hệ Thống: GET /api/v1/admin/vouchers
  getAdminPlatformVouchers: async (): Promise<Voucher[]> => {
    try {
      const response = await apiClient.get('/v1/admin/vouchers');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Admin tạo Voucher hệ thống (Platform): POST /api/v1/admin/vouchers
  createPlatformVoucher: async (payload: {
    code: string;
    discountPercentage: number;
    maxDiscount: number;
    minOrderValue: number;
    maxUsage: number;
    expiresAt: string;
  }): Promise<Voucher> => {
    const response = await apiClient.post('/v1/admin/vouchers', payload);
    return response.data?.data || response.data;
  },

  // Admin cập nhật Voucher hệ thống: PUT /api/v1/admin/vouchers/:id
  updatePlatformVoucher: async (id: number, payload: Partial<Voucher>): Promise<Voucher> => {
    const response = await apiClient.put(`/v1/admin/vouchers/${id}`, payload);
    return response.data?.data || response.data;
  },

  // Admin xóa Voucher hệ thống: DELETE /api/v1/admin/vouchers/:id
  deletePlatformVoucher: async (id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/v1/admin/vouchers/${id}`);
    return response.data?.data || response.data;
  },

  // --- VOUCHERS SELLER ---
  // Seller lấy danh sách Voucher Shop: GET /api/v1/seller/vouchers
  getSellerShopVouchers: async (): Promise<Voucher[]> => {
    try {
      const response = await apiClient.get('/v1/seller/vouchers');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Seller tạo Voucher Shop: POST /api/v1/seller/vouchers
  createShopVoucher: async (payload: {
    code: string;
    discountPercentage: number;
    maxDiscount: number;
    minOrderValue: number;
    maxUsage: number;
    expiresAt: string;
  }): Promise<Voucher> => {
    const response = await apiClient.post('/v1/seller/vouchers', payload);
    return response.data?.data || response.data;
  },

  // Seller cập nhật Voucher Shop: PUT /api/v1/seller/vouchers/:id
  updateShopVoucher: async (id: number, payload: Partial<Voucher>): Promise<Voucher> => {
    const response = await apiClient.put(`/v1/seller/vouchers/${id}`, payload);
    return response.data?.data || response.data;
  },

  // Seller xóa Voucher Shop: DELETE /api/v1/seller/vouchers/:id
  deleteShopVoucher: async (id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/v1/seller/vouchers/${id}`);
    return response.data?.data || response.data;
  },

  // --- FLASH SALES ADMIN ---
  // Admin lấy danh sách các phiên Flash Sale Session: GET /api/v1/admin/flash-sales
  getAdminFlashSaleSessions: async (): Promise<FlashSaleSession[]> => {
    try {
      const response = await apiClient.get('/v1/admin/flash-sales');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Admin tạo Phiên Flash Sale: POST /api/v1/admin/flash-sales
  createFlashSaleSession: async (payload: { startTime: string; endTime: string }): Promise<FlashSaleSession> => {
    const response = await apiClient.post('/v1/admin/flash-sales', payload);
    return response.data?.data || response.data;
  },

  // Admin cập nhật Phiên Flash Sale: PUT /api/v1/admin/flash-sales/:id
  updateAdminFlashSaleSession: async (id: number, payload: { startTime?: string; endTime?: string; isActive?: boolean }): Promise<FlashSaleSession> => {
    const response = await apiClient.put(`/v1/admin/flash-sales/${id}`, payload);
    return response.data?.data || response.data;
  },

  // Admin xóa Phiên Flash Sale: DELETE /api/v1/admin/flash-sales/:id
  deleteAdminFlashSaleSession: async (id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/v1/admin/flash-sales/${id}`);
    return response.data?.data || response.data;
  },

  // --- FLASH SALES SELLER ---
  // Seller lấy danh sách các phiên Flash Sale khả dụng để đăng ký: GET /api/v1/seller/flash-sales/sessions
  getSellerFlashSaleSessions: async (): Promise<FlashSaleSession[]> => {
    try {
      const response = await apiClient.get('/v1/seller/flash-sales/sessions');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Seller lấy các sản phẩm đã đăng ký trong phiên: GET /api/v1/seller/flash-sales/:sessionId/items
  getSellerRegisteredFlashSaleItems: async (sessionId: number): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/v1/seller/flash-sales/${sessionId}/items`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Seller Đăng ký Sản Phẩm vào Flash Sale: POST /api/v1/seller/flash-sales/register
  registerFlashSaleItem: async (payload: {
    sessionId: number;
    productId: number;
    skuId: number;
    promotionalStock: number;
    discountPercentage: number;
  }): Promise<any> => {
    const response = await apiClient.post('/v1/seller/flash-sales/register', payload);
    return response.data?.data || response.data;
  },

  // --- FLASH SALES CUSTOMER / HOME ---
  // Khách hàng lấy danh sách sản phẩm Flash Sale đang diễn ra: GET /api/v1/home/flash-sale
  getActiveFlashSales: async (): Promise<FlashSaleItem[]> => {
    try {
      const response = await apiClient.get('/v1/home/flash-sale');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
