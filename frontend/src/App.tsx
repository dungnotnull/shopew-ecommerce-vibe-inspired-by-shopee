import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

// Component Bảo vệ Phân quyền theo Role
import { RoleGuard } from './components/auth/RoleGuard';

// Layouts & Pages
import { CustomerLayout } from './components/layout/CustomerLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { AddressPage } from './pages/user/AddressPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Phase 2 & 3 Catalog & Shop Pages
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { ShopDetailPage } from './pages/ShopDetailPage';
import { SellerProductManagement } from './pages/seller/SellerProductManagement';

// Khởi tạo React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component bảo vệ Route cơ bản (Yêu cầu đăng nhập)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Đang tải Shopew...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Restore session Đăng nhập khi mở lại ứng dụng
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes - Khách hàng tự do xem trang chủ, sản phẩm, tìm kiếm & Auth */}
          <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shops/:id" element={<ShopDetailPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Customer Routes - Dành cho người dùng cá nhân đã đăng nhập */}
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/address"
            element={
              <ProtectedRoute>
                <AddressPage />
              </ProtectedRoute>
            }
          />

          {/* Kênh Người Bán (Seller Center Portal) - Bảo vệ yêu cầu Role SELLER hoặc ADMIN */}
          <Route
            path="/seller"
            element={
              <RoleGuard allowedRoles={['SELLER', 'ADMIN']}>
                <SellerDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <RoleGuard allowedRoles={['SELLER', 'ADMIN']}>
                <SellerProductManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/seller/*"
            element={
              <RoleGuard allowedRoles={['SELLER', 'ADMIN']}>
                <SellerDashboardPage />
              </RoleGuard>
            }
          />

          {/* Cổng Quản Trị Admin (Admin Portal) - Bảo vệ yêu cầu duy nhất Role ADMIN */}
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/*"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />

          {/* Fallback route mặc định */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
