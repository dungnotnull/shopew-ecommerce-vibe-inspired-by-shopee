// Format số tiền nguyên thành chuỗi VND (ví dụ: 150000 -> 150.000 ₫)
export const formatVND = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return `${amount.toLocaleString('vi-VN')} ₫`;
};
