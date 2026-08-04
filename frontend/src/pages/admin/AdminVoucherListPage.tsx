import React, { useState, useEffect } from 'react';
import { voucherService, Voucher } from '../../services/voucher-service';
import { formatVND } from '../../utils/format-currency';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Ticket, Plus, Search, RefreshCw, Tag, Trash2 } from 'lucide-react';

export const AdminVoucherListPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State Modal Tạo Mới Voucher
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    maxDiscount: 50000,
    minOrderValue: 100000,
    maxUsage: 500,
    expiresAt: '2026-12-31T23:59:59',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State System Confirm Modal cho Xóa Voucher
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Giả lập nạp dữ liệu Voucher từ Backend
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // Mock / API call
      const data: Voucher[] = [
        {
          id: 1,
          code: 'SHOPEW50K',
          discountPercentage: 10,
          maxDiscount: 50000,
          minOrderValue: 100000,
          maxUsage: 1000,
          usedCount: 142,
          expiresAt: '2026-12-31T23:59:59Z',
          shopId: null,
        },
        {
          id: 2,
          code: 'FREESHIP100K',
          discountPercentage: 20,
          maxDiscount: 100000,
          minOrderValue: 200000,
          maxUsage: 500,
          usedCount: 89,
          expiresAt: '2026-10-15T23:59:59Z',
          shopId: null,
        },
      ];
      setVouchers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Xử lý Gửi Form Tạo Voucher Toàn Sàn (Platform)
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('Vui lòng nhập Mã Voucher');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await voucherService.createPlatformVoucher({
        ...formData,
        code: formData.code.toUpperCase().trim(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
      });
      showToast(`Tạo thành công Voucher mã ${created.code || formData.code}!`);
      setVouchers((prev) => [
        {
          id: created.id || Date.now(),
          code: formData.code.toUpperCase().trim(),
          discountPercentage: Number(formData.discountPercentage),
          maxDiscount: Number(formData.maxDiscount),
          minOrderValue: Number(formData.minOrderValue),
          maxUsage: Number(formData.maxUsage),
          usedCount: 0,
          expiresAt: formData.expiresAt,
          shopId: null,
        },
        ...prev,
      ]);
      setIsCreateModalOpen(false);
      setFormData({
        code: '',
        discountPercentage: 10,
        maxDiscount: 50000,
        minOrderValue: 100000,
        maxUsage: 500,
        expiresAt: '2026-12-31T23:59:59',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tạo Voucher. Vui lòng kiểm tra lại.';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý Xóa Voucher với Confirm Modal hệ thống
  const handleConfirmDeleteVoucher = () => {
    if (!deletingVoucher) return;
    setVouchers((prev) => prev.filter((v) => v.id !== deletingVoucher.id));
    showToast(`Đã xóa voucher ${deletingVoucher.code}`);
    setIsDeleteModalOpen(false);
    setDeletingVoucher(null);
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header Admin Vouchers */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản Lý Voucher Toàn Sàn (Platform Vouchers)</h1>
            <p className="text-xs text-gray-500">Tạo và phân bổ mã giảm giá áp dụng cho toàn bộ người dùng Shopew</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Tạo Voucher Mới
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã Voucher (ví dụ: SHOPEW50K)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d] focus:bg-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Bảng Danh Sách Voucher */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#ee4d2d] mx-auto" />
            <p className="text-xs font-medium">Đang nạp danh sách Voucher...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">Chưa có Voucher nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">Mã Voucher</th>
                  <th className="p-4">Mức Giảm</th>
                  <th className="p-4">Giảm Tối Đa</th>
                  <th className="p-4">Đơn Tối Thiểu</th>
                  <th className="p-4">Lượt Sử Dụng</th>
                  <th className="p-4">Hạn Sử Dụng</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-sm text-[#ee4d2d] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                        {v.code}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{v.discountPercentage}%</td>
                    <td className="p-4 text-gray-700 font-semibold">{formatVND(v.maxDiscount)}</td>
                    <td className="p-4 text-gray-700">{formatVND(v.minOrderValue)}</td>
                    <td className="p-4 text-gray-600">
                      {v.usedCount || 0} / {v.maxUsage} lượt
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(v.expiresAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setDeletingVoucher(v);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Voucher Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#ee4d2d]" /> Tạo Voucher Toàn Sàn Mới
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mã Khuyến Mãi (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: SHOPEW100K"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d] font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Giảm (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPercentage: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Giảm Tối Đa (VND)</label>
                  <input
                    type="number"
                    required
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Đơn Tối Thiểu (VND)</label>
                  <input
                    type="number"
                    required
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tổng Lượt Dùng</label>
                  <input
                    type="number"
                    required
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hạn Sử Dụng</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Confirm Popup Modal khi Xóa Voucher */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xác nhận xóa Voucher"
        message={`Bạn có chắc chắn muốn xóa mã voucher "${deletingVoucher?.code}" không? Người dùng sẽ không thể áp dụng mã này nữa.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDeleteVoucher}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingVoucher(null);
        }}
      />
    </div>
  );
};
