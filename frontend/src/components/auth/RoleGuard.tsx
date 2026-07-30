import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

// Component bảo vệ Route phân quyền chính xác theo Role tài khoản từ Backend
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  // Chưa đăng nhập -> Chuyển hướng tới trang Đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu Role thực tế của User không được phép truy cập -> Hiển thị màn hình Cảnh báo không đủ quyền
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Roboto',sans-serif]">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Không Có Quyền Truy Cập</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tài khoản của bạn mang vai trò <span className="font-bold text-gray-800">[{user.role}]</span> không thể truy cập phân vùng này. 
            Màn hình này chỉ dành cho người dùng thuộc vai trò <span className="font-bold text-red-600">[{allowedRoles.join(', ')}]</span>.
          </p>

          <div className="pt-4 border-t border-gray-100">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold py-2.5 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay Về Trang Chủ Mua Sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
