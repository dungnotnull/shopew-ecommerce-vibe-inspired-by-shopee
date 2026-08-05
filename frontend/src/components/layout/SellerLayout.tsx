import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, Package, ShoppingBag, BarChart2, Ticket, MessageSquare, ArrowLeft, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SellerLayoutProps {
  children?: React.ReactNode;
}

// Layout dành riêng cho Kênh Người Bán (Seller Center Portal)
export const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { label: 'Tổng Quan Shop', path: '/seller', icon: BarChart2 },
    { label: 'Hồ Sơ Gian Hàng', path: '/seller/profile', icon: Store },
    { label: 'Quản Lý Sản Phẩm', path: '/seller/products', icon: Package },
    { label: 'Quản Lý Đơn Hàng', path: '/seller/orders', icon: ShoppingBag },
    { label: 'Kênh Marketing / Voucher', path: '/seller/vouchers', icon: Ticket },
    { label: 'Chương Trình Flash Sale', path: '/seller/flash-sales', icon: Zap },
    { label: 'Chat Với Khách Hàng', path: '/seller/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col font-['Roboto',sans-serif]">
      {/* Header Topbar Kênh Người Bán */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-[#ee4d2d] font-bold text-xl">
            <div className="bg-[#ee4d2d] text-white p-1 rounded-md">
              <Store className="w-5 h-5" />
            </div>
            <span>Shopew Kênh Người Bán</span>
          </Link>
          <span className="text-xs bg-orange-100 text-[#ee4d2d] font-semibold px-2 py-0.5 rounded">
            Seller Center
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="text-gray-600 hover:text-[#ee4d2d] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang Khách Hàng
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt="Seller Avatar"
              className="w-7 h-7 rounded-full object-cover border border-orange-200"
            />
            <span className="font-bold text-gray-800">{user?.fullName || 'Gian Hàng Shopew'}</span>
          </div>
          <button onClick={logout} className="text-red-600 hover:underline flex items-center gap-1 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Thoát
          </button>
        </div>
      </header>

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Menu bên trái */}
        <aside className="w-64 bg-white rounded-lg border border-gray-200 p-4 shrink-0 shadow-sm h-fit">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Danh Mục Quản Lý
          </div>
          <nav className="space-y-1 text-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-[#ee4d2d] font-bold border-l-4 border-[#ee4d2d]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ee4d2d]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Nội dung trang chính bên phải */}
        <main className="flex-1 bg-white rounded-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">
          {children}
        </main>
      </div>
    </div>
  );
};
