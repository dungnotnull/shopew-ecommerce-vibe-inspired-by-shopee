# Tài Liệu Luồng Xử Lý Hệ Thống Shopew (Phase 1: Auth & Core Setup)

> **Mô tả:** Tài liệu này tổng hợp toàn bộ các luồng giao tiếp dữ liệu giữa **Frontend (FE)**, **Backend (BE)** và **Database (DB)** sau khi hoàn thành Phase 1.

---

## 🏗️ Kiến Trúc Hệ Thống (Three-Tier Architecture)

- **Frontend (FE):** React.js + TypeScript + Vite + Tailwind CSS + Zustand (`useAuthStore`) + Axios Client (`api-client.ts`).
- **Backend (BE):** Node.js + NestJS Framework + JWT Passport Strategy + Bcrypt + Prisma ORM.
- **Database (DB):** PostgreSQL (Bảng `User`, `Address`, Enum `Role`: `CUSTOMER`, `SELLER`, `ADMIN`).
- **Base API URL:** `http://localhost:3000/api`
- **Tiền tệ chuẩn:** **VND (Việt Nam Đồng)**.

---

## 1. 📝 LUỒNG ĐĂNG KÝ TÀI KHOẢN (REGISTRATION FLOW)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant FE as Frontend (React + Zustand)
    participant BE as Backend (NestJS AuthService)
    participant DB as Database (PostgreSQL / Prisma)

    User->>FE: Điền Form Đăng ký (Họ tên, Email, SĐT, Mật khẩu, Chọn Role)
    FE->>FE: Validate dữ liệu (Mật khẩu khớp nhau, >= 6 ký tự)
    FE->>BE: POST /api/auth/register { email, password, fullName, phone, role }
    BE->>DB: Query kiểm tra Email tồn tại (UsersService.findByEmail)
    alt Email đã tồn tại trong CSDL
        DB-->>BE: Trả về User record cũ
        BE-->>FE: HTTP 400 Bad Request ("Email already exists")
        FE-->>User: Hiển thị thông báo lỗi trên UI
    else Email hợp lệ (Chưa tồn tại)
        DB-->>BE: null
        BE->>BE: Mã hóa mật khẩu: bcrypt.hash(password, 10)
        BE->>DB: INSERT User mới vào bảng "User" (email, password_hash, role,...)
        DB-->>BE: Bản ghi User mới khởi tạo (id, email, role,...)
        BE->>BE: Sinh JWT Access Token chứa payload (sub: id, email, role)
        BE-->>FE: HTTP 201 Created { access_token }
        FE->>BE: Gửi GET /api/auth/me (Bearer Token)
        BE-->>FE: HTTP 200 OK (UserProfile thực tế từ DB)
        FE->>FE: Lưu token & profile vào LocalStorage / Zustand Store
        FE-->>User: Tự động điều hướng sang giao diện theo Role (/, /seller, /admin)
    end
```

### Chi tiết dữ liệu từng tầng:
1. **Frontend:** Gửi Request Payload `RegisterRequestPayload`:
   ```json
   {
     "email": "user@shopew.com",
     "password": "password123",
     "fullName": "Nguyễn Văn A",
     "phone": "0987654321",
     "role": "SELLER"
   }
   ```
2. **Backend:** Validate qua `RegisterDto`, băm mật khẩu qua `bcrypt.hash(dto.password, 10)`, gọi `prisma.user.create()`.
3. **Database:** Tạo bản ghi mới trong bảng `User`:
   - `id`: Tự tăng (Autoincrement).
   - `password`: Chuỗi mã hóa Bcrypt.
   - `role`: Enum `'CUSTOMER' | 'SELLER' | 'ADMIN'`.

---

## 2. 🔑 LUỒNG ĐĂNG NHẬP (LOGIN FLOW)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant FE as Frontend (React + Zustand)
    participant BE as Backend (NestJS AuthService)
    participant DB as Database (PostgreSQL / Prisma)

    User->>FE: Nhập Email & Mật khẩu -> Bấm "Đăng Nhập"
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: SELECT * FROM "User" WHERE email = $1 LIMIT 1
    alt Email không tồn tại
        DB-->>BE: null
        BE-->>FE: HTTP 401 Unauthorized ("Invalid credentials")
        FE-->>User: Hiển thị lỗi "Email hoặc mật khẩu không chính xác"
    else Email tồn tại
        DB-->>BE: Trả về bản ghi User (kèm password hash)
        BE->>BE: Đối soát mật khẩu: bcrypt.compare(password, user.password)
        alt Mật khẩu không khớp
            BE-->>FE: HTTP 401 Unauthorized ("Invalid credentials")
            FE-->>User: Hiển thị lỗi "Email hoặc mật khẩu không chính xác"
        else Mật khẩu hợp lệ
            BE->>BE: Tạo JWT Access Token mới (Payload: sub, email, role)
            BE-->>FE: HTTP 200 OK { access_token }
            FE->>FE: Lưu token vào LocalStorage
            FE->>BE: Gửi GET /api/auth/me (Header: Authorization: Bearer <token>)
            BE-->>FE: HTTP 200 OK { id, email, fullName, phone, role, isActive }
            FE->>FE: Lưu User Profile vào Zustand Store (setAuthSession)
            FE-->>User: Điều hướng tự động về màn hình ứng với Role (/, /seller, /admin)
        end
    end
```

