import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ShieldAlert, Users, Store, RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatVND } from '../../utils/format-currency';
import { adminService, AdminDashboardData } from '../../services/admin-service';

// Trang Tổng Quan Cổng Quản Trị Admin (Gọi API thực tế GET /api/admin/dashboard từ Backend NestJS)
export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Hàm load dữ liệu thực tế từ API Backend NestJS
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await adminService.getDashboard();
      setData(res);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMsg('Tài khoản của bạn chưa có quyền Super Admin (Role ADMIN) để xem dữ liệu này.');
      } else {
        setErrorMsg('Không thể kết nối đến API Admin Backend. Vui lòng kiểm tra lại server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 font-['Roboto',sans-serif]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cổng Quản Trị Hệ Thống Shopew</h1>
            <p className="text-xs text-slate-500 mt-1">
              Dữ liệu thời gian thực được đồng bộ từ Backend NestJS API (`GET /api/admin/dashboard`)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại API
            </button>
            <span className="text-xs bg-slate-900 text-white font-bold px-3 py-1.5 rounded shadow">
              Super Admin View
            </span>
          </div>
        </div>

        {/* Cảnh báo lỗi API nếu có */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 4 Thống kê Hệ thống từ API Backend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Tổng Người Dùng</span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {isLoading ? '...' : `${data?.totalUsers?.toLocaleString('vi-VN') || 0} User`}
              </h3>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-700 text-white p-3 rounded-lg shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Tổng Gian Hàng (Shop)</span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {isLoading ? '...' : `${data?.totalShops?.toLocaleString('vi-VN') || 0} Shop`}
              </h3>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-amber-600 text-white p-3 rounded-lg shadow-sm">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Tranh Chấp Đang Xử Lý</span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {isLoading ? '...' : `${data?.activeDisputes || 0} Ca Khiếu Nại`}
              </h3>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">GMV Toàn Sàn (VND)</span>
              <h3 className="text-lg font-extrabold text-slate-800">
                {isLoading ? '...' : formatVND(data?.totalGMV || 0)}
              </h3>
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
