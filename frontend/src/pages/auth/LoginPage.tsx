import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

// Trang Đăng nhập (Auth Flow)
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    setIsSubmitting(true);

    // Giả lập/Xử lý đăng nhập khớp API Contract
    setTimeout(() => {
      setIsSubmitting(false);

      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }

      // Đăng nhập thành công -> lưu session vào Zustand
      setAuth({
        accessToken: 'mock_jwt_access_token_shopew_12345',
        user: {
          id: 1,
          email,
          fullName: email.split('@')[0] || 'Người dùng Shopew',
          phone: '0987654321',
          role: 'CUSTOMER',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
        }
      });

      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#ee4d2d] flex flex-col justify-between">
      {/* Header nhỏ hiển thị thương hiệu */}
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

      {/* Form Đăng nhập giữa trang */}
      <div className="max-w-6xl mx-auto px-4 py-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col text-white space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight">Nền Tảng Mua Sắm Yêu Thích Của Bạn</h2>
          <p className="text-white/90 text-lg">Hàng triệu sản phẩm giá tốt, Voucher giảm giá ngập tràn đang chờ đón bạn.</p>
        </div>

        {/* Khung Form Login */}
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full ml-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Đăng Nhập</h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email / Số Điện Thoại</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold py-2.5 rounded text-sm transition-colors uppercase disabled:opacity-50"
            >
              {isSubmitting ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
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