---

## 3. 🔄 LUỒNG KHÔI PHỤC SESSION KHI REFRESH TRANG (AUTO SESSION RESTORE)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng mở lại web / F5
    participant FE as Frontend (React + Zustand initAuth)
    participant BE as Backend (NestJS AuthGuard)
    participant DB as Database (PostgreSQL / Prisma)

    FE->>FE: Khởi chạy App (initAuth) -> Đọc shopew_token từ LocalStorage
    alt Không có token
        FE->>FE: Trạng thái Khách chưa đăng nhập (isAuthenticated = false)
    else Có token
        FE->>BE: GET /api/auth/me (Header Authorization: Bearer <token>)
        BE->>BE: JwtStrategy xác thực chữ ký Token & giải mã Payload
        BE->>DB: SELECT * FROM "User" WHERE id = payload.sub
        alt Token hợp lệ & User tồn tại
            DB-->>BE: Bản ghi User
            BE-->>FE: HTTP 200 OK (UserProfile)
            FE->>FE: Cập nhật Zustand Store (isAuthenticated = true)
        else Token hết hạn / Lỗi
            BE-->>FE: HTTP 401 Unauthorized
            FE->>FE: Xóa shopew_token & shopew_user khỏi LocalStorage
        end
    end
```

---

## 4. 🛡️ LUỒNG BẢO VỆ ROUTE VÀ PHÂN QUYỀN (ROLE-BASED ROUTING)

- **Cấu hình Router Phân Quyền (`App.tsx` & `RoleGuard.tsx`):**
  - **Tuyến đường Mua sắm (`/`):** Cho phép tất cả người dùng (Public Route).
  - **Tuyến đường Cá nhân (`/user/profile`, `/user/address`):** Bảo vệ bởi `ProtectedRoute` (Yêu cầu đã Đăng nhập).
  - **Kênh Người Bán (`/seller`):** Bảo vệ bởi `RoleGuard allowedRoles={['SELLER', 'ADMIN']}`.
  - **Cổng Quản Trị Admin (`/admin`):** Bảo vệ bởi `RoleGuard allowedRoles={['ADMIN']}`.
- **Xử lý khi vi phạm quyền:** Nếu tài khoản `CUSTOMER` cố tình gõ URL `/admin`, `RoleGuard` sẽ chặn lại và hiển thị màn hình Cảnh báo *"Không Có Quyền Truy Cập"*, kèm nút đưa người dùng quay về Trang chủ.

---

## 5. 📧 LUỒNG ĐẶT LẠI MẬT KHẨU (FORGOT PASSWORD FLOW)

1. Người dùng bấm link **"Quên mật khẩu?"** tại màn hình Đăng nhập.
2. Modal hiển thị ô nhập Email -> Bấm **"Gửi Yêu Cầu Khôi Phục"**.
3. FE gửi HTTP Call `POST /api/auth/forgot-password` chứa `{ email }`.
4. BE tiếp nhận `ForgotPasswordDto`, tạo mock token reset bảo mật thời hạn 15 phút.
5. BE phản hồi thông báo dịu dàng ngăn chặn rò rỉ Email (Prevent Email Enumeration): Trả về `{ message: "If an account exists, a reset link has been sent." }`.

---

## 📊 BẢNG TÓM TẮT API ENDPOINTS PHASE 1

| Endpoint | Method | Header | Body Payload | Phản hồi (Data) | Mục đích |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | N/A | `{ email, password, fullName, phone, role? }` | `{ access_token }` | Đăng ký tài khoản mới vào DB |
| `/api/auth/login` | `POST` | N/A | `{ email, password }` | `{ access_token }` | Xác thực đăng nhập & lấy Token |
| `/api/auth/me` | `GET` | `Bearer <token>` | N/A | `{ id, email, fullName, phone, role, isActive }` | Lấy Profile & Role thực tế từ CSDL |
| `/api/auth/forgot-password` | `POST` | N/A | `{ email }` | `{ message }` | Yêu cầu gửi link khôi phục mật khẩu |
