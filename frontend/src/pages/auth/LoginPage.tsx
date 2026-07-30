import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types/auth';

// Trang Đăng nhập (Auth Flow đồng bộ với LoginDto & ForgotPasswordDto Backend)
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State hỗ trợ Modal/Form Quên mật khẩu
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

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

      // Đăng nhập thành công -> Lưu session kèm Role
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

  // Xử lý gửi yêu cầu Quên mật khẩu
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsSendingForgot(true);
    setTimeout(() => {
      setIsSendingForgot(false);
      setForgotSuccessMsg('Nếu tài khoản tồn tại, liên kết khôi phục mật khẩu đã được gửi đến email của bạn.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#ee4d2d] flex flex-col justify-between font-['Roboto',sans-serif]">
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
      <div className="max-w-6xl mx-auto px-4 py-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Cột bên trái: Dọn dẹp gọn gàng, hiển thị thông điệp thương hiệu */}
        <div className="hidden md:flex flex-col text-white space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight">Nền Tảng Mua Sắm & Bán Hàng Trực Tuyến</h2>
          <p className="text-white/90 text-lg">Trải nghiệm mua sắm tiện lợi và quản lý gian hàng chuyên nghiệp cùng Shopew.</p>
        </div>

        {/* Cột bên phải: Khung Form Đăng nhập */}
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full ml-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-5">Đăng Nhập</h3>

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

              {/* Link "Quên mật khẩu?" căn lề phải ngay dưới ô nhập Mật Khẩu */}
              <div className="text-right mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSuccessMsg('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-[#ee4d2d] hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            {/* 3 Nút chọn quyền (Customer, Seller, Admin) - Đã xóa nhãn tiêu đề thừa */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedRole('CUSTOMER')}
                className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                  selectedRole === 'CUSTOMER' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('SELLER')}
                className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                  selectedRole === 'SELLER' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Seller
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                  selectedRole === 'ADMIN' ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Admin
              </button>
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

      {/* Modal Khôi phục Mật khẩu */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-800 text-base">Đặt Lại Mật Khẩu</h4>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            {forgotSuccessMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-gray-500">Vui lòng nhập Email của bạn để nhận liên kết khôi phục mật khẩu.</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Đăng Ký</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingForgot}
                  className="w-full bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold py-2 rounded text-xs transition-colors uppercase disabled:opacity-50"
                >
                  {isSendingForgot ? 'Đang Gửi...' : 'Gửi Yêu Cầu Khôi Phục'}
                </button>
              </form>
            )}

            <div className="text-right">
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-xs text-gray-500 hover:underline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer nhỏ */}
      <div className="bg-white/10 text-white text-center py-4 text-xs border-t border-white/10">
        © 2026 Shopew Enterprise. Tất cả các quyền được bảo lưu.
      </div>
    </div>
  );
};
