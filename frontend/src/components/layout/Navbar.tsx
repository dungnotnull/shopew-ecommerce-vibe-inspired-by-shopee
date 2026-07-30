import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, HelpCircle, Globe, User, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Thanh Navbar phụ nằm phía trên cùng Header Shopee
export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="bg-[#ee4d2d] text-white text-xs py-1.5 border-b border-orange-600/30">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Phân vùng trái: Kênh Người Bán & Kết nối */}
        <div className="flex items-center space-x-3">
          <Link to="/seller" className="hover:opacity-80 flex items-center gap-1 font-medium">
            <Store className="w-3.5 h-3.5" />
            Kênh Người Bán
          </Link>
          <span className="opacity-40">|</span>
          <span className="cursor-pointer hover:opacity-80">Kết nối</span>
        </div>

        {/* Phân vùng phải: Thông báo, Hỗ trợ, Ngôn ngữ & User */}
        <div className="flex items-center space-x-4">
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

              {/* Menu Dropdown thông tin tài khoản */}
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-44">
                <div className="bg-white text-gray-800 rounded shadow-lg py-1 border border-gray-100">
                  <Link to="/user/profile" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Tài khoản của tôi
                  </Link>
                  <Link to="/user/address" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    Địa chỉ giao hàng
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-100"
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
