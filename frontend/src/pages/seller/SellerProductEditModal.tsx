import React, { useState, useEffect } from 'react';
import { X, Save, Package, Layers } from 'lucide-react';
import { ProductSPU, SKU, Category } from '../../types/catalog';
import CatalogService from '../../services/catalog-service';

interface SellerProductEditModalProps {
  product: ProductSPU;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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
  const [skus, setSkus] = useState<SKU[]>(product.skus || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Call API GET /api/v1/categories nạp danh sách Danh Mục cho Modal Edit
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catData = await CatalogService.getCategories();
        if (catData && catData.length > 0) {
          const flattenList: Category[] = [];
          const extractAll = (items: Category[]) => {
            items.forEach(c => {
              flattenList.push(c);
              if (c.children && c.children.length > 0) {
                extractAll(c.children);
              }
            });
          };
          extractAll(catData);
          setCategories(flattenList);
        }
      } catch {
        // Fallback default
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description || '');
    setPriceMin(product.priceMin || 0);
    setCategoryId(product.categoryId || 1);
    setSkus(product.skus || []);
    setErrorMsg('');
  }, [product]);

  if (!isOpen) return null;

  const handleSkuPriceChange = (skuIdx: number, newPrice: number) => {
    setSkus(prev => {
      const updated = [...prev];
      updated[skuIdx].price = newPrice;
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

      await CatalogService.updateSellerProduct(product.id, {
        name,
        description,
        categoryId,
        priceMin: computedPriceMin,
        priceMax: computedPriceMax,
        skus,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ee4d2d]" /> Cập Nhật Sản Phẩm SPU #{product.id}
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
          {/* Thông tin SPU Gốc */}
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Mô Tả Chi Tiết</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Giá Chuẩn Mặc Định (VND) *</label>
                <input
                  type="number"
                  required
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Danh Mục Sản Phẩm (Call API) *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:border-[#ee4d2d]"
                >
                  {categories.length === 0 ? (
                    <option value={product.categoryId || 1}>Danh mục #{product.categoryId || 1}</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (ID #{cat.id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Ma trận Biến Thể SKU */}
          {skus.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#ee4d2d]" /> Danh Sách Biến Thể SKUs ({skus.length} SKUs)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                      <th className="p-2.5">Biến Thể SKU</th>
                      <th className="p-2.5">Giá Bán (VND)</th>
                      <th className="p-2.5">Tồn Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skus.map((sku, sIdx) => {
                      const label1 = product.variantGroups?.[0]?.options[sku.tierIndex[0]] || '';
                      const label2 = product.variantGroups?.[1]?.options[sku.tierIndex[1]] || '';
                      const variantLabel = [label1, label2].filter(Boolean).join(' - ') || `SKU #${sku.id}`;

                      return (
                        <tr key={sIdx} className="hover:bg-gray-50">
                          <td className="p-2.5 font-bold text-gray-800">{variantLabel}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={sku.price}
                              onChange={(e) => handleSkuPriceChange(sIdx, Number(e.target.value))}
                              className="w-28 p-1.5 border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:border-[#ee4d2d]"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={sku.stock}
                              onChange={(e) => handleSkuStockChange(sIdx, Number(e.target.value))}
                              className="w-24 p-1.5 border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:border-[#ee4d2d]"
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
