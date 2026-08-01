import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, Save, ArrowLeft, CheckCircle2, Layers, Store, Percent, CheckSquare, Square, RefreshCw } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { sellerService } from '../../services/seller-service';
import { VariantGroup, Category } from '../../types/catalog';

// Interface Mới Cho Dòng SKU Trong Form Quản Lý (Có Hỗ Trợ Checkbox Ap Dụng Discount)
interface ExtendedFormSKU {
  id: number;
  tierIndex: number[];
  price: number;
  originalPrice: number;
  discountPercentage: number;
  isDiscountActive: boolean; // Checkbox chọn áp dụng giảm giá hay không
  stock: number;
}

// Helper dựng danh sách danh mục phẳng có ký tự phân cấp cho dropdown select
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

export const SellerProductManagement: React.FC = () => {
  const navigate = useNavigate();

  // State Form Sản Phẩm Cơ Bản (Mục 1)
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceMin, setPriceMin] = useState<number>(100000);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // State Modal Khởi Tạo Shop
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [shopName, setShopName] = useState<string>('Gian Hàng Shopew Official');
  const [shopDescription, setShopDescription] = useState<string>('Cửa hàng phân phối sản phẩm chính hãng trên Shopew.');
  const [creatingShop, setCreatingShop] = useState<boolean>(false);

  // Call API nạp danh sách Danh mục sản phẩm từ Backend: GET /api/v1/categories
  const fetchCategoriesFromAPI = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const catData = await CatalogService.getCategories();
      if (catData && catData.length > 0) {
        setCategories(catData);
        const options = buildCategorySelectOptions(catData);
        if (options.length > 0) {
          setCategoryId(options[0].id);
        }
      } else {
        setCategories([]);
      }
    } catch {
      setCategoriesError('Không thể tải danh sách ngành hàng từ API.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesFromAPI();
  }, []);

  // State Nhóm Phân Loại Hàng (Màu sắc, Kích cỡ...)
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    { name: 'Màu sắc', options: ['Đen', 'Trắng'] },
    { name: 'Kích cỡ', options: ['M', 'L'] },
  ]);

  // State Bảng Phân Loại SKUs (Mục 3: Có checkbox áp dụng discount)
  const [skus, setSkus] = useState<ExtendedFormSKU[]>([]);

  // Tự động khởi tạo Bảng Phân Loại Hàng khi thay đổi Nhóm Phân Loại hoặc Giá Mặc Định
  useEffect(() => {
    const defaultDiscount = 15;
    const calcOriginal = Math.round(priceMin * 1.2);

    if (!variantGroups || variantGroups.length === 0) {
      setSkus([
        {
          id: 1,
          tierIndex: [],
          price: priceMin,
          originalPrice: calcOriginal,
          discountPercentage: defaultDiscount,
          isDiscountActive: true,
          stock: 100,
        },
      ]);
      return;
    }

    if (variantGroups.length === 1) {
      const generatedSkus: ExtendedFormSKU[] = variantGroups[0].options.map((_opt, idx) => ({
        id: idx + 1,
        tierIndex: [idx],
        price: priceMin,
        originalPrice: calcOriginal,
        discountPercentage: defaultDiscount,
        isDiscountActive: true,
        stock: 50,
      }));
      setSkus(generatedSkus);
      return;
    }

    if (variantGroups.length === 2) {
      const group1 = variantGroups[0];
      const group2 = variantGroups[1];
      const generatedSkus: ExtendedFormSKU[] = [];
      let skuId = 1;

      group1.options.forEach((_, idx1) => {
        group2.options.forEach((_, idx2) => {
          generatedSkus.push({
            id: skuId++,
            tierIndex: [idx1, idx2],
            price: priceMin,
            originalPrice: calcOriginal,
            discountPercentage: defaultDiscount,
            isDiscountActive: true,
            stock: 50,
          });
        });
      });

      setSkus(generatedSkus);
    }
  }, [variantGroups, priceMin]);

  const handleAddVariantGroup = () => {
    if (variantGroups.length >= 2) return;
    setVariantGroups(prev => [...prev, { name: 'Kích cỡ', options: ['S', 'M', 'L'] }]);
  };

  const handleRemoveVariantGroup = (idx: number) => {
    setVariantGroups(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddOption = (groupIdx: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIdx].options.push(`Tùy chọn ${newGroups[groupIdx].options.length + 1}`);
    setVariantGroups(newGroups);
  };

  const handleOptionChange = (groupIdx: number, optIdx: number, value: string) => {
    const newGroups = [...variantGroups];
    newGroups[groupIdx].options[optIdx] = value;
    setVariantGroups(newGroups);
  };

  const handleRemoveOption = (groupIdx: number, optIdx: number) => {
    const newGroups = [...variantGroups];
    if (newGroups[groupIdx].options.length <= 1) return;
    newGroups[groupIdx].options = newGroups[groupIdx].options.filter((_, i) => i !== optIdx);
    setVariantGroups(newGroups);
  };

  // --- THAO TÁC TRÊN BẢNG MỤC 3 (GIÁ BÁN, CHECKBOX KHUYẾN MÃI, PHẦN TRĂM GIẢM) ---

  // Xử lý bật/tắt Checkbox Áp Dụng Giảm Giá cho từng phân loại
  const handleToggleDiscountActive = (skuIndex: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIndex] };
      item.isDiscountActive = !item.isDiscountActive;

      if (!item.isDiscountActive) {
        // Tắt discount: Giá bán = Giá gốc
        item.price = item.originalPrice;
      } else {
        // Bật discount: Áp dụng lại % giảm giá
        item.price = Math.round(item.originalPrice * (1 - item.discountPercentage / 100));
      }
      updated[skuIndex] = item;
      return updated;
    });
  };

  // Thay đổi % Giảm giá cho từng dòng SKU ở Mục 3
  const handleSkuDiscountChange = (skuIndex: number, newDiscount: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIndex] };
      item.discountPercentage = newDiscount;
      if (item.isDiscountActive) {
        item.price = Math.round(item.originalPrice * (1 - newDiscount / 100));
      }
      updated[skuIndex] = item;
      return updated;
    });
  };

  // Thay đổi Giá Gốc ở Mục 3
  const handleSkuOriginalPriceChange = (skuIndex: number, newOriginalPrice: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIndex] };
      item.originalPrice = newOriginalPrice;
      if (item.isDiscountActive) {
        item.price = Math.round(newOriginalPrice * (1 - item.discountPercentage / 100));
      } else {
        item.price = newOriginalPrice;
      }
      updated[skuIndex] = item;
      return updated;
    });
  };

  // Thay đổi Giá Bán Trực Tiếp ở Mục 3
  const handleSkuPriceChange = (skuIndex: number, newPrice: number) => {
    setSkus(prev => {
      const updated = [...prev];
      const item = { ...updated[skuIndex] };
      item.price = newPrice;
      if (item.originalPrice < newPrice) {
        item.originalPrice = newPrice;
      }
      updated[skuIndex] = item;
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

  // Hàm xử lý gửi API tạo sản phẩm
  const executeCreateProduct = async () => {
    const prices = skus.map(s => s.price);
    const computedPriceMin = prices.length > 0 ? Math.min(...prices) : priceMin;
    const computedPriceMax = prices.length > 0 ? Math.max(...prices) : priceMin;

    // Tìm phần trăm giảm giá lớn nhất trong các SKU được tick chọn làm discountPercentage đại diện
    const activeDiscounts = skus.filter(s => s.isDiscountActive).map(s => s.discountPercentage);
    const maxDiscountPercentage = activeDiscounts.length > 0 ? Math.max(...activeDiscounts) : 0;

    await CatalogService.createSellerProduct({
      name,
      description,
      categoryId,
      priceMin: computedPriceMin,
      priceMax: computedPriceMax,
      discountPercentage: maxDiscountPercentage,
      isMall: false,
      isPreferred: true,
      variantGroups,
      skus: skus.map(s => ({
        id: s.id,
        tierIndex: s.tierIndex,
        price: s.price,
        originalPrice: s.originalPrice,
        stock: s.stock,
      })),
    });

    setIsSuccess(true);
    setTimeout(() => {
      navigate('/seller/products');
    }, 1500);
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
      await executeCreateProduct();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo sản phẩm. Vui lòng kiểm tra lại dữ liệu.';

      if (typeof msg === 'string' && (msg.includes('chưa tạo gian hàng') || msg.includes('Shop'))) {
        setShowShopModal(true);
        setErrorMsg('Tài khoản của bạn chưa có Gian hàng trên Shopew. Vui lòng xác nhận tạo gian hàng bên dưới.');
      } else if (Array.isArray(msg)) {
        setErrorMsg(msg.join(', '));
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Khởi Tạo Gian Hàng qua API POST /api/v1/shops từ Frontend
  const handleCreateShopAndRetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingShop(true);
    setErrorMsg('');

    try {
      await sellerService.createShop({
        name: shopName,
        description: shopDescription,
      });

      setShowShopModal(false);
      await executeCreateProduct();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo gian hàng. Vui lòng thử lại sau.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setCreatingShop(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-['Roboto',sans-serif]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/seller/products')}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#ee4d2d] font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Trở về Quản Lý Sản Phẩm
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ee4d2d]" /> Thêm Sản Phẩm Mới
          </h1>
        </div>

        {/* Thông báo Thành công hoặc Lỗi */}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-sm">Đã đăng sản phẩm thành công! Đang chuyển hướng về danh sách...</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        {/* Modal Tự Động Khởi Tạo Gian Hàng Nếu Backend Yêu Cầu */}
        {showShopModal && (
          <div className="bg-orange-50 border-2 border-[#ee4d2d] p-5 rounded-lg space-y-3 shadow-md">
            <h3 className="text-sm font-bold text-[#ee4d2d] flex items-center gap-2">
              <Store className="w-5 h-5" /> Kích Hoạt Gian Hàng Người Bán (Shopew Seller Shop)
            </h3>
            <p className="text-xs text-gray-600">
              Tài khoản của bạn chưa có Gian hàng để bán hàng. Vui lòng nhập tên Shop để kích hoạt:
            </p>
            <form onSubmit={handleCreateShopAndRetry} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Gian Hàng *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô Tả Gian Hàng</label>
                <input
                  type="text"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingShop}
                  className="px-4 py-1.5 bg-[#ee4d2d] hover:bg-orange-600 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                >
                  {creatingShop ? 'Đang kích hoạt...' : 'Kích Hoạt Gian Hàng & Đăng Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin sản phẩm cơ bản */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase pb-2 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#ee4d2d]" /> 1. Thông Tin Cơ Bản
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo Phông Nam Oversize Cotton 100% Co Giãn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô Tả Chi Tiết Sản Phẩm</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả đặc điểm sản phẩm, kiểu dáng, hướng dẫn chọn size, chính sách bảo hành..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giá Mặc Định Gợi Ý (VND) *</label>
                  <input
                    type="number"
                    required
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-gray-900 focus:outline-none focus:border-[#ee4d2d]"
                  />
                </div>

                {/* Ô Chọn Danh Mục Sản Phẩm */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Danh Mục Ngành Hàng *
                    </label>
                    {categoriesError && (
                      <button
                        type="button"
                        onClick={fetchCategoriesFromAPI}
                        className="text-[11px] text-[#ee4d2d] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <RefreshCw className="w-3 h-3" /> Thử lại
                      </button>
                    )}
                  </div>
                  {categoriesLoading ? (
                    <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 animate-pulse">
                      Đang tải danh mục từ hệ thống...
                    </div>
                  ) : categoriesError ? (
                    <div className="w-full p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                      {categoriesError}
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#ee4d2d]"
                    >
                      {buildCategorySelectOptions(categories).length === 0 ? (
                        <option value={1}>Chưa có ngành hàng</option>
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
          </div>

          {/* Section 2: Phân loại sản phẩm (Màu sắc, Kích cỡ...) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ee4d2d]" /> 2. Phân Loại Hàng (Màu Sắc, Kích Thước...)
              </h2>
              {variantGroups.length < 2 && (
                <button
                  type="button"
                  onClick={handleAddVariantGroup}
                  className="text-xs text-[#ee4d2d] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Phân Loại 2 (VD: Kích cỡ)
                </button>
              )}
            </div>

            {variantGroups.map((group, gIdx) => (
              <div key={gIdx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Nhóm Phân Loại {gIdx + 1} (Ví dụ: Màu sắc, Dung lượng, Kích cỡ)</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariantGroup(gIdx)}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa nhóm này
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={`Tên Nhóm Phân Loại ${gIdx + 1} (VD: Màu sắc)`}
                  value={group.name}
                  onChange={(e) => {
                    const newG = [...variantGroups];
                    newG[gIdx].name = e.target.value;
                    setVariantGroups(newG);
                  }}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:border-[#ee4d2d]"
                />

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500">Các Tùy Chọn Trong Nhóm:</span>
                  <div className="flex flex-wrap gap-2 items-center">
                    {group.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 shadow-xs focus-within:border-[#ee4d2d]">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(gIdx, oIdx, e.target.value)}
                          placeholder="Tùy chọn..."
                          className="w-28 text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(gIdx, oIdx)}
                          className="text-gray-400 hover:text-red-500 font-bold px-1 text-sm cursor-pointer"
                          title="Xóa tùy chọn này"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(gIdx)}
                      className="text-xs text-[#ee4d2d] font-semibold bg-white border border-dashed border-[#ee4d2d] px-3 py-1.5 rounded hover:bg-orange-50 cursor-pointer"
                    >
                      + Thêm tùy chọn
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Bảng giá, Checkbox áp dụng giảm giá & Tồn kho theo từng phân loại */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase pb-2 border-b border-gray-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ee4d2d]" /> 3. Bảng Giá, Cấu Hình Khuyến Mãi & Tồn Kho ({skus.length} Phân Loại)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                    <th className="p-3">Mẫu Phân Loại</th>
                    <th className="p-3">Giá Gốc Niêm Yết (VND)</th>
                    <th className="p-3 text-center">Áp Dụng Giảm Giá</th>
                    <th className="p-3">% Giảm Giá</th>
                    <th className="p-3">Giá Bán Thực Tế (VND)</th>
                    <th className="p-3">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skus.map((sku, idx) => {
                    const label1 = variantGroups[0]?.options[sku.tierIndex[0]] || '';
                    const label2 = variantGroups[1]?.options[sku.tierIndex[1]] || '';
                    const variantLabel = [label1, label2].filter(Boolean).join(' - ') || 'Mặc định';

                    return (
                      <tr key={idx} className={`hover:bg-gray-50/80 transition-colors ${!sku.isDiscountActive ? 'bg-gray-50/50' : ''}`}>
                        <td className="p-3 font-bold text-gray-800">
                          {variantLabel}
                        </td>
                        {/* 1. Giá Gốc Niêm Yết */}
                        <td className="p-3">
                          <input
                            type="number"
                            value={sku.originalPrice}
                            onChange={(e) => handleSkuOriginalPriceChange(idx, Number(e.target.value))}
                            className="w-28 p-1.5 border border-gray-300 rounded font-medium text-gray-600 focus:outline-none focus:border-[#ee4d2d]"
                          />
                        </td>
                        {/* 2. CHECKBOX STICK CHỌN ÁP DỤNG DISCOUNT */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDiscountActive(idx)}
                            className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer select-none"
                          >
                            {sku.isDiscountActive ? (
                              <CheckSquare className="w-5 h-5 text-[#ee4d2d]" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                        </td>
                        {/* 3. % Giảm Giá */}
                        <td className="p-3">
                          <div className="relative w-20">
                            <input
                              type="number"
                              disabled={!sku.isDiscountActive}
                              min={0}
                              max={99}
                              value={sku.discountPercentage}
                              onChange={(e) => handleSkuDiscountChange(idx, Number(e.target.value))}
                              className="w-full p-1.5 pr-5 border border-gray-300 rounded text-xs font-bold text-[#ee4d2d] focus:outline-none focus:border-[#ee4d2d] disabled:bg-gray-100 disabled:text-gray-400"
                            />
                            <Percent className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </td>
                        {/* 4. Giá Bán Thực Tế (Tự động tính từ Giá gốc * (1 - % Giảm)) */}
                        <td className="p-3">
                          <input
                            type="number"
                            value={sku.price}
                            onChange={(e) => handleSkuPriceChange(idx, Number(e.target.value))}
                            className={`w-28 p-1.5 border rounded font-bold text-xs focus:outline-none ${sku.isDiscountActive ? 'border-red-300 bg-orange-50/50 text-[#ee4d2d]' : 'border-gray-300 text-gray-900'
                              }`}
                          />
                        </td>
                        {/* 5. Tồn Kho */}
                        <td className="p-3">
                          <input
                            type="number"
                            value={sku.stock}
                            onChange={(e) => handleSkuStockChange(idx, Number(e.target.value))}
                            className="w-20 p-1.5 border border-gray-300 rounded font-semibold text-gray-900 focus:outline-none focus:border-[#ee4d2d]"
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
              className="bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
