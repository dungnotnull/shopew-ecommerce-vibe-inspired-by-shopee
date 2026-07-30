# Checklist Test Case Authentication & Authorization Backend

Tài liệu kiểm thử danh sách các trường hợp (Test Cases) cho toàn bộ luồng **Xác thực (Authentication)** và **Phân quyền (Authorization)** của hệ thống Backend NestJS.

> **Trạng thái thực thi:** 22/22 Test Cases đã PASS 100% (Kiểm thử thực tế tự động ngày 30/07/2026).

---

## 1. Authentication (Xác thực & Đăng ký / Đăng nhập)

### 1.1. Đăng ký Tài khoản (Customer, Seller, Admin)
- [x] **TC-AUTH-01:** Đăng ký thành công tài khoản Customer mới qua `POST /api/auth/register` với đầy đủ thông tin hợp lệ (Email, Password >= 6 ký tự, FullName, Phone). Trả về `201 Created` kèm `access_token` và Role `CUSTOMER`. *(PASSED)*
- [x] **TC-AUTH-02:** Đăng ký thành công tài khoản Seller mới qua `POST /api/auth/register-seller`. Trả về `201 Created` kèm `access_token` và Role `SELLER`. *(PASSED)*
- [x] **TC-AUTH-03:** Đăng ký thành công tài khoản Admin mới qua `POST /api/auth/register-admin`. Trả về `201 Created` kèm `access_token` và Role `ADMIN`. *(PASSED)*
- [x] **TC-AUTH-04 (Rule Email Unique):** Đăng ký email đã tồn tại trong DB (ví dụ email đã dùng cho Customer, cố tình đăng ký lại làm Seller/Admin). Hệ thống từ chối và trả về lỗi `400 Bad Request` với thông báo *"Email already exists. Mỗi 1 email chỉ được dùng cho 1 user duy nhất bất kể role."* *(PASSED)*
- [x] **TC-AUTH-05:** Đăng ký thất bại khi bỏ trống các trường bắt buộc (`email`, `password`, `fullName`, `phone`). Hệ thống trả về `400 Bad Request` do ValidationPipe kích hoạt. *(PASSED)*
- [x] **TC-AUTH-06:** Đăng ký thất bại khi nhập `password` ngắn hơn 6 ký tự. Hệ thống trả về `400 Bad Request`. *(PASSED)*

---

### 1.2. Đăng nhập (Login)
- [x] **TC-AUTH-07:** Đăng nhập thành công qua `POST /api/auth/login` với Email và Password đúng. Trả về `200 OK` chứa `access_token` JWT và thông tin User Profile chính xác. *(PASSED)*
- [x] **TC-AUTH-08:** Đăng nhập thất bại khi sai Mật khẩu. Hệ thống trả về `401 Unauthorized`. *(PASSED)*
- [x] **TC-AUTH-09:** Đăng nhập thất bại khi Email chưa từng tồn tại trong hệ thống. Hệ thống trả về `401 Unauthorized`. *(PASSED)*
- [x] **TC-AUTH-10:** Đăng nhập thất bại khi gửi Body không đúng định dạng (thiếu email hoặc password). Trả về `400 Bad Request`. *(PASSED)*

---

### 1.3. Lấy Thông Tin Người Dùng (`GET /api/auth/me`)
- [x] **TC-AUTH-11:** Gửi Request kèm Header `Authorization: Bearer <valid_jwt_token>`. Trả về `200 OK` chứa thông tin chi tiết User Profile và Role hiện tại (`CUSTOMER`, `SELLER`, hoặc `ADMIN`). *(PASSED)*
- [x] **TC-AUTH-12:** Gửi Request không có Header Authorization hoặc Token bị rỗng. Trả về `401 Unauthorized`. *(PASSED)*
- [x] **TC-AUTH-13:** Gửi Request kèm Token giả hoặc Token đã bị hết hạn/chỉnh sửa chữ ký. Trả về `401 Unauthorized`. *(PASSED)*

---

### 1.4. Quên Mật Khẩu (`POST /api/auth/forgot-password`)
- [x] **TC-AUTH-14:** Gửi yêu cầu quên mật khẩu thành công với Email hợp lệ. Trả về `200 OK` chứa thông báo phản hồi mock. *(PASSED)*

---

## 2. Authorization (Phân quyền truy cập tài nguyên)

### 2.1. Phân quyền Kênh Người Bán (`GET /api/seller/dashboard`)
- [x] **TC-AUTHOR-01 (Chưa đăng nhập):** Truy cập `GET /api/seller/dashboard` khi chưa gửi Bearer Token. Trả về `401 Unauthorized`. *(PASSED)*
- [x] **TC-AUTHOR-02 (Cấm Customer):** Đăng nhập với tài khoản có Role `CUSTOMER`, gửi Token truy cập `GET /api/seller/dashboard`. Hệ thống từ chối và trả về `403 Forbidden`. *(PASSED)*
- [x] **TC-AUTHOR-03 (Cho phép Seller):** Đăng nhập với tài khoản có Role `SELLER`, gửi Token truy cập `GET /api/seller/dashboard`. Trả về `200 OK` chứa số liệu thống kê gian hàng. *(PASSED)*
- [x] **TC-AUTHOR-04 (Cho phép Admin):** Đăng nhập với tài khoản có Role `ADMIN`, gửi Token truy cập `GET /api/seller/dashboard`. Trả về `200 OK`. *(PASSED)*

---

