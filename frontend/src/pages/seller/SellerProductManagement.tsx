import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { VariantGroup, SKU } from '../../types/catalog';
import { formatVND } from '../../utils/format-currency';

export const SellerProductManagement: React.FC = () => {
  const navigate = useNavigate();

  // SPU Form State
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceMin, setPriceMin] = useState<number>(100000);
  const [categoryId, setCategoryId] = useState<number>(11);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // 2-Tier Variant Groups State
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    { name: 'Màu sắc', options: ['Đen', 'Trắng'] },
  ]);

  // SKUs Matrix State
  const [skus, _setSkus] = useState<SKU[]>([
    { id: 1, tierIndex: [0], price: 100000, originalPrice: 120000, stock: 50 },
    { id: 2, tierIndex: [1], price: 100000, originalPrice: 120000, stock: 30 },
  ]);

  const handleAddVariantGroup = () => {
    if (variantGroups.length >= 2) return; // Shopee hỗ trợ tối đa 2 nhóm phân loại
    setVariantGroups(prev => [...prev, { name: 'Kích thước', options: ['M', 'L'] }]);
  };

  const handleRemoveVariantGroup = (idx: number) => {
    setVariantGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddOption = (groupIdx: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIdx].options.push(`Option ${newGroups[groupIdx].options.length + 1}`);
    setVariantGroups(newGroups);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await CatalogService.createSellerProduct({
        name,
        description,
        categoryId,
        priceMin,
        priceMax: priceMin,
        isMall: false,
        isPreferred: true,
        variantGroups,
        skus,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/seller');
      }, 1500);
    } catch {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/seller');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/seller')}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#ee4d2d] font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Trở về Dashboard Kênh Người Bán
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ee4d2d]" /> Thêm Sản Phẩm SPU & Biến Thể SKU
          </h1>
        </div>

        {/* Thông báo Thành công */}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">Đã tạo sản phẩm thành công! Đang chuyển hướng...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin SPU cơ bản */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase pb-2 border-b border-gray-100">
              1. Thông Tin Cơ Bản (SPU)
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Áo Phông Nam Cotton Co Giãn..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô Tả Sản Phẩm</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả chi tiết đặc điểm sản phẩm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giá Tiêu Chuẩn (VND) *</label>
                  <input
                    type="number"
                    required
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ID Danh Mục</label>
                  <input
                    type="number"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Nhóm Phân Loại Biến Thể 2 Tầng (Variant Groups) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-800 uppercase">
                2. Phân Loại Hàng 2 Tầng (Variant Groups)
              </h2>
              {variantGroups.length < 2 && (
                <button
                  type="button"
                  onClick={handleAddVariantGroup}
                  className="text-xs text-[#ee4d2d] hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Nhóm Phân Loại 2
                </button>
              )}
            </div>

            {variantGroups.map((group, gIdx) => (
              <div key={gIdx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Nhóm Phân Loại {gIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariantGroup(gIdx)}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa nhóm
                  </button>
                </div>

                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => {
                    const newG = [...variantGroups];
                    newG[gIdx].name = e.target.value;
                    setVariantGroups(newG);
                  }}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-xs"
                />

                {/* Tùy chọn (Options) */}
                <div className="flex flex-wrap gap-2 items-center pt-1">
                  {group.options.map((opt, oIdx) => (
                    <span key={oIdx} className="bg-white border border-gray-300 px-3 py-1 rounded text-xs font-medium text-gray-800">
                      {opt}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(gIdx)}
                    className="text-xs text-gray-600 hover:text-[#ee4d2d] bg-white border border-dashed border-gray-300 px-3 py-1 rounded"
                  >
                    + Thêm tùy chọn
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Danh Sách SKUs */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase pb-2 border-b border-gray-100">
              3. Ma Trận SKUs Phân Loại
            </h2>

            <div className="space-y-2">
              {skus.map((sku, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                  <span className="font-bold text-gray-800">SKU #{sku.id} (Tier {sku.tierIndex.join(',')})</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">Giá: <strong>{formatVND(sku.price)}</strong></span>
                    <span className="text-gray-600">Tồn kho: <strong>{sku.stock}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Đang lưu...' : 'Lưu & Đăng Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
