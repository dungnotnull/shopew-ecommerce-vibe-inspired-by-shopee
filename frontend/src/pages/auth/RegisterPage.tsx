import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, AlertCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth-service';

// Trang Đăng ký (Thực hiện call API thực tế POST /api/auth/register và GET /api/auth/me)
export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  // Xử lý nộp Form Đăng ký thực tế tới Backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !email || !phone || !password) {
      setErrorMsg('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Gọi API Đăng ký tài khoản thực tế: POST /api/auth/register (payload DTO: email, password, fullName, phone)
      const regRes = await authService.register({
        email,
        password,
        fullName,
        phone,
      });

      const token = regRes.access_token;
      localStorage.setItem('shopew_token', token);

      // 2. Lấy thông tin Profile & Role chính thức từ Server NestJS: GET /api/auth/me
      const userProfile = await authService.getMe();

      // 3. Lưu Auth Session vào Zustand Store
      setAuthSession(token, userProfile);

      // 4. Tự động điều hướng theo Role thực tế của User vừa khởi tạo
      if (userProfile.role === 'SELLER') {
        navigate('/seller');
      } else if (userProfile.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      // Trích xuất thông báo lỗi từ Backend NestJS
      const backendMsg = err.response?.data?.message;
      if (Array.isArray(backendMsg)) {
        setErrorMsg(backendMsg.join(', '));
      } else if (typeof backendMsg === 'string') {
        setErrorMsg(backendMsg);
      } else {
        setErrorMsg('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="text-gray-800 text-lg font-normal ml-3 border-l border-gray-300 pl-3">Đăng Ký</span>
          </Link>
          <a href="#" className="text-xs text-[#ee4d2d] hover:underline">Bạn cần trợ giúp?</a>
        </div>
      </div>

      {/* Form Đăng ký giữa màn hình */}
      <div className="max-w-6xl mx-auto px-4 py-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col text-white space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight">Tạo Tài Khoản Shopew Miễn Phí</h2>
          <p className="text-white/90 text-lg">Tham gia mua sắm hoặc mở gian hàng kinh doanh cùng hàng triệu người dùng.</p>
        </div>

        {/* Khung Form Register */}
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full ml-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Đăng Ký Tài Khoản</h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Họ Và Tên *</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">Địa Chỉ Email *</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số Điện Thoại *</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mật Khẩu *</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  minLength={6}
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Xác Nhận Mật Khẩu *</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
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

          <div className="mt-5 text-center text-xs text-gray-500">
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
