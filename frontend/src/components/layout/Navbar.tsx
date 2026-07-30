import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, HelpCircle, Globe, User, LogOut, Store, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Thanh Navbar phụ nằm phía trên cùng Header Shopee
export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchRole } = useAuthStore();

  return (
    <div className="bg-[#ee4d2d] text-white text-xs py-1.5 border-b border-orange-600/30">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Phân vùng trái: Kênh Người Bán & Cổng Admin */}
        <div className="flex items-center space-x-3">
          <Link to="/seller" className="hover:opacity-80 flex items-center gap-1 font-medium">
            <Store className="w-3.5 h-3.5" />
            Kênh Người Bán
          </Link>
          <span className="opacity-40">|</span>
          <Link to="/admin" className="hover:opacity-80 flex items-center gap-1 font-medium text-yellow-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Cổng Admin
          </Link>
        </div>

        {/* Phân vùng phải: Thông báo, Hỗ trợ, Ngôn ngữ & User Profile */}
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

              {/* Badge hiển thị Role hiện tại */}
              <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {user.role}
              </span>

              {/* Menu Dropdown thông tin tài khoản & Đổi Role */}
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-52">
                <div className="bg-white text-gray-800 rounded shadow-lg py-1 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-[11px] text-gray-400">Vai Trò Hiện Tại:</p>
                    <p className="font-bold text-[#ee4d2d] text-xs">{user.role}</p>
                  </div>

                  <Link to="/user/profile" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Tài khoản của tôi
                  </Link>
                  <Link to="/seller" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-500" />
                    Giao diện Kênh Người Bán
                  </Link>
                  <Link to="/admin" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-gray-500" />
                    Giao diện Cổng Admin
                  </Link>

                  {/* Nút đổi nhanh Role thử nghiệm */}
                  <div className="px-4 py-2 border-t border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Đổi Role kiểm thử:
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => switchRole('CUSTOMER')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          user.role === 'CUSTOMER' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        CUSTOMER
                      </button>
                      <button
                        onClick={() => switchRole('SELLER')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          user.role === 'SELLER' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        SELLER
                      </button>
                      <button
                        onClick={() => switchRole('ADMIN')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          user.role === 'ADMIN' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        ADMIN
                      </button>
                    </div>
                  </div>

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
