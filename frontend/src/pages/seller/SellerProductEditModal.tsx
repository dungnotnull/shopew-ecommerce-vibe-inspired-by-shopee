import React, { useState, useEffect } from 'react';
import { X, Save, Package, Layers, CheckSquare, Square, Percent, RefreshCw } from 'lucide-react';
import { ProductSPU, Category } from '../../types/catalog';
import CatalogService from '../../services/catalog-service';

interface ExtendedEditSKU {
  id: number;
  tierIndex: number[];
  price: number;
  originalPrice: number;
  discountPercentage: number;
  isDiscountActive: boolean;
  stock: number;
}

interface SellerProductEditModalProps {
  product: ProductSPU;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FlattenCategoryOption {
  id: number;
  label: string;
}

const buildCategorySelectOptions = (cats: Category[], depth = 0): FlattenCategoryOption[] => {
  let options: FlattenCategoryOption[] = [];
  cats.forEach((c) => {
    const prefix = depth > 0 ? `${'-- '.repeat(depth)}` : '';
    options.push({ id: c.id, label: `${prefix}${c.name}` });
    if (c.children && c.children.length > 0) {
      options = options.concat(buildCategorySelectOptions(c.children, depth + 1));
    }
  });
  return options;
};

export const SellerProductEditModal: React.FC<SellerProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState<string>(product.name);
  const [description, setDescription] = useState<string>(product.description || '');
  const [priceMin, setPriceMin] = useState<number>(product.priceMin || 0);
  const [categoryId, setCategoryId] = useState<number>(product.categoryId || 1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [skus, setSkus] = useState<ExtendedEditSKU[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Call API GET /api/v1/categories nạp danh sách Danh Mục cho Modal Edit
  const fetchCats = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const catData = await CatalogService.getCategories();
      if (catData && catData.length > 0) {
        setCategories(catData);
      } else {
        setCategories([]);
      }
    } catch {
      setCategoriesError('Không thể tải danh sách ngành hàng.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description || '');
    setPriceMin(product.priceMin || 0);
    setCategoryId(product.categoryId || 1);
    
    // Nạp danh sách SKU kèm trạng thái discount
    if (product.skus && product.skus.length > 0) {
      setSkus(
        product.skus.map(s => {
          const orig = s.originalPrice || Math.round(s.price * 1.25);
          const hasDiscount = orig > s.price;
          const computedDiscount = hasDiscount ? Math.round(((orig - s.price) / orig) * 100) : (product.discountPercentage || 15);

          return {
            id: s.id,
            tierIndex: s.tierIndex,
            price: s.price,
            originalPrice: orig,
            discountPercentage: computedDiscount,
            isDiscountActive: hasDiscount,
            stock: s.stock,
          };
        })
      );
    } else {
      setSkus([]);
    }
    setErrorMsg('');
  }, [product]);

  if (!isOpen) return null;

  // Bật/tắt Checkbox áp dụng discount
  const handleToggleDiscountActive = (skuIdx: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIdx] };
      item.isDiscountActive = !item.isDiscountActive;

