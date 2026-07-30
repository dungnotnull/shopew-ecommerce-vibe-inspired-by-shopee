import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ShieldAlert, Users, Store, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatVND } from '../../utils/format-currency';

// Trang Tổng Quan Cổng Quản Trị Admin (Admin Dashboard)
export const AdminDashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cổng Quản Trị Hệ Thống Shopew</h1>
            <p className="text-xs text-slate-500 mt-1">Quản lý toàn bộ người dùng, duyệt shop và giải quyết khiếu nại tranh chấp</p>
          </div>
          <span className="text-xs bg-slate-900 text-white font-bold px-3 py-1.5 rounded shadow">
            Super Admin View
          </span>
        </div>

        {/* 4 Thống kê Hệ thống */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Tổng Người Dùng</span>
              <h3 className="text-lg font-extrabold text-slate-800">12,850 User</h3>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-700 text-white p-3 rounded-lg shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Tổng Gian Hàng (Shop)</span>
              <h3 className="text-lg font-extrabold text-slate-800">845 Shop</h3>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-amber-600 text-white p-3 rounded-lg shadow-sm">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Tranh Chấp Đang Xử Lý</span>
              <h3 className="text-lg font-extrabold text-slate-800">3 Ca Khiếu Nại</h3>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">GMV Toàn Sàn (VND)</span>
              <h3 className="text-lg font-extrabold text-slate-800">{formatVND(4520000000)}</h3>
            </div>
          </div>
        </div>

        {/* Ca Khiếu Nại Cần Xử Lý Nhanh */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Trọng Tài Trả Hàng / Hoàn Tiền Chờ Admin Xử Lý
            </h3>
            <span className="text-xs text-slate-500">Cần phản hồi trong 24h</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="border border-slate-200 rounded p-3 flex justify-between items-center bg-slate-50">
              <div>
                <span className="font-bold text-slate-800">Đơn Hàng #GRP-88219</span>
                <p className="text-slate-600 mt-0.5">Khách hàng yêu cầu hoàn tiền lý do "Hàng bể vỡ", Shop không đồng ý nhận lại.</p>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded transition-colors">
                Xem Bằng Chứng & Phán Quyết
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
