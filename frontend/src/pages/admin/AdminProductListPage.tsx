import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ShoppingBag, Search, ExternalLink, Store, Star } from 'lucide-react';
import { adminService } from '../../services/admin-service';
import { ShopeePagination } from '../../components/common/ShopeePagination';
import { formatVND } from '../../utils/format-currency';
import { Link } from 'react-router-dom';

export const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getProducts(pageNum, 20);
      setProducts(res.data || []);
      setTotalPages(res.totalPages || 1);
      setPage(pageNum);
    } catch {
      console.error('Lỗi khi tải danh sách sản phẩm Admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.shop?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-red-600" /> Duyệt & Kiểm Soát Sản Phẩm SPU/SKU
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý toàn bộ danh sách sản phẩm đăng bán trên toàn hệ thống sàn Shopew.
            </p>
          </div>
        </div>

        {/* Thanh Tìm Kiếm */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên sản phẩm hoặc Tên Shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Bảng Danh Sách Sản Phẩm */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">Đang tải danh sách sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {searchQuery ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào trên hệ thống.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3">Sản Phẩm (SPU)</th>
                    <th className="p-3">Gian Hàng (Shop)</th>
                    <th className="p-3 text-center">Khoảng Giá (VND)</th>
                    <th className="p-3 text-center">Đã Bán</th>
                    <th className="p-3 text-center">Đánh Giá</th>
                    <th className="p-3 text-center">Xem Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">#{p.id}</td>
                      <td className="p-3 font-bold text-slate-800 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://via.placeholder.com/50'}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                          />
                          <span className="line-clamp-2">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Store className="w-3.5 h-3.5 text-[#ee4d2d]" />
                          <span>{p.shop?.name || 'Shop hệ thống'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-extrabold text-[#ee4d2d]">
                        {formatVND(p.priceMin)} {p.priceMax > p.priceMin ? `- ${formatVND(p.priceMax)}` : ''}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{p.soldCount || 0}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{p.rating || '5.0'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          to={`/product/${p.id}`}
                          target="_blank"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer font-bold"
                          title="Xem trang sản phẩm"
                        >
                          <ExternalLink className="w-4 h-4" /> Xem
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Phân trang */}
        <ShopeePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => fetchProducts(newPage)}
        />
      </div>
    </AdminLayout>
  );
};