### 2.2. Phân quyền Cổng Quản Trị Hệ Thống (`GET /api/admin/dashboard`)
- [x] **TC-AUTHOR-05 (Chưa đăng nhập):** Truy cập `GET /api/admin/dashboard` khi chưa gửi Bearer Token. Trả về `401 Unauthorized`. *(PASSED)*
- [x] **TC-AUTHOR-06 (Cấm Customer):** Đăng nhập với tài khoản Role `CUSTOMER`, gửi Token truy cập `GET /api/admin/dashboard`. Hệ thống từ chối và trả về `403 Forbidden`. *(PASSED)*
- [x] **TC-AUTHOR-07 (Cấm Seller):** Đăng nhập với tài khoản Role `SELLER`, gửi Token truy cập `GET /api/admin/dashboard`. Hệ thống từ chối và trả về `403 Forbidden`. *(PASSED)*
- [x] **TC-AUTHOR-08 (Cho phép Admin):** Đăng nhập với tài khoản Role `ADMIN`, gửi Token truy cập `GET /api/admin/dashboard`. Trả về `200 OK` chứa chỉ số tổng quan sàn (Users, Shops, GMV,...). *(PASSED)*

---

## 3. E-Commerce Core & Product Management (Phase 2)

### 3.1. Category Management (`GET /api/v1/categories`)
- [x] **TC-PHASE2-01 (Public):** Truy cập `GET /api/v1/categories` khi chưa đăng nhập. Trả về `200 OK` chứa cây danh mục phân cấp (`children`) và các thuộc tính động (`attributes`). *(PASSED)*

### 3.2. Shop Profiles (`/api/v1/shops`)
- [x] **TC-PHASE2-02 (Thêm mới hợp lệ):** Tạo Shop profile qua `POST /api/v1/shops` bằng tài khoản Role `SELLER`. Trả về `201 Created` và thông tin Shop. *(PASSED)*
- [x] **TC-PHASE2-03 (Lỗi Conflict):** Tạo Shop profile lần 2 cho cùng 1 User. Trả về lỗi `409 Conflict` (Shop already exists). *(PASSED)*
- [x] **TC-PHASE2-04 (Lỗi Phân quyền):** Truy cập `POST /api/v1/shops` bằng tài khoản Role `CUSTOMER`. Trả về `403 Forbidden`. *(PASSED)*
- [x] **TC-PHASE2-05 (Truy vấn hợp lệ):** Lấy thông tin Shop cá nhân `GET /api/v1/shops/me` (Role `SELLER`). Trả về `200 OK` cùng thông tin Shop. *(PASSED)*
- [x] **TC-PHASE2-06 (Cập nhật hợp lệ):** Cập nhật thông tin Shop `PUT /api/v1/shops/me` (Role `SELLER`). Trả về `200 OK` với dữ liệu mới. *(PASSED)*

### 3.3. Product SPU & SKU Management (`/api/seller/products`)
- [x] **TC-PHASE2-07 (Tạo SPU & Tự sinh Default SKU):** Seller tạo sản phẩm qua `POST /api/seller/products` không truyền `variantGroups` và `skus`. Hệ thống tạo SPU và tự động sinh 1 Default SKU với mảng `tierIndex` rỗng. Trả về `201 Created`. *(PASSED)*
- [x] **TC-PHASE2-08 (Tạo SPU & Multi-tier SKUs đầy đủ):** Seller tạo sản phẩm truyền kèm `variantGroups` (VD: Màu sắc, Kích cỡ) và danh sách `skus`. Hệ thống tạo SPU, Variant Groups, Variant Options, và SKUs tương ứng. Trả về `201 Created`. *(PASSED)*
- [x] **TC-PHASE2-09 (Lỗi Phân quyền tạo SP):** Cố ý gọi API `POST /api/seller/products` bằng Role `CUSTOMER`. Trả về `403 Forbidden`. *(PASSED)*
- [x] **TC-PHASE2-10 (Bảo mật Update/Sở hữu):** Seller gọi `PUT /api/seller/products/:id` hoặc `DELETE /api/seller/products/:id` để sửa/xóa sản phẩm của Shop người khác. Hệ thống trả về `403 Forbidden` (ForbiddenException/NotFound). *(PASSED)*
- [x] **TC-PHASE2-11 (Xóa SP hợp lệ):** Seller xóa thành công sản phẩm của chính mình. Trả về `200 OK`. *(PASSED)*

### 3.4. Product Details & Wishlist (`/api/v1/products`)
- [x] **TC-PHASE2-12 (Xem SP Public):** Truy cập chi tiết Sản phẩm `GET /api/v1/products/:id` (Không cần Token). Trả về `200 OK` bao gồm SPU, các `variantGroups`, và danh sách `skus`. *(PASSED)*
- [x] **TC-PHASE2-13 (Toggle Tim - Like):** Đăng nhập (bất kỳ Role nào) gọi `POST /api/v1/products/:id/like` lần 1. Hệ thống tạo ProductLike, tăng `likeCount` lên 1 và trả về `{ "liked": true }`. *(PASSED)*
- [x] **TC-PHASE2-14 (Toggle Tim - Unlike):** Gọi lại `POST /api/v1/products/:id/like` lần 2 cho cùng 1 sản phẩm. Hệ thống xóa bản ghi Like, giảm `likeCount` đi 1 và trả về `{ "liked": false }`. *(PASSED)*
- [x] **TC-PHASE2-15 (Lỗi Phân quyền Toggle):** Chưa đăng nhập gọi `POST /api/v1/products/:id/like`. Trả về `401 Unauthorized`. *(PASSED)*
