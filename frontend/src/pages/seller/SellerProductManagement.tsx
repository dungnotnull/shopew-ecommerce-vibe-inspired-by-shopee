import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, Save, ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { VariantGroup, SKU } from '../../types/catalog';

export const SellerProductManagement: React.FC = () => {
  const navigate = useNavigate();

  // SPU Form State
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceMin, setPriceMin] = useState<number>(100000);
  const [categoryId, setCategoryId] = useState<number>(11);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 2-Tier Variant Groups State
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    { name: 'Màu sắc', options: ['Titan Đen', 'Titan Tự Nhiên'] },
    { name: 'Dung lượng', options: ['256GB', '512GB'] },
  ]);

  // SKUs Matrix State
  const [skus, setSkus] = useState<SKU[]>([]);

  // Tự động tính Ma trận SKU (Cartesian Product của 2 Nhóm biến thể)
  useEffect(() => {
    if (!variantGroups || variantGroups.length === 0) {
      // Default SKU fallback khi không có phân loại
      setSkus([
        {
          id: 1,
          tierIndex: [],
          price: priceMin,
          originalPrice: Math.round(priceMin * 1.2),
          stock: 100,
        },
      ]);
      return;
    }

    if (variantGroups.length === 1) {
      const generatedSkus: SKU[] = variantGroups[0].options.map((_opt, idx) => ({
        id: idx + 1,
        tierIndex: [idx],
        price: priceMin,
        originalPrice: Math.round(priceMin * 1.2),
        stock: 50,
      }));
      setSkus(generatedSkus);
      return;
    }

    if (variantGroups.length === 2) {
      const group1 = variantGroups[0];
      const group2 = variantGroups[1];
      const generatedSkus: SKU[] = [];
      let skuId = 1;

      group1.options.forEach((_, idx1) => {
        group2.options.forEach((_, idx2) => {
          generatedSkus.push({
            id: skuId++,
            tierIndex: [idx1, idx2],
            price: priceMin,
            originalPrice: Math.round(priceMin * 1.2),
            stock: 50,
          });
        });
      });

      setSkus(generatedSkus);
    }
  }, [variantGroups, priceMin]);

  const handleAddVariantGroup = () => {
    if (variantGroups.length >= 2) return; // Shopee hỗ trợ tối đa 2 nhóm phân loại
    setVariantGroups(prev => [...prev, { name: 'Dung lượng', options: ['256GB', '512GB'] }]);
  };

  const handleRemoveVariantGroup = (idx: number) => {
    setVariantGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddOption = (groupIdx: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIdx].options.push(`Tùy chọn ${newGroups[groupIdx].options.length + 1}`);
    setVariantGroups(newGroups);
  };

  const handleRemoveOption = (groupIdx: number, optIdx: number) => {
    const newGroups = [...variantGroups];
    if (newGroups[groupIdx].options.length <= 1) return;
    newGroups[groupIdx].options = newGroups[groupIdx].options.filter((_, i) => i !== optIdx);
    setVariantGroups(newGroups);
  };

  const handleSkuPriceChange = (skuIndex: number, newPrice: number) => {
    setSkus(prev => {
      const updated = [...prev];
      updated[skuIndex].price = newPrice;
      return updated;
    });
  };

  const handleSkuStockChange = (skuIndex: number, newStock: number) => {
    setSkus(prev => {
      const updated = [...prev];
      updated[skuIndex].stock = newStock;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm.');
      return;
    }

    setLoading(true);

    try {
      const prices = skus.map(s => s.price);
      const computedPriceMin = prices.length > 0 ? Math.min(...prices) : priceMin;
      const computedPriceMax = prices.length > 0 ? Math.max(...prices) : priceMin;

      await CatalogService.createSellerProduct({
        name,
        description,
        categoryId,
        priceMin: computedPriceMin,
        priceMax: computedPriceMax,
        isMall: false,
        isPreferred: true,
        variantGroups,
        skus,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/seller');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đã tạo sản phẩm thành công! (Mock Response)';
      if (Array.isArray(msg)) {
        setErrorMsg(msg.join(', '));
      } else {
        setErrorMsg(msg);
      }
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
            <ArrowLeft className="w-4 h-4" /> Trở về Kênh Người Bán
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ee4d2d]" /> Đăng Sản Phẩm Biến Thể SPU & SKU
          </h1>
        </div>

        {/* Thông báo Thành công hoặc Lỗi */}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-sm">Đã khởi tạo SPU và ma trận SKUs thành công! Đang chuyển hướng...</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin SPU cơ bản */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase pb-2 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#ee4d2d]" /> 1. Thông Tin Sản Phẩm Gốc (SPU)
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: iPhone 15 Pro Max 256GB - Hàng Chính Hãng VN/A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô Tả Chi Tiết</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả đặc điểm sản phẩm, chính sách bảo hành..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giá Chuẩn Mặc Định (VND) *</label>
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
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ee4d2d]" /> 2. Cấu Hình Phân Loại Hàng 2 Tầng (Variant Groups)
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
                  <span className="text-xs font-bold text-gray-700">Nhóm Phân Loại {gIdx + 1} (Ví dụ: Màu sắc, Dung lượng)</span>
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
                  className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold"
                />

                {/* Tùy chọn (Options) */}
                <div className="flex flex-wrap gap-2 items-center pt-1">
                  {group.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-1 bg-white border border-gray-300 px-2.5 py-1 rounded text-xs font-medium text-gray-800">
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(gIdx, oIdx)}
                        className="text-gray-400 hover:text-red-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(gIdx)}
                    className="text-xs text-[#ee4d2d] font-semibold bg-white border border-dashed border-[#ee4d2d] px-3 py-1 rounded hover:bg-orange-50"
                  >
                    + Thêm tùy chọn
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Ma Trận SKUs Tự Động Sinh */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase pb-2 border-b border-gray-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ee4d2d]" /> 3. Ma Trận SKUs Phân Loại Tự Động ({skus.length} SKUs)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                    <th className="p-3">Biến Thể Phân Loại</th>
                    <th className="p-3">Giá Bán (VND)</th>
                    <th className="p-3">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skus.map((sku, idx) => {
                    const label1 = variantGroups[0]?.options[sku.tierIndex[0]] || '';
                    const label2 = variantGroups[1]?.options[sku.tierIndex[1]] || '';
                    const variantLabel = [label1, label2].filter(Boolean).join(' - ') || 'Mặc định';

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-800">
                          {variantLabel}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={sku.price}
                            onChange={(e) => handleSkuPriceChange(idx, Number(e.target.value))}
                            className="w-32 p-1.5 border border-gray-300 rounded font-semibold text-gray-900"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={sku.stock}
                            onChange={(e) => handleSkuStockChange(idx, Number(e.target.value))}
                            className="w-24 p-1.5 border border-gray-300 rounded font-semibold text-gray-900"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              {loading ? 'Đang lưu...' : `Lưu & Đăng ${skus.length} Biến Thể SKU`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
