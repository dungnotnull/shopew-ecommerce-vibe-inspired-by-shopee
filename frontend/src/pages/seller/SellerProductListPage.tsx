import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { Package, Plus, Search, Trash2, Eye, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import CatalogService from '../../services/catalog-service';
import { ProductSPU } from '../../types/catalog';
import { formatVND } from '../../utils/format-currency';

// Trang Quản Lý Danh Sách Sản Phẩm SPU & SKUs Kênh Người Bán
export const SellerProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSPU[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load danh sách sản phẩm từ API Backend NestJS
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await CatalogService.getSellerProducts();
      setProducts(data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý Xóa Sản phẩm SPU qua REST API DELETE /api/seller/products/:id
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm SPU "${name}" này không?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await CatalogService.deleteSellerProduct(id);
      setDeleteSuccessMsg(`Đã xóa sản phẩm SPU #${id} thành công.`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTimeout(() => setDeleteSuccessMsg(''), 3000);
    } catch {
      setDeleteSuccessMsg(`Không thể xóa sản phẩm #${id}. Vui lòng thử lại sau.`);
      setTimeout(() => setDeleteSuccessMsg(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // Lọc sản phẩm theo Từ khóa tìm kiếm
  const filteredProducts = products.filter(product => {
    const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         String(product.id).includes(searchQuery);
    if (filterStatus === 'OUT_OF_STOCK') {
      const totalStock = product.skus ? product.skus.reduce((acc, s) => acc + s.stock, 0) : 0;
      return matchesQuery && totalStock === 0;
    }
    return matchesQuery;
  });

  return (
    <SellerLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Header Quản Lý Sản Phẩm */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#ee4d2d]" /> Quản Lý Danh Sách Sản Phẩm (SPU & SKUs)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Quản lý toàn bộ danh mục sản phẩm, biến thể kho hàng và doanh số bán trên Shopew Enterprise.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại
            </button>

            <button
              onClick={() => navigate('/seller/products/new')}
              className="inline-flex items-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold px-4 py-2 rounded shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Đăng Sản Phẩm Mới (SPU/SKU)
            </button>
          </div>
        </div>

        {/* Banner Thông báo Xóa Thành Công */}
        {deleteSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{deleteSuccessMsg}</span>
          </div>
        )}

        {/* Khung Bộ Lọc & Tìm Kiếm */}
        <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Ô Nhập Tìm Kiếm */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo Tên sản phẩm SPU hoặc ID sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#ee4d2d]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-[#ee4d2d] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất Cả ({products.length})
            </button>
            <button
              onClick={() => setFilterStatus('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                filterStatus === 'OUT_OF_STOCK'
                  ? 'bg-[#ee4d2d] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hết Hàng
            </button>
          </div>
        </div>

        {/* Bảng Danh Sách Sản Phẩm SPU & SKUs */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#ee4d2d]" />
              <span>Đang tải danh sách sản phẩm SPU & SKUs...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 space-y-3">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">Chưa có sản phẩm nào trong cửa hàng.</p>
              <button
                onClick={() => navigate('/seller/products/new')}
                className="inline-flex items-center gap-1 bg-[#ee4d2d] text-white font-bold px-4 py-2 rounded text-xs"
              >
                <Plus className="w-4 h-4" /> Tạo sản phẩm đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Sản Phẩm SPU</th>
                    <th className="p-3.5">Giá Tiêu Chuẩn (VND)</th>
                    <th className="p-3.5">Tồn Kho (SKUs)</th>
                    <th className="p-3.5">Doanh Số (Đã Bán)</th>
                    <th className="p-3.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const totalStock = product.skus ? product.skus.reduce((acc, s) => acc + s.stock, 0) : 0;
                    const variantCount = product.skus ? product.skus.length : 0;
                    const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';

                    return (
                      <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Cột 1: Thông tin Sản Phẩm SPU */}
                        <td className="p-3.5">
                          <div className="flex items-start gap-3">
                            <img
                              src={thumbnail}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0 bg-gray-50"
                            />
                            <div className="space-y-1">
                              <span className="font-bold text-gray-900 line-clamp-2 leading-tight">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <span>ID: <strong className="text-gray-700">#{product.id}</strong></span>
                                <span>•</span>
                                <span className="bg-orange-50 text-[#ee4d2d] px-1.5 py-0.5 rounded font-semibold">
                                  {variantCount} SKU Phân Loại
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Giá Bán tiêu chuẩn */}
                        <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                          {product.priceMax && product.priceMax > product.priceMin ? (
                            <span className="text-[#ee4d2d]">
                              {formatVND(product.priceMin)} - {formatVND(product.priceMax)}
                            </span>
                          ) : (
                            <span className="text-[#ee4d2d]">
                              {formatVND(product.priceMin)}
                            </span>
                          )}
                        </td>

                        {/* Cột 3: Tồn kho SKUs */}
                        <td className="p-3.5 whitespace-nowrap">
                          {totalStock > 0 ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                              {totalStock} sản phẩm
                            </span>
                          ) : (
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                              Hết hàng
                            </span>
                          )}
                        </td>

                        {/* Cột 4: Doanh Số (Lượt Bán & Yêu Thích) */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="font-bold text-gray-800">{product.soldCount || 0} đã bán</div>
                            <div className="text-[11px] text-gray-500">♥ {product.likeCount || 0} thích</div>
                          </div>
                        </td>

                        {/* Cột 5: Thao tác (Action Buttons) */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* Nút Xem Chi Tiết trên Sàn */}
                            <Link
                              to={`/products/${product.id}`}
                              target="_blank"
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Xem sản phẩm trên Shopew"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Nút Chỉnh Sửa */}
                            <button
                              onClick={() => navigate('/seller/products/new')}
                              className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                              title="Chỉnh sửa sản phẩm SPU & SKUs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Nút Xóa Sản Phẩm */}
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deletingId === product.id}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
                              title="Xóa sản phẩm SPU này"
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
      </div>
    </SellerLayout>
  );
};
