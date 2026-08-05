import React, { useEffect, useState } from 'react';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { Store, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { sellerService } from '../../services/seller-service';

export const SellerProfilePage: React.FC = () => {
  const [shopName, setShopName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const fetchShopProfile = async () => {
    setLoading(true);
    try {
      const data = await sellerService.getShopMe();
      if (data) {
        setShopName(data.name || '');
        setDescription(data.description || '');
      }
    } catch {
      // Bỏ qua lỗi nếu shop chưa khởi tạo
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!shopName.trim()) {
      setErrorMsg('Tên Gian Hàng không được để trống.');
      return;
    }

    setSaving(true);
    try {
      await sellerService.updateShopMe({
        name: shopName.trim(),
        description: description.trim(),
      });
      setSuccessMsg('✅ Đã cập nhật thông tin Gian Hàng thành công!');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể cập nhật thông tin Shop.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-2xl mx-auto space-y-6 font-['Roboto',sans-serif]">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-[#ee4d2d]" />
            Hồ Sơ Gian Hàng Gian Hàng
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý tên shop và mô tả thương hiệu hiển thị cho Khách Hàng trên Shopew.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Đang tải hồ sơ Gian Hàng...</div>
          ) : (
            <form onSubmit={handleUpdateShop} className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1.5">Tên Gian Hàng (Shop Name)</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Nhập tên shop của bạn"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1.5">Mô Tả Gian Hàng (Description)</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu về gian hàng, chính sách bán hàng và bảo hành..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ee4d2d] focus:border-[#ee4d2d]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#ee4d2d] hover:bg-[#d73211] text-white px-5 py-2.5 rounded-md font-bold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};
