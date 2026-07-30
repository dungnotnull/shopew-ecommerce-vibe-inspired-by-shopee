import React from 'react';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { ShoppingBag, Package, TrendingUp, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { formatVND } from '../../utils/format-currency';

// Trang Tổng Quan Kênh Người Bán (Seller Dashboard)
export const SellerDashboardPage: React.FC = () => {
  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Banner Chào Mừng Seller */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Tổng Quan Gian Hàng</h1>
            <p className="text-xs text-gray-500 mt-1">Theo dõi hoạt động kinh doanh và chỉ số bán hàng thời gian thực</p>
          </div>
          <button className="inline-flex items-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold px-4 py-2 rounded shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> Đăng Sản Phẩm Mới (SPU/SKU)
          </button>
        </div>

        {/* Thống kê 4 Chỉ số Kinh doanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-[#ee4d2d] text-white p-3 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Doanh Thu Tháng Này</span>
              <h3 className="text-lg font-extrabold text-gray-800">{formatVND(125400000)}</h3>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Đơn Hàng Mới</span>
              <h3 className="text-lg font-extrabold text-gray-800">48 Đơn</h3>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Tổng Sản Phẩm SPU</span>
              <h3 className="text-lg font-extrabold text-gray-800">124 Mặt Hàng</h3>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-purple-600 text-white p-3 rounded-lg shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Đánh Giá Shop</span>
              <h3 className="text-lg font-extrabold text-gray-800">4.9 / 5.0 ★</h3>
            </div>
          </div>
        </div>

        {/* Việc Cần Làm (To-do List cho Người Bán) */}
        <div className="border border-gray-100 rounded-lg p-5 bg-gray-50/50 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ee4d2d]" /> Danh Sách Việc Cần Làm
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-[#ee4d2d]">12</span>
              <p className="text-xs text-gray-600 mt-1">Chờ Xác Nhận Đơn</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-blue-600">5</span>
              <p className="text-xs text-gray-600 mt-1">Chờ Lấy Hàng</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-amber-600">2</span>
              <p className="text-xs text-gray-600 mt-1">Yêu Cầu Trả Hàng</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <span className="text-lg font-bold text-emerald-600">0</span>
              <p className="text-xs text-gray-600 mt-1">Sản Phẩm Tạm Khóa</p>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};
