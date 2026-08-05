import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

// Component Bảo vệ Phân quyền theo Role
import { RoleGuard } from './components/auth/RoleGuard';

// Layouts & Pages
import { CustomerLayout } from './components/layout/CustomerLayout';
import { SellerLayout } from './components/layout/SellerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { AddressPage } from './pages/user/AddressPage';
import { UserOrderListPage } from './pages/user/UserOrderListPage';

import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerProductManagement } from './pages/seller/SellerProductManagement';
import { SellerProductListPage } from './pages/seller/SellerProductListPage';
import { SellerOrderListPage } from './pages/seller/SellerOrderListPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCategoryListPage } from './pages/admin/AdminCategoryListPage';
import { AdminBannerListPage } from './pages/admin/AdminBannerListPage';
import { AdminUserListPage } from './pages/admin/AdminUserListPage';
import { AdminProductListPage } from './pages/admin/AdminProductListPage';
import { AdminVoucherListPage } from './pages/admin/AdminVoucherListPage';

// Phase 2, 3 & 4 Catalog, Shop & Order Pages
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { ShopDetailPage } from './pages/ShopDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

// Khởi tạo React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component tự động cuộn lên đầu trang khi điều hướng Route hoặc mở chi tiết sản phẩm
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
};

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
        <ScrollToTop />
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
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/user/orders"
            element={
              <ProtectedRoute>
                <UserOrderListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <UserOrderListPage />
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
            path="/seller/products"
            element={
              <RoleGuard allowedRoles={['SELLER', 'ADMIN']}>
                <SellerLayout>
                  <SellerProductListPage />
                </SellerLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <RoleGuard allowedRoles={['SELLER', 'ADMIN']}>
                <SellerLayout>
                  <SellerOrderListPage />
                </SellerLayout>
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
            path="/admin/categories"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminCategoryListPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminUserListPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminProductListPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminBannerListPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/vouchers"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminLayout>
                  <AdminVoucherListPage />
                </AdminLayout>
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
