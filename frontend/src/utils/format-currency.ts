/** 
 * Format số tiền nguyên thành chuỗi VND chuẩn Shopee (ví dụ: 150000 -> 150.000 ₫)
 */
export const formatVND = (amount: number | null | undefined): string => {
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫';
  }
  return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
};
