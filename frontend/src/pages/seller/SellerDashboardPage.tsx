import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { ShoppingBag, Package, TrendingUp, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { formatVND } from '../../utils/format-currency';
import { sellerService, SellerDashboardData } from '../../services/seller-service';

// Trang Tổng Quan Kênh Người Bán (Gọi API thực tế GET /api/seller/dashboard từ Backend NestJS)
export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Hàm load dữ liệu thực tế từ API Backend NestJS
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sellerService.getDashboard();
      setData(res);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMsg('Tài khoản của bạn chưa có quyền Kênh Người Bán (Role SELLER) để xem thống kê này.');
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ gian hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <SellerLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        {/* Banner Chào Mừng Seller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {data?.shopName || 'Gian Hàng Kênh Người Bán'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Tổng quan chỉ số kinh doanh và hiệu suất cửa hàng của bạn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/seller/products/new')}
              className="inline-flex items-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold px-4 py-2 rounded shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Đăng Sản Phẩm Mới
            </button>
          </div>
        </div>

        {/* Cảnh báo lỗi nếu có */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Thống kê 4 Chỉ số Kinh doanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-[#ee4d2d] text-white p-3 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Doanh Thu Tháng Này</span>
              <h3 className="text-lg font-extrabold text-gray-800">
                {isLoading ? '...' : formatVND(data?.revenueThisMonth || 0)}
              </h3>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Đơn Hàng Mới</span>
              <h3 className="text-lg font-extrabold text-gray-800">
                {isLoading ? '...' : `${data?.newOrders || 0} Đơn`}
              </h3>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Tổng Sản Phẩm</span>
              <h3 className="text-lg font-extrabold text-gray-800">
                {isLoading ? '...' : `${data?.totalSPUs || 0} Mặt Hàng`}
              </h3>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-purple-600 text-white p-3 rounded-lg shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Đánh Giá Shop</span>
              <h3 className="text-lg font-extrabold text-gray-800">
                {isLoading ? '...' : `${data?.shopRating || 5.0} / 5.0 ★`}
              </h3>
            </div>
          </div>
        </div>

        {/* Việc Cần Làm */}
        <div className="border border-gray-100 rounded-lg p-5 bg-gray-50/50 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ee4d2d]" /> Danh Sách Việc Cần Làm
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-[#ee4d2d]">
                {isLoading ? '...' : data?.todo?.pendingConfirmation || 0}
              </span>
              <p className="text-xs text-gray-600 mt-1">Chờ Xác Nhận Đơn</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-blue-600">
                {isLoading ? '...' : data?.todo?.pendingPickup || 0}
              </span>
              <p className="text-xs text-gray-600 mt-1">Chờ Lấy Hàng</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-amber-600">
                {isLoading ? '...' : data?.todo?.returnRequests || 0}
              </span>
              <p className="text-xs text-gray-600 mt-1">Yêu Cầu Trả Hàng</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-emerald-600">
                {isLoading ? '...' : data?.todo?.lockedProducts || 0}
              </span>
              <p className="text-xs text-gray-600 mt-1">Sản Phẩm Tạm Khóa</p>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};