      if (!item.isDiscountActive) {
        item.price = item.originalPrice;
      } else {
        item.price = Math.round(item.originalPrice * (1 - item.discountPercentage / 100));
      }
      updated[skuIdx] = item;
      return updated;
    });
  };

  // Đổi % Giảm giá
  const handleSkuDiscountChange = (skuIdx: number, newDiscount: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIdx] };
      item.discountPercentage = newDiscount;
      if (item.isDiscountActive) {
        item.price = Math.round(item.originalPrice * (1 - newDiscount / 100));
      }
      updated[skuIdx] = item;
      return updated;
    });
  };

  // Đổi Giá Gốc Niêm Yết
  const handleSkuOriginalPriceChange = (skuIdx: number, newOriginalPrice: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIdx] };
      item.originalPrice = newOriginalPrice;
      if (item.isDiscountActive) {
        item.price = Math.round(newOriginalPrice * (1 - item.discountPercentage / 100));
      } else {
        item.price = newOriginalPrice;
      }
      updated[skuIdx] = item;
      return updated;
    });
  };

  // Đổi Giá Bán Trực Tiếp
  const handleSkuPriceChange = (skuIdx: number, newPrice: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIdx] };
      item.price = newPrice;
      if (item.originalPrice < newPrice) {
        item.originalPrice = newPrice;
      }
      updated[skuIdx] = item;
      return updated;
    });
  };

  const handleSkuStockChange = (skuIdx: number, newStock: number) => {
    setSkus(prev => {
      const updated = [...prev];
      updated[skuIdx].stock = newStock;
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

      const activeDiscounts = skus.filter(s => s.isDiscountActive).map(s => s.discountPercentage);
      const maxDiscountPercentage = activeDiscounts.length > 0 ? Math.max(...activeDiscounts) : 0;

      await CatalogService.updateSellerProduct(product.id, {
        name,
        description,
        categoryId,
        priceMin: computedPriceMin,
        priceMax: computedPriceMax,
        discountPercentage: maxDiscountPercentage,
        skus: skus.map(s => ({
          id: s.id,
          tierIndex: s.tierIndex,
          price: s.price,
          originalPrice: s.originalPrice,
          stock: s.stock,
        })),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại sau.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-['Roboto',sans-serif]">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ee4d2d]" /> Cập Nhật Thông Tin Sản Phẩm #{product.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thông tin cơ bản */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tên Sản Phẩm *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mô Tả Chi Tiết Sản Phẩm</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Giá Mặc Định Gợi Ý (VND) *</label>
                <input
                  type="number"
                  required
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Danh Mục Ngành Hàng *</label>
                  {categoriesError && (
                    <button
                      type="button"
                      onClick={fetchCats}
                      className="text-[11px] text-[#ee4d2d] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Thử lại
                    </button>
                  )}
                </div>
                {categoriesLoading ? (
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 animate-pulse">
                    Đang tải danh mục...
                  </div>
                ) : categoriesError ? (
                  <div className="w-full p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                    {categoriesError}
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#ee4d2d]"
                  >
                    {buildCategorySelectOptions(categories).length === 0 ? (
                      <option value={product.categoryId || 1}>Chưa có ngành hàng</option>
                    ) : (
                      buildCategorySelectOptions(categories).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Bảng phân loại hàng kèm Checkbox Giảm Giá */}
          {skus.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#ee4d2d]" /> Bảng Giá & Cấu Hình Khuyến Mãi Phân Loại Hàng ({skus.length} Phân Loại)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                      <th className="p-2.5">Mẫu Phân Loại</th>
                      <th className="p-2.5">Giá Gốc Niêm Yết</th>
                      <th className="p-2.5 text-center">Áp Dụng Giảm Giá?</th>
                      <th className="p-2.5">% Giảm</th>
                      <th className="p-2.5">Giá Bán Thực Tế</th>
                      <th className="p-2.5">Tồn Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skus.map((sku, sIdx) => {
                      const label1 = product.variantGroups?.[0]?.options[sku.tierIndex[0]] || '';
                      const label2 = product.variantGroups?.[1]?.options[sku.tierIndex[1]] || '';
                      const variantLabel = [label1, label2].filter(Boolean).join(' - ') || `Mẫu #${sku.id}`;

                      return (
                        <tr key={sIdx} className={`hover:bg-gray-50/80 transition-colors ${!sku.isDiscountActive ? 'bg-gray-50/50' : ''}`}>
                          <td className="p-2.5 font-bold text-gray-800">{variantLabel}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={sku.originalPrice}
                              onChange={(e) => handleSkuOriginalPriceChange(sIdx, Number(e.target.value))}
                              className="w-24 p-1.5 border border-gray-300 rounded text-xs font-medium text-gray-600 focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDiscountActive(sIdx)}
                              className="inline-flex items-center gap-1 cursor-pointer"
                            >
                              {sku.isDiscountActive ? (
                                <CheckSquare className="w-4 h-4 text-[#ee4d2d]" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="p-2.5">
                            <div className="relative w-16">
                              <input
                                type="number"
                                disabled={!sku.isDiscountActive}
                                min={0}
                                max={99}
                                value={sku.discountPercentage}
                                onChange={(e) => handleSkuDiscountChange(sIdx, Number(e.target.value))}
                                className="w-full p-1 pr-4 border border-gray-300 rounded text-xs font-bold text-[#ee4d2d] focus:outline-none focus:border-[#ee4d2d] disabled:bg-gray-100 disabled:text-gray-400"
                              />
                              <Percent className="w-2.5 h-2.5 absolute right-1 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={sku.price}
                              onChange={(e) => handleSkuPriceChange(sIdx, Number(e.target.value))}
                              className={`w-24 p-1.5 border rounded text-xs font-bold focus:outline-none ${
                                sku.isDiscountActive ? 'border-red-300 bg-orange-50/50 text-[#ee4d2d]' : 'border-gray-300 text-gray-900'
                              }`}
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={sku.stock}
                              onChange={(e) => handleSkuStockChange(sIdx, Number(e.target.value))}
                              className="w-20 p-1.5 border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#ee4d2d] hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
