// Địa chỉ giao hàng của người dùng
export interface ShippingAddress {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

// Payload Tạo/Sửa địa chỉ giao hàng
export interface AddressRequestPayload {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault?: boolean;
}
