import React, { useState } from 'react';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { Ticket, Plus, Tag, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { voucherService } from '../../services/voucher-service';
import { formatVND } from '../../utils/format-currency';

export const SellerVoucherListPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [maxDiscount, setMaxDiscount] = useState<number>(50000);
  const [minOrderValue, setMinOrderValue] = useState<number>(100000);
  const [maxUsage, setMaxUsage] = useState<number>(100);
  const [expiresAt, setExpiresAt] = useState<string>('2026-12-31T23:59');

  const [fetching, setFetching] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Nạp danh sách Voucher thực tế của Gian hàng từ API Backend: GET /api/v1/seller/vouchers
  const fetchShopVouchers = async () => {
    setFetching(true);
    try {
      const data = await voucherService.getSellerShopVouchers();
      setVouchers(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Hệ thống Voucher phía Backend hiện đang bảo trì (Thiếu VoucherController router).');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      }
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchShopVouchers();
  }, []);

  // Handler tạo Mã Giảm Giá Shop (POST /api/v1/seller/vouchers)
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!code.trim()) {
      setError('Vui lòng nhập Mã Voucher (Ví dụ: SHOPKHM20).');
      return;
    }

    setLoading(true);
    try {
      await voucherService.createShopVoucher({
        code: code.trim().toUpperCase(),
        discountPercentage: Number(discountPercentage),
        maxDiscount: Number(maxDiscount),
        minOrderValue: Number(minOrderValue),
        maxUsage: Number(maxUsage),
        expiresAt: new Date(expiresAt).toISOString(),
      });

      setSuccessMsg(`✅ Đã tạo thành công Mã giảm giá Shop: ${code.toUpperCase()}`);
      setIsModalOpen(false);
      setCode('');
      await fetchShopVouchers();
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Không thể kết nối API POST /api/v1/seller/vouchers. Phía Backend chưa đăng ký VouchersController.');
      } else {
        setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo Mã giảm giá Shop.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Header Kênh Marketing / Voucher Shop */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-[#ee4d2d]" />
              Kênh Marketing & Voucher Gian Hàng
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Tạo các mã giảm giá dành riêng cho Khách hàng khi mua hàng tại Shop của bạn để tăng doanh số.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo Voucher Shop Mới
          </button>
        </div>

        {/* Thông báo thành công / lỗi */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Danh sách Voucher Shop */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-orange-50/50 border-b border-gray-200 font-bold text-gray-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ee4d2d]" />
              Mã Giảm Giá Gian Hàng ({vouchers.length})
            </div>
            {fetching && <span className="text-xs text-gray-400 font-normal">Đang tải...</span>}
          </div>

          <div className="divide-y divide-gray-100">
            {vouchers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                Gian hàng chưa có mã giảm giá nào. Bấm "Tạo Voucher Shop Mới" ở trên để phát hành mã.
              </div>
            ) : (
              vouchers.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-[#ee4d2d] font-black text-sm">
                      {v.discountPercentage}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{v.code}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">ĐANG CHẠY</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Giảm {v.discountPercentage}% tối đa {formatVND(v.maxDiscount)} • Đơn tối thiểu {formatVND(v.minOrderValue)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>Lượt dùng: <strong>{v.usedCount || 0}/{v.maxUsage}</strong></div>
                    <div>Hạn dùng: {new Date(v.expiresAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Tạo Voucher Shop */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#ee4d2d]" />
                Tạo Mã Giảm Giá Cho Gian Hàng
              </h2>

              <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mã Voucher (Code)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: SHOPGIAM20K"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] uppercase font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">% Giảm Giá</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Giảm Tối Đa (VND)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Đơn Hàng Tối Thiểu (VND)</label>
                    <input
                      type="number"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số Lượng Tối Đa</label>
                    <input
                      type="number"
                      value={maxUsage}
                      onChange={(e) => setMaxUsage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ngày Hết Hạn</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded-md font-bold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo Mã Ngay'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};
