# Tài Liệu Luồng Xử Lý Phía Frontend & Giao Tiếp API Backend (Phase 1)

> Tài liệu đầy đủ xem tại file gốc dự án: [FLOW.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/FLOW.md).

---

## 🚀 TÓM TẮT LUỒNG DỮ LIỆU FRONTEND (FE - BE - DB)

### 1. Luồng Xác thực & Đăng ký Tài khoản (Auth & Registration)
- **Tầng FE:** Component `RegisterPage.tsx` thu thập thông tin người dùng (`email`, `password`, `fullName`, `phone`, `role`) -> Gọi `authService.register(payload)`.
- **Tầng BE:** `AuthController.register()` tiếp nhận `RegisterDto` -> Mã hóa băm mật khẩu `bcrypt.hash(password, 10)` -> Lưu vào PostgreSQL qua `prisma.user.create()`. Trả về `access_token`.
- **Tầng Session & State:** `useAuthStore.ts` lưu `shopew_token` vào LocalStorage và gọi `authService.getMe()` để đồng bộ thông tin User Profile thực tế từ Server.
- **Tự động chuyển hướng (Auto Navigate):**
  - Role `CUSTOMER` ➔ Redirect `/` (Trang chủ Mua sắm)
  - Role `SELLER` ➔ Redirect `/seller` (Kênh Người Bán)
  - Role `ADMIN` ➔ Redirect `/admin` (Cổng Admin)

---

### 2. Luồng Bảo Vệ Route Phân Quyền (Role Guard Routing)
- **Component Guard:** `RoleGuard.tsx` kiểm tra `user.role` từ Zustand Store.
- **Quy tắc phân quyền:**
  - Route `/user/*`: Cần đăng nhập (`ProtectedRoute`).
  - Route `/seller/*`: Cần role `SELLER` hoặc `ADMIN` (`RoleGuard allowedRoles={['SELLER', 'ADMIN']}`).
  - Route `/admin/*`: Cần role `ADMIN` (`RoleGuard allowedRoles={['ADMIN']}`).
