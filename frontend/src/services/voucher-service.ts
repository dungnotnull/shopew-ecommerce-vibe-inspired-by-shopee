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

export interface FlashSaleItem {
  id: number;
  name: string;
  priceMin: number;
  priceMax: number;
  discountPercentage: number;
  soldCount: number;
  stock: number;
  thumbnailUrl: string;
}

export const voucherService = {
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

  // Admin tạo Phiên Flash Sale: POST /api/v1/admin/flash-sales
  createFlashSaleSession: async (payload: { startTime: string; endTime: string }): Promise<any> => {
    const response = await apiClient.post('/v1/admin/flash-sales', payload);
    return response.data?.data || response.data;
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
};
