import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, AlertCircle, ShieldCheck, Store, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types/auth';

// Trang Đăng nhập (Auth Flow đồng bộ với LoginDto Backend)
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Xử lý nộp Form Đăng nhập
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Đăng nhập thành công -> Lưu session kèm Role chọn
      setAuth({
        accessToken: `mock_jwt_token_${selectedRole.toLowerCase()}_12345`,
        user: {
          id: 1,
          email,
          fullName: email.split('@')[0] || 'Người dùng Shopew',
          phone: '0987654321',
          role: selectedRole,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
        }
      });

      // Chuyển hướng theo Role
      if (selectedRole === 'SELLER') {
        navigate('/seller');
      } else if (selectedRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }, 600);
  };

  // Nút đăng nhập thử nghiệm nhanh theo từng Role
  const handleQuickLogin = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setSelectedRole(role);
    setAuth({
      accessToken: `mock_jwt_token_${role.toLowerCase()}_12345`,
      user: {
        id: Date.now(),
        email: demoEmail,
        fullName: role === 'ADMIN' ? 'Super Admin Shopew' : role === 'SELLER' ? 'Chủ Shop Mall' : 'Khách Hàng Mua Sắm',
        phone: '0987654321',
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      }
    });

    if (role === 'SELLER') navigate('/seller');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#ee4d2d] flex flex-col justify-between">
      {/* Header thương hiệu */}
      <div className="bg-white py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-[#ee4d2d] font-bold text-2xl">
            <div className="bg-[#ee4d2d] text-white p-1.5 rounded-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span>shopew</span>
            <span className="text-gray-800 text-lg font-normal ml-3 border-l border-gray-300 pl-3">Đăng Nhập</span>
          </Link>
          <a href="#" className="text-xs text-[#ee4d2d] hover:underline">Bạn cần trợ giúp?</a>
        </div>
      </div>

      {/* Form Đăng nhập giữa màn hình */}
      <div className="max-w-6xl mx-auto px-4 py-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col text-white space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight">Nền Tảng Mua Sắm & Bán Hàng Trực Tuyến</h2>
          <p className="text-white/90 text-lg">Hệ thống phân quyền thông minh dành cho Khách hàng, Người bán và Quản trị viên.</p>

          {/* Block Đăng nhập nhanh kiểm thử theo Role */}
          <div className="bg-white/10 p-4 rounded-lg border border-white/20 space-y-2 mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-200">Đăng Nhập Thử Nhanh Theo Role (Quick Demo Login):</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleQuickLogin('CUSTOMER', 'customer@shopew.com')}
                className="bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#ee4d2d]" /> Khách Hàng (Customer)
              </button>
              <button
                onClick={() => handleQuickLogin('SELLER', 'seller@shopew.com')}
                className="bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm"
              >
                <Store className="w-3.5 h-3.5 text-blue-600" /> Kênh Người Bán (Seller)
              </button>
              <button
                onClick={() => handleQuickLogin('ADMIN', 'admin@shopew.com')}
                className="bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Cổng Admin (Admin)
              </button>
            </div>
          </div>
        </div>

        {/* Khung Form Login */}
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full ml-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Đăng Nhập</h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Tài Khoản</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mật Khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Chọn Vai Trò Đăng Nhập (Role)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`py-1.5 text-xs font-bold rounded border ${
                    selectedRole === 'CUSTOMER' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('SELLER')}
                  className={`py-1.5 text-xs font-bold rounded border ${
                    selectedRole === 'SELLER' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`py-1.5 text-xs font-bold rounded border ${
                    selectedRole === 'ADMIN' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold py-2.5 rounded text-sm transition-colors uppercase disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Đang Đăng Nhập...' : `Đăng Nhập (${selectedRole})`}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <span>Bạn mới biết đến Shopew? </span>
            <Link to="/register" className="text-[#ee4d2d] font-bold hover:underline">Đăng Ký</Link>
          </div>
        </div>
      </div>

      {/* Footer nhỏ */}
      <div className="bg-white/10 text-white text-center py-4 text-xs border-t border-white/10">
        © 2026 Shopew Enterprise. Tất cả các quyền được bảo lưu.
      </div>
    </div>
  );
};
