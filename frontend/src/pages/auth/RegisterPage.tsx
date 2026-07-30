import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../services/api-client';

// Trang Đăng ký (Auth Flow)
export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Xử lý nộp Form Đăng ký
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    setIsSubmitting(true);

    const registerUser = async () => {
      try {
        const response = await apiClient.post('/auth/register', { email, password, fullName, phone });
        const { access_token, user } = response.data.data;

        // Lưu thông tin đăng ký mới vào state
        setAuth({
          accessToken: access_token,
          user: {
            ...user,
            avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
          }
        });

        localStorage.setItem('shopew_token', access_token);
        navigate('/');
      } catch (error: any) {
        setErrorMsg(error.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    };

    registerUser();
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
            <span className="text-gray-800 text-lg font-normal ml-3 border-l border-gray-300 pl-3">Đăng Ký</span>
          </Link>
          <a href="#" className="text-xs text-[#ee4d2d] hover:underline">Bạn cần trợ giúp?</a>
        </div>
      </div>

      {/* Form Đăng ký giữa màn hình */}
      <div className="max-w-6xl mx-auto px-4 py-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col text-white space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight">Tạo Tài Khoản Shopew Miễn Phí</h2>
          <p className="text-white/90 text-lg">Tham gia cộng đồng mua sắm trực tuyến lớn nhất cùng nhiều ưu đãi độc quyền.</p>
        </div>

        {/* Khung Form Register */}
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full ml-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Đăng Ký Tài Khoản</h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Họ Và Tên</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Địa Chỉ Email</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số Điện Thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mật Khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  minLength={6}
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Xác Nhận Mật Khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold py-2.5 rounded text-sm transition-colors uppercase disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Đang Đăng Ký...' : 'Đăng Ký'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <span>Bạn đã có tài khoản? </span>
            <Link to="/login" className="text-[#ee4d2d] font-bold hover:underline">Đăng Nhập</Link>
          </div>
        </div>
      </div>

      <div className="bg-white/10 text-white text-center py-4 text-xs border-t border-white/10">
        © 2026 Shopew Enterprise. Tất cả các quyền được bảo lưu.
      </div>
    </div>
  );
};
