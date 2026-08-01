import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, Filter, Layers, Tag } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { ProductSPU, Category } from '../../types/catalog';
import { formatVND } from '../../utils/format-currency';
import { SellerProductEditModal } from './SellerProductEditModal';

export const SellerProductListPage: React.FC = () => {
  const [products, setProducts] = useState<ProductSPU[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProductForSkus, setSelectedProductForSkus] = useState<ProductSPU | null>(null);

  // State cho Modal Sửa Sản Phẩm
  const [editingProduct, setEditingProduct] = useState<ProductSPU | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // State cho Modal Popup Xác Nhận Xóa Sản Phẩm
  const [deletingProduct, setDeletingProduct] = useState<ProductSPU | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        CatalogService.getSellerProducts(),
        CatalogService.getCategories(),
      ]);
      setProducts(prodData);

      const parentCats = catData.filter(c => c.parentId === null || !c.parentId);
      setCategories(parentCats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      await CatalogService.deleteSellerProduct(deletingProduct.id);
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch {
      alert('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditModal = (p: ProductSPU) => {
    setEditingProduct(p);
    setIsEditModalOpen(true);
  };

  // Lọc sản phẩm theo tìm kiếm & danh mục
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || String(p.categoryId) === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 font-['Roboto',sans-serif]">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg shadow-xs border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#ee4d2d]" /> Quản Lý Danh Sách Sản Phẩm
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng <span className="font-bold text-[#ee4d2d]">{products.length}</span> sản phẩm đang hiển thị bán trên Shopew
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/seller/products/new"
            className="bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Đăng Sản Phẩm Mới
          </Link>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#ee4d2d]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#ee4d2d]"
          >
            <option value="ALL">Tất Cả Danh Mục Ngành Hàng</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Products Table */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Đang tải danh sách sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">Chưa tìm thấy sản phẩm nào</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Bạn chưa có sản phẩm nào trong danh mục này. Hãy bấm Đăng Sản Phẩm Mới để đăng bán.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-bold">
                  <th className="p-3.5 whitespace-nowrap text-center">Mã SP</th>
                  <th className="p-3.5 whitespace-nowrap text-left">Thông Tin Sản Phẩm</th>
                  <th className="p-3.5 whitespace-nowrap text-center">Giá Bán Khuyến Mãi (VND)</th>
                  <th className="p-3.5 whitespace-nowrap text-center">Phân Loại Hàng</th>
                  <th className="p-3.5 whitespace-nowrap text-center">Đã Bán</th>
                  <th className="p-3.5 whitespace-nowrap text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const skuCount = p.skus?.length || 0;
                  const totalStock = p.skus?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
                  const catObj = categories.find(c => c.id === p.categoryId);
                  const hasDiscount = !!p.discountPercentage && p.discountPercentage > 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 text-center font-bold text-gray-500">#{p.id}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200'}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-gray-900 line-clamp-1 max-w-xs">{p.name}</h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {catObj && (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {catObj.name}
                                </span>
                              )}
                              {hasDiscount && (
                                <span className="bg-yellow-400 text-red-700 text-[10px] font-black px-1.5 py-0.2 rounded shadow-xs flex items-center gap-0.5">
                                  <Tag className="w-2.5 h-2.5" /> -{p.discountPercentage}%
                                </span>
                              )}
                              {p.isMall && (
                                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Shopee Mall
                                </span>
                              )}
                              {p.isPreferred && (
                                <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Yêu Thích
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#ee4d2d] text-sm whitespace-nowrap">
                            {p.priceMin === p.priceMax
                              ? formatVND(p.priceMin)
                              : `${formatVND(p.priceMin)} - ${formatVND(p.priceMax)}`}
                          </div>
                          {hasDiscount && (
                            <div className="text-[11px] text-gray-400 line-through whitespace-nowrap">
                              {formatVND(Math.round(p.priceMin * (1 + (p.discountPercentage || 0) / 100)))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="space-y-1 inline-block text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                            <Layers className="w-3 h-3 text-[#ee4d2d]" /> {skuCount} Phân loại ({totalStock} tồn)
                          </span>
                          {skuCount > 0 && (
                            <button
                              onClick={() => setSelectedProductForSkus(p)}
                              className="block text-[11px] text-[#ee4d2d] hover:underline cursor-pointer font-medium whitespace-nowrap mx-auto"
                            >
                              Xem chi tiết phân loại
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-semibold text-gray-700 whitespace-nowrap">{p.soldCount || 0}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Sửa sản phẩm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Popup Xác Nhận Xóa Sản Phẩm */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Xác Nhận Xóa Sản Phẩm</h3>
                <p className="text-xs text-gray-500">Hành động này sẽ gỡ sản phẩm khỏi gian hàng.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs text-gray-700 space-y-1">
              <p>Bạn có chắc chắn muốn xóa sản phẩm:</p>
              <p className="font-bold text-gray-900 text-sm">{deletingProduct.name}</p>
              <p className="text-[11px] text-gray-400">Mã SP ID: #{deletingProduct.id}</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Phân Loại Hàng */}
      {selectedProductForSkus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ee4d2d]" /> Chi Tiết Phân Loại Hàng
              </h3>
              <button
                onClick={() => setSelectedProductForSkus(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-bold text-gray-800">{selectedProductForSkus.name}</p>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-2 whitespace-nowrap">Mẫu Phân Loại</th>
                    <th className="p-2 whitespace-nowrap text-center">Giá Khuyến Mãi</th>
                    <th className="p-2 whitespace-nowrap text-center">Giá Gốc</th>
                    <th className="p-2 whitespace-nowrap text-center">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedProductForSkus.skus?.map((sku, idx) => {
                    const getOptVal = (vg: any, tierIdx: any) => {
                      if (!vg || !vg.options || tierIdx === undefined || tierIdx === null) return '';
                      const opt = vg.options[Number(tierIdx)];
                      if (typeof opt === 'object' && opt !== null) {
                        return opt.value !== undefined ? String(opt.value) : String(opt);
                      }
                      return String(opt || '');
                    };

                    const tierArr = typeof sku.tierIndex === 'string' ? JSON.parse(sku.tierIndex) : (sku.tierIndex || []);
                    const label1 = getOptVal(selectedProductForSkus.variantGroups?.[0], tierArr[0]);
                    const label2 = getOptVal(selectedProductForSkus.variantGroups?.[1], tierArr[1]);
                    const label = [label1, label2].filter(Boolean).join(' - ') || 'Mẫu Mặc Định';

                    return (
                      <tr key={idx}>
                        <td className="p-2 whitespace-nowrap font-semibold text-gray-800">{label}</td>
                        <td className="p-2 text-center font-bold text-[#ee4d2d] whitespace-nowrap">{formatVND(sku.price)}</td>
                        <td className="p-2 text-center text-gray-400 line-through whitespace-nowrap">
                          {formatVND(sku.originalPrice || Math.round(sku.price * 1.25))}
                        </td>
                        <td className="p-2 text-center whitespace-nowrap">{sku.stock} sản phẩm</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProductForSkus(null)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded hover:bg-gray-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Sản Phẩm */}
      {editingProduct && (
        <SellerProductEditModal
          product={editingProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={fetchSellerProducts}
        />
      )}
    </div>
  );
};
