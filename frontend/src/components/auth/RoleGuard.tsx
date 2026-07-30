import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types/auth';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

// Component bảo vệ Route phân quyền theo Role (CUSTOMER, SELLER, ADMIN)
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading, switchRole } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Chưa đăng nhập -> Chuyển hướng tới trang Đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu Role của User không nằm trong mảng allowedRoles -> Màn hình Cảnh báo phân quyền
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Không Có Quyền Truy Cập</h2>
          <p className="text-xs text-gray-500">
            Tài khoản của bạn hiện tại mang Vai Trò <span className="font-bold text-gray-800">[{user.role}]</span>. 
            Màn hình này yêu cầu quyền <span className="font-bold text-red-600">[{allowedRoles.join(' hoặc ')}]</span>.
          </p>

          {/* Nút hỗ trợ chuyển Role nhanh cho môi trường Test */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <p className="text-[11px] text-gray-400">Thao tác nhanh cho môi trường thử nghiệm:</p>
            <div className="flex justify-center gap-2">
              {allowedRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className="inline-flex items-center gap-1 bg-[#ee4d2d] hover:bg-[#d03e20] text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Đổi sang {role}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link to="/" className="text-xs text-gray-600 hover:text-[#ee4d2d] font-medium flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
