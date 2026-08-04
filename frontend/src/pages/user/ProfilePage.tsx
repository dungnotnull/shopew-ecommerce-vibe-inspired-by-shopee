import React, { useState } from 'react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Phone, Mail, Camera, Save, CheckCircle } from 'lucide-react';

// Trang Quản lý Hồ sơ Cá nhân (User Profile)
export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tự động đồng bộ thông tin Hồ sơ khi User store nạp từ API GET /api/auth/me thành công
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Lưu thông tin hồ sơ
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validate Số điện thoại buộc từ 10 đến 11 chữ số
    const phoneRegex = /^\d{10,11}$/;
    if (phone && !phoneRegex.test(phone.trim())) {
      setErrorMsg('Số điện thoại phải bao gồm từ 10 đến 11 chữ số.');
      return;
    }

    updateUser({ fullName, phone });
    setSuccessMsg('Cập nhật hồ sơ cá nhân thành công!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <CustomerLayout>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 max-w-4xl mx-auto">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h1 className="text-xl font-bold text-gray-800">Hồ Sơ Của Tôi</h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-xs flex items-center gap-2 border border-red-200">
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md text-xs flex items-center gap-2 border border-green-200">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột trái: Form cập nhật thông tin */}
          <form onSubmit={handleSaveProfile} className="md:col-span-2 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tên Đăng Nhập / Email</label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded text-gray-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Email tài khoản không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Họ Và Tên</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số Điện Thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#ee4d2d]"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#ee4d2d] hover:bg-[#d03e20] text-white font-bold px-6 py-2.5 rounded text-sm transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Lưu Thay Đổi
            </button>
          </form>

          {/* Cột phải: Đổi Avatar */}
          <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-6">
            <div className="relative group mb-4">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                alt={user?.fullName}
                className="w-28 h-28 rounded-full object-cover border-2 border-[#ee4d2d] p-0.5"
              />
              <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-[#ee4d2d] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">Dung lượng file tối đa 1 MB</span>
            <span className="text-xs text-gray-500">Định dạng: JPEG, PNG</span>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};
