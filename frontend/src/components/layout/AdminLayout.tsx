import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Users, ShoppingBag, RotateCcw, Tag, LogOut, ArrowLeft, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

// Layout dành riêng cho Cổng Quản Trị Hệ Thống (Admin Portal)
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { label: 'Tổng Quan Admin', path: '/admin', icon: ShieldAlert },
    { label: 'Quản Lý Danh Mục Ngành Hàng', path: '/admin/categories', icon: Layers },
    { label: 'Quản Lý Người Dùng & Shop', path: '/admin/users', icon: Users },
    { label: 'Duyệt Sản Phẩm SPU/SKU', path: '/admin/products', icon: ShoppingBag },
    { label: 'Trọng Tài Trả Hàng / Hoàn Tiền', path: '/admin/disputes', icon: RotateCcw },
    { label: 'Quản Lý Banner & Voucher Sàn', path: '/admin/vouchers', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Roboto',sans-serif]">
      {/* Header Admin Topbar màu tối sang trọng */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="bg-red-600 p-1.5 rounded-md">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span>Shopew Admin Portal</span>
          </Link>
          <span className="text-xs bg-red-950 text-red-400 font-semibold px-2 py-0.5 rounded border border-red-800">
            System Admin
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Về Trang Mua Sắm
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-slate-200">{user?.fullName || 'Administrator'}</span>
          </div>
          <button onClick={logout} className="text-red-400 hover:underline flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Thoát
          </button>
        </div>
      </header>

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Menu */}
        <aside className="w-64 bg-slate-800 text-slate-200 rounded-lg p-4 shrink-0 shadow-lg h-fit">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Quản Trị Hệ Thống
          </div>
          <nav className="space-y-1 text-xs font-medium">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white font-bold'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg border border-slate-200 p-6 shadow-sm min-h-[500px]">
          {children}
        </main>
      </div>
    </div>
  );
};
