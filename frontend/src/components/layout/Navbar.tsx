import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, HelpCircle, Globe, User, LogOut, ShieldAlert, Store, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Thanh Navbar phụ nằm phía trên cùng Header Shopee
export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="bg-[#ee4d2d] text-white text-xs py-1.5 border-b border-orange-600/30 font-['Roboto',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Phân vùng trái: Chỉ hiển thị Cổng Quản Trị khi là Admin */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link to="/admin" className="hover:text-amber-200 flex items-center gap-1 text-amber-200 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              Cổng Quản Trị Admin
            </Link>
          )}
        </div>

        {/* Phân vùng phải: Thông báo, Hỗ trợ, Ngôn ngữ & User Profile */}
        <div className="flex items-center space-x-4 ml-auto">
          <button className="flex items-center gap-1 hover:opacity-80">
            <Bell className="w-3.5 h-3.5" />
            Thông Báo
          </button>
          <button className="flex items-center gap-1 hover:opacity-80">
            <HelpCircle className="w-3.5 h-3.5" />
            Hỗ Trợ
          </button>
          <button className="flex items-center gap-1 hover:opacity-80">
            <Globe className="w-3.5 h-3.5" />
            Tiếng Việt
          </button>

          {/* Xử lý hiển thị thông tin User hoặc Nút Đăng nhập/Đăng ký */}
          {isAuthenticated && user ? (
            <div className="relative group flex items-center gap-1.5 cursor-pointer py-1">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user.fullName}
                className="w-5 h-5 rounded-full object-cover border border-white"
              />
              <span className="font-medium">{user.fullName}</span>

              {/* Badge hiển thị Vai trò chính thức của Tài khoản */}
              <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                {user.role}
              </span>

              {/* Menu Dropdown điều hướng trang tương ứng với Role */}
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-48">
                <div className="bg-white text-gray-800 rounded shadow-lg py-1 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-[11px] text-gray-400">Tài khoản:</p>
                    <p className="font-bold text-gray-800 text-xs truncate">{user.email}</p>
                  </div>

                  <Link to="/user/profile" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-gray-500" />
                    Tài khoản của tôi
                  </Link>

                  <Link to="/user/orders" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs text-[#ee4d2d] font-medium">
                    <ShoppingBag className="w-4 h-4 text-[#ee4d2d]" />
                    Đơn mua của tôi
                  </Link>

                  {user.role === 'SELLER' && (
                    <Link to="/seller" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs text-[#ee4d2d] font-semibold">
                      <Store className="w-4 h-4 text-[#ee4d2d]" />
                      Quản lý Gian Hàng
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs text-red-600 font-semibold">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      Cổng Quản Trị Admin
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-100 text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 font-medium">
              <Link to="/register" className="hover:opacity-80">Đăng Ký</Link>
              <span className="opacity-40">|</span>
              <Link to="/login" className="hover:opacity-80">Đăng Nhập</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
