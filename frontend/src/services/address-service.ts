import { apiClient } from './api-client';

export interface AddressPayload {
  id?: number;
  receiverName: string;
  receiverPhone: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  isDefault?: boolean;
}

export const addressService = {
  // Lấy danh sách địa chỉ của User: GET /api/v1/users/addresses
  getUserAddresses: async (): Promise<AddressPayload[]> => {
    try {
      const response = await apiClient.get('/v1/users/addresses');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Tạo địa chỉ mới: POST /api/v1/users/addresses
  createAddress: async (payload: AddressPayload): Promise<AddressPayload> => {
    const response = await apiClient.post('/v1/users/addresses', payload);
    return response.data?.data || response.data;
  },

  // Cập nhật địa chỉ: PUT /api/v1/users/addresses/:id
  updateAddress: async (id: number, payload: Partial<AddressPayload>): Promise<AddressPayload> => {
    const response = await apiClient.put(`/v1/users/addresses/${id}`, payload);
    return response.data?.data || response.data;
  },

  // Xóa địa chỉ: DELETE /api/v1/users/addresses/:id
  deleteAddress: async (id: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/v1/users/addresses/${id}`);
    return response.data?.data || response.data;
  },
};
