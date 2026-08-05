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

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  skuId: number;
  price: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    images?: string[];
  };
  sku?: {
    id: number;
    tierIndex: number[];
  };
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  orderGroupId?: string;
  userId: number;
  shopId: number;
  shippingAddressId?: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  shop?: {
    id: number;
    name: string;
  };
  shippingAddress?: {
    id: number;
    receiverName?: string;
    receiverPhone?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderItems: OrderItem[];
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

  // Thêm sản phẩm vào giỏ hàng (cộng dồn): POST /api/v1/cart
  addToCart: async (payload: CartItemPayload): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/cart', payload);
      return response.data;
    } catch {
      const response = await apiClient.post('/api/v1/cart', payload);
      return response.data;
    }
  },

  // Cập nhật chính xác số lượng sản phẩm trong giỏ hàng: PUT /api/v1/cart/:variantId
  updateCartItem: async (variantId: number, quantity: number): Promise<any> => {
    const response = await apiClient.put(`/v1/cart/${variantId}`, { quantity });
    return response.data?.data || response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng: DELETE /api/v1/cart/:variantId
  removeCartItem: async (variantId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/v1/cart/${variantId}`);
    return response.data?.data || response.data;
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

  // Lấy danh sách lịch sử đơn hàng của User: GET /api/v1/orders
  getUserOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get('/v1/orders');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Lấy chi tiết đơn hàng: GET /api/v1/orders/:id
  getOrderDetails: async (orderId: number): Promise<Order | null> => {
    try {
      const response = await apiClient.get(`/v1/orders/${orderId}`);
      return response.data?.data || response.data || null;
    } catch {
      return null;
    }
  },

  // Hủy đơn hàng: PUT /api/v1/orders/:id/cancel
  cancelOrder: async (orderId: number): Promise<{ id: number; status: OrderStatus }> => {
    const response = await apiClient.put(`/v1/orders/${orderId}/cancel`);
    return response.data?.data || response.data;
  },

  // Thanh toán ngay cho đơn hàng PENDING_PAYMENT: POST /api/v1/orders/:id/pay
  payOrder: async (orderId: number): Promise<{ id: number; status: OrderStatus }> => {
    const response = await apiClient.post(`/v1/orders/${orderId}/pay`);
    return response.data?.data || response.data;
  },

  // Lấy danh sách đơn hàng cho Seller: GET /api/v1/seller/orders
  getSellerOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get('/v1/seller/orders');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Seller cập nhật trạng thái đơn hàng: PUT /api/v1/seller/orders/:id/status
  updateSellerOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.put(`/v1/seller/orders/${orderId}/status`, { status });
    return response.data?.data || response.data;
  },
};
