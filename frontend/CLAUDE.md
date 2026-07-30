# Frontend Agent Context & Guidelines (Shopew FE)

## 1. Tổng quan Dự án (Project Overview)
Shopew là nền tảng Thương mại Điện tử đa vai trò chuẩn doanh nghiệp, mô phỏng 100% Shopee.vn. Phía Frontend (FE) chịu trách nhiệm xây dựng giao diện người dùng cho 3 phân vùng chính:
- **Customer Storefront:** Trang mua sắm dành cho Khách hàng (Trang chủ, Tìm kiếm & Lọc sản phẩm SPU/SKU, Giỏ hàng, Checkout, Flash Sale, Đánh giá sản phẩm, Chat thời gian thực).
- **Seller Center:** Kênh Quản lý dành cho Người bán (Đăng & Quản lý sản phẩm biến thể SPU/SKU, Quản lý đơn hàng, Tạo Voucher Shop, Chat với Khách hàng).
- **Admin Portal:** Cổng Quản trị hệ thống (Duyệt người bán, Trọng tài xử lý tranh chấp Refund/Dispute, Quản lý Banner & Voucher Sàn).

---

## 2. Tech Stack Phía Frontend
- **Framework & Language:** React.js (Vite / Next.js) với TypeScript.
- **Styling:** Tailwind CSS (kèm Lucide React icons, UI components linh hoạt).
- **State Management:** 
  - **Zustand:** Quản lý State toàn cục nhẹ & mượt (Auth session, Giỏ hàng Local/Redis, Socket status).
  - **React Query (@tanstack/react-query):** Cache & Fetch dữ liệu server, tự động revalidate dữ liệu API.
- **HTTP Client:** Axios (xây dựng sẵn Interceptors cho JWT Token Refresh, Error Handling).
- **Real-time & WebSockets:** Socket.io-client (kết nối Namespace `/chat` cho Chat & Notification).

---

## 3. Quy chuẩn Giao tiếp Frontend - Backend (FE - BE Protocol)

### 3.1. Source of Truth
- Mọi API endpoint, Schema và Payload BẮT BUỘC tuân thủ file `API-CONTRACT.md` tại thư mục gốc dự án.

### 3.2. Tiền tệ (Currency Standard)
- Toàn bộ giá trị tiền tệ giao tiếp qua API và hiển thị trên UI là **VND (Việt Nam Đồng)** dạng số nguyên (không có thập phân).
- Định dạng hiển thị bắt buộc: `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)`.

### 3.3. RESTful API Endpoints
- Base URL: `/api/v1`
- Auth Header: `Authorization: Bearer <access_token>`
- Status Codes chuẩn:
  - `200 OK`: Truy vấn / Cập nhật thành công.
  - `201 Created`: Tạo mới thành công (Đơn hàng, Sản phẩm, Review).
  - `400 Bad Request`: Payload không hợp lệ.
  - `401 Unauthorized`: Hết hạn JWT / Chưa đăng nhập.
  - `403 Forbidden`: Không đủ quyền (Khách hàng truy cập Admin).
  - `409 Conflict`: Xung đột dữ liệu / Hết hàng tồn kho SKU trong Flash Sale.

### 3.4. Real-time WebSockets (Socket.io)
- **Namespace:** `/chat`
- **Events kết nối:**
  - `join_room`: Đăng ký vào phòng chat giữa Khách hàng - Shop.
  - `send_message`: Gửi tin nhắn real-time (với payload message + media).
  - `receive_message`: Nhận tin nhắn mới từ phía BE.
  - `read_receipt`: Cập nhật trạng thái đã đọc tin nhắn.

---

## 4. Các Lệnh Khởi chạy & Build Cơ bản
```bash
# Cài đặt thư viện
npm install

# Chạy môi trường Development (Port 3000)
npm run dev

# Kiểm tra Linter & Type Check
npm run lint
npm run typecheck

# Build Production
npm run build

# Preview bản Build
npm run preview
```
