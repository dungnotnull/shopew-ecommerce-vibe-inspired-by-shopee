import { apiClient } from './api-client';

export interface CartItemPayload {
  variantId: number;
  quantity: number;
}

export interface CheckoutPayload {
  cartItems: CartItemPayload[];
  shippingAddressId?: number;
  platformVoucherId?: number;
  shopVouchers?: { shopId: number; voucherId: number }[];
  useCoins?: number;
}

export interface CartGroup {
  shopId: number;
  shopName: string;
  items: {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    skuId: number;
    skuCode: string;
    price: number;
    originalPrice: number;
    quantity: number;
    tierIndex: number[];
  }[];
}

export const orderService = {
  // Lấy giỏ hàng của user theo Shop: GET /api/v1/cart
  getCart: async (): Promise<CartGroup[]> => {
    try {
      const response = await apiClient.get('/v1/cart');
      const resData = response.data?.data || response.data || {};
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.shops)) return resData.shops;
      return [];
    } catch {
      return [];
    }
  },

  // Thêm / cập nhật sản phẩm vào giỏ hàng: POST /api/v1/cart
  addToCart: async (payload: CartItemPayload): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/cart', payload);
      return response.data;
    } catch {
      const response = await apiClient.post('/api/v1/cart', payload);
      return response.data;
    }
  },

  // Thực hiện Checkout / Đặt hàng: POST /api/v1/orders/checkout
  checkout: async (payload: CheckoutPayload): Promise<{ orderGroupId: string; status: string }> => {
    try {
      const response = await apiClient.post('/v1/orders/checkout', payload);
      return response.data;
    } catch {
      const response = await apiClient.post('/api/v1/orders/checkout', payload);
      return response.data;
    }
  },
};
