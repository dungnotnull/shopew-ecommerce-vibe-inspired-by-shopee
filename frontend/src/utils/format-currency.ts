/** 
 * Format số tiền sang định dạng tiền tệ Việt Nam Đồng (VND) chuẩn Shopee.
 * Ví dụ: 25000000 -> 25.000.000 ₫
 */
export const formatVND = (amount: number): string => {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};
