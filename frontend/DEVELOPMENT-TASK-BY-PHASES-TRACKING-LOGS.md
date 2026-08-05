# Frontend Development Task & Phase Tracking (Shopew FE)

> **GHI CHÚ ĐỒNG BỘ:** File này chứa danh sách các công việc Frontend (FE) được chia nhỏ thành từng sub-task có ô tick (`- [ ]`) để dễ dàng theo dõi tiến độ công việc. Mọi task đều gắn kèm **BE Dependency** tương ứng theo `API-CONTRACT.md`.

---

## Phase 1: Setup Dự án & Xác thực Nền tảng (Auth & Core Setup)

- [x] **FE-101: Khởi tạo Project & Cấu hình Kiến trúc Cơ sở**
  - [x] Khởi tạo dự án React + TypeScript sử dụng Vite.
  - [x] Cài đặt & cấu hình Tailwind CSS, Lucide React icons.
  - [x] Tích hợp Zustand cho State Management (Auth session, App UI state).
  - [x] Cài đặt React Query (`@tanstack/react-query`) và cấu hình `QueryClient`.
  - [x] Cấu hình Axios instance tại `services/api-client.ts` kèm Request/Response Interceptors (JWT auto injection).
  - [x] Xây dựng bộ điều hướng Router chính với React Router DOM (Public Routes, Protected Routes, Role Guard).
  - *BE Dependency:* N/A

- [x] **FE-102: Xây dựng Layouts & System Design Tokens**
  - [x] Layout Khách hàng: Header Shopee (Logo, Search bar, Mini cart hover, User menu).
  - [x] Layout Khách hàng: Navbar phụ (Thông báo, Hỗ trợ, Đổi ngôn ngữ, Link Kênh Người Bán).
  - [x] Layout Khách hàng: Footer chuẩn Shopee (Chính sách, Về Shopew, Phương thức thanh toán, Đơn vị vận chuyển).
  - [x] Layout Kênh Người Bán (Seller Center Sidebar + Header).
  - [x] Layout Admin Portal (Admin Dashboard Sidebar + Topbar).
  - *BE Dependency:* N/A

- [x] **FE-103: Luồng Xác thực Người dùng (Authentication Flow)**
  - [x] Màn hình Đăng nhập (`/login`) với Email/Số điện thoại + Password.
  - [x] Màn hình Đăng ký (`/register`) có Form Validation (React Hook Form / Zod).
  - [x] Tích hợp API Đăng nhập & Đăng ký.
  - [x] Xử lý lưu trữ JWT Access Token & Refresh Token (LocalStorage / Cookie).
  - [x] Auto-login / Restore session khi người dùng mở lại trang web.
  - [x] Chức năng Đăng xuất (Clear Auth state + Redirect về Trang chủ).
  - *BE Dependency:* `POST /api/v1/auth/login`, `POST /api/v1/auth/register`

- [x] **FE-104: Quản lý Hồ sơ & Sổ địa chỉ (User Profile & Addresses)**
  - [x] Màn hình Hồ sơ cá nhân: Cập nhật Tên, Avatar, Số điện thoại, Email.
  - [x] Trang/Modal Sổ địa chỉ giao hàng (`/user/address`).
  - [x] Form Thêm/Sửa địa chỉ: Chọn Tỉnh/Thành, Quận/Huyện, Phường/Xã, Địa chỉ cụ thể, Gắn nhãn Mặc định.
  - *BE Dependency:* `GET /api/v1/user/profile`, `GET /api/v1/user/addresses`, `POST /api/v1/user/addresses`

---

## Phase 2: Khám phá Sản phẩm SPU & SKU (Core E-Commerce & PDP)

- [x] **FE-201: Cây Danh mục Sản phẩm (Category Navigation)**
  - [x] Component Danh mục trang chủ (Icon + Tên danh mục).
  - [x] Menu danh mục đa cấp (Hover xổ ra Sub-categories Level 1, Level 2).
  - [x] Component Breadcrumb điều hướng (Trang chủ > Danh mục cha > Danh mục con).
  - *BE Dependency:* `GET /api/v1/categories`

- [x] **FE-202: Trang Chi tiết Sản phẩm (PDP) - Thông tin SPU**
  - [x] Gallery Ảnh/Video sản phẩm (Slider ảnh chính, danh sách ảnh thu nhỏ thumbnail).
  - [x] Block Thông tin SPU: Tên sản phẩm, Đánh giá sao (1-5★), Số lượt đánh giá, Số lượng đã bán.
  - [x] Huy hiệu Sản phẩm: Shopee Mall (Đỏ), Shop Yêu Thích (Cam).
  - [x] Hiển thị Khoảng giá SPU (`price_min` - `price_max`) dạng tiền tệ VND.
  - [x] Nút Thích sản phẩm (Wishlist toggle) & Hiển thị số lượt thích (`likeCount`).
  - *BE Dependency:* `GET /api/v1/products/:id`

- [x] **FE-203: PDP - Bộ chọn Biến thể 2 Cấp (2-Tier SKU Selector)**
  - [x] UI Nhóm phân loại Tier 1 (Ví dụ: Mẫu mã / Màu sắc).
  - [x] UI Nhóm phân loại Tier 2 (Ví dụ: Kích thước / Dung lượng).
  - [x] Logic disable các Option không khả dụng/hết hàng dựa trên ma trận SKU.
  - [x] Logic tự động tính toán SKU khả thi khi người dùng chọn đủ 2 Tier options.
  - [x] Cập nhật tương tác UI khi chọn SKU: Cập nhật Giá VND chính xác, Tồn kho thực tế (Stock), và Ảnh thumbnail SKU.
  - [x] Xử lý sản phẩm không có phân loại (Default SKU fallback).
  - [x] Bộ chọn số lượng (Quantity selector: Nút `+`, `-`, ô nhập số, validate không vượt quá tồn kho).
  - *BE Dependency:* `GET /api/v1/products/:id` (trả về `variantGroups` và `skus`)

- [x] **FE-204: PDP - Thuộc tính động (Dynamic Attributes Spec Table)**
  - [x] Bảng Chi tiết sản phẩm: Xuất xứ, Chất liệu, Thương hiệu, Bảo hành,...
  - [x] Logic render bảng thuộc tính động từ JSONB `attributes` trả về từ API.
  - [x] Section Mô tả sản phẩm (Product Description) có định dạng văn bản chuẩn.
  - *BE Dependency:* `GET /api/v1/products/:id`

- [x] **FE-205: Kênh Người Bán - Form Đăng & Quản lý Sản phẩm**
  - [x] Form tạo mới SPU: Tên, Mô tả, Chọn danh mục.
  - [x] Cấu hình Thuộc tính động theo Danh mục được chọn.
  - [x] Đăng ký Nhóm phân loại Tier 1 & Tier 2.
  - [x] Ma trận nhập giá VND & Số lượng tồn kho (Stock) cho từng SKU con.
  - [x] Upload ảnh thumbnail cho từng SKU & Ảnh chung cho SPU.
  - *BE Dependency:* `POST /api/v1/seller/products`

---

## Phase 3: Tìm kiếm Nâng cao & Lọc đa chiều (Search & Faceted Filtering)

- [x] **FE-301: Smart Search Bar & Autocomplete**
  - [x] Ô tìm kiếm trên Header với kỹ thuật Debounce (300ms).
  - [x] Popup Gợi ý từ khóa hot & Lịch sử tìm kiếm gần đây.
  - [x] Dropdown gợi ý sản phẩm trực tiếp khi đang gõ từ khóa.
  - *BE Dependency:* `GET /api/v1/search/suggestions`

- [x] **FE-302: Thanh Sidebar Lọc Đa chiều (Faceted Filters Sidebar)**
  - [x] Lọc theo Loại Shop: Shopee Mall, Shop Yêu Thích (Checkbox).
  - [x] Lọc theo Nơi Bán: Chọn Tỉnh/Thành phố (Multiple select).
  - [x] Lọc theo Khoảng giá VND: Inputs `Từ (VND)` - `Đến (VND)` + Nút Áp dụng.
  - [x] Lọc theo Đánh giá Rating: 5 Sao, Từ 4 Sao, Từ 3 Sao...
  - [x] Lọc theo Thuộc tính động (Dynamic Facets dựa theo Category, VD: RAM 8GB, 16GB).
  - [x] Nút Xóa tất cả bộ lọc (Clear all filters).
  - *BE Dependency:* Dữ liệu `facets` từ `GET /api/v1/search`

- [x] **FE-303: Trang Kết quả Tìm kiếm & Sắp xếp (Search Result Page)**
  - [x] Thanh Sắp xếp Tab: Phổ biến, Mới nhất, Bán chạy, Giá (Thấp -> Cao / Cao -> Thấp).
  - [x] Grid hiển thị danh sách sản phẩm (Card sản phẩm: Ảnh, Mall badge, Tên, Giá VND, Lượt bán, Nơi bán).
  - [x] Chuyển trang (Pagination / Infinite Scroll).
  - [x] Đồng bộ dữ liệu Lọc + Search Query + Sort + Pagination lên URL Params (`?q=iphone&category_id=10&price_min=...`).
  - [x] Màn hình Trang trống (Empty state) khi không có kết quả phù hợp.
  - *BE Dependency:* `GET /api/v1/search`

---

## Phase 4: Giỏ hàng, Đặt hàng & Thanh toán (Cart, Order & Checkout)

- [x] **FE-401: Trang Giỏ hàng (Cart Page)**
  - [x] Hiển thị danh sách sản phẩm trong giỏ gom nhóm theo Shop (`shopId`).
  - [x] Checkbox chọn tất cả, chọn theo Shop, chọn từng SKU lẻ.
  - [x] Thay đổi số lượng SKU trực tiếp trong giỏ hàng (tự cập nhật API/Zustand).
  - [x] Xóa sản phẩm khỏi giỏ hàng (xóa lẻ hoặc xóa hàng loạt).
  - [x] Thanh tổng tiền cố định bên dưới (Sticky Bottom Bar): Tổng số lượng chọn, Tổng tiền VND, Nút "Mua Hàng".
  - *BE Dependency:* `GET /api/v1/cart`, `PUT /api/v1/cart/item`, `DELETE /api/v1/cart/item`

- [x] **FE-402: Trang Thanh toán (Checkout Page)**
  - [x] Block Địa chỉ nhận hàng (Hiển thị địa chỉ mặc định + Nút thay đổi địa chỉ).
  - [x] Danh sách đơn hàng phân tách theo từng Shop (Mỗi shop 1 bảng riêng).
  - [x] Chọn Đơn vị vận chuyển & Hiển thị phí ship giả lập (VND).
  - [x] Ô Ghi chú cho Người bán (Order note per shop).
  - [x] Chọn Phương thức thanh toán: COD, Ví ShopewPay, Chuyển khoản.
  - [x] Summary Tổng thanh toán: Tổng tiền hàng, Phí vận chuyển, Giảm giá Voucher, Tổng thanh toán cuối cùng (VND).
  - *BE Dependency:* `POST /api/v1/orders/checkout`

- [x] **FE-403: Đặt hàng & Xử lý Hàng đợi Chống bán lố (Order Concurrency UI)**
  - [x] Trigger nút "Đặt hàng" gửi payload chọn items + shippingAddress.
  - [x] Overlay/Modal Chờ xử lý hàng đợi ("Hệ thống đang kiểm tra kho hàng...").
  - [x] Xử lý phản hồi `status: PENDING_PAYMENT` & `orderGroupId`.
  - [x] Chuyển hướng sang trang Đặt hàng Thành công (`/order/success`).
  - [x] Handling lỗi hết hàng (`409 Conflict`) hiển thị thông báo dịu dàng cho người dùng.
  - *BE Dependency:* `POST /api/v1/orders/checkout`

---

## Phase 5: Mã Giảm Giá & Flash Sales (Promotions & Concurrency UI)

- [x] **FE-501: Nơi Lấy/Lưu Voucher (Voucher Collect Carousel & Section)**
  - [x] Hàng ngang Voucher Carousel tại Trang chi tiết Shop (`ShopDetailPage.tsx`) kèm nút "Lưu".
  - [x] Hàng ngang Voucher Carousel tại Trang chi tiết Sản phẩm (`ProductDetailPage.tsx`) kèm nút "Lưu".
  - [x] Mục Voucher Xtra / Mã Giảm Giá Sàn tại Trang Chủ (`HomePage.tsx`).
  - [x] Tích hợp API `POST /api/v1/vouchers/save` để lưu voucher vào ví khách hàng.

- [x] **FE-502: Áp dụng Voucher tại Checkout (Voucher Apply & Real-time Discount)**
  - [x] Popup Modal Chọn Voucher (`VoucherModal.tsx`) trên Trang Thanh Toán (`CheckoutPage.tsx`) hiển thị ví Voucher.
  - [x] Tính toán tự động số tiền giảm giá tương ứng ngay khi khách chọn/bỏ chọn voucher trước khi chốt đơn.
  - [x] Ô nhập mã voucher thủ công trực tiếp trong Modal.
  - [x] Trừ trực tiếp số tiền giảm giá vào tổng thanh toán và gửi `platformVoucherId` trong payload `POST /api/v1/orders/checkout`.
  - *BE Dependency:* `GET /api/v1/vouchers/wallet`, `POST /api/v1/vouchers/save`, `POST /api/v1/orders/checkout`

- [x] **FE-503: Trang & Widget Flash Sale**
  - [x] Block Flash Sale trang chủ với Đồng hồ Đếm ngược (Countdown Timer `HH:MM:SS`).
  - [x] Tab khung giờ Flash Sale (Ví dụ: 00:00, 09:00, 12:00, 15:00, 21:00).
  - [x] Thanh Tiến trình Tồn kho Flash Sale: "Đã bán X%", "Sắp bán hết", "Đã hết hàng".
  - [x] Badge Giảm giá Nổi bật (Ví dụ: `Giảm 50%`, `Chỉ từ 9k`).
  - *BE Dependency:* `GET /api/v1/home/flash-sale`

---

## Phase 6: Chat Real-time, Đánh giá & Khắc phục Tranh chấp (Social & Dispute)

- [ ] **FE-601: Khung Chat Real-time (Buyer - Seller Chat Widget)**
  - [ ] Floating Chat Button cố định góc dưới màn hình.
  - [ ] Khung Chat Popup: Danh sách cuộc hội thoại bên trái, Cửa sổ tin nhắn bên phải.
  - [ ] Thẻ đính kèm Sản phẩm (Product Card widget) gửi trực tiếp trong tin nhắn.
  - [ ] Upload & gửi hình ảnh trong chat.
  - [ ] Trạng thái tin nhắn: Đang gửi, Đã gửi, Đã đọc (Read receipt checkmark).
  - *BE Dependency:* WebSockets (Socket.io) namespace `/chat` (`join_room`, `send_message`, `receive_message`, `read_receipt`)

- [ ] **FE-602: Đánh giá & Nhận xét Sản phẩm (Buyer Review Submission)**
  - [ ] Màn hình Đơn hàng đã hoàn thành: Nút "Đánh giá".
  - [ ] Modal Đánh giá: Chọn số sao (1 đến 5★), Chọn nhãn gợi ý (Chất lượng sản phẩm, Giao hàng nhanh).
  - [ ] Ô nhập nhận xét chi tiết văn bản.
  - [ ] Component Upload nhiều Ảnh & Video đánh giá thực tế.
  - *BE Dependency:* `POST /api/v1/feedback/product`

- [ ] **FE-603: Yêu cầu Trả hàng / Hoàn tiền (Dispute & Refund Request)**
  - [ ] Nút "Yêu cầu Trả hàng/Hoàn tiền" tại Chi tiết Đơn hàng.
  - [ ] Form chọn lý do: Chưa nhận được hàng, Hàng bể vỡ, Hàng không đúng mô tả...
  - [ ] Upload bằng chứng hình ảnh / video mở hộp (Unboxing).
  - [ ] Trang theo dõi Tiến trình Tranh chấp (Người mua gửi -> Người bán phản hồi -> Admin Trọng tài).
  - *BE Dependency:* `POST /api/v1/orders/:id/refund`

---

## Phase 7: Dashboard Quản trị & Tối ưu hóa UI (Admin Portal & Polish)

- [ ] **FE-701: Admin Portal - Trọng tài Tranh chấp Refund**
  - [ ] Bảng danh sách đơn hàng đang khiếu nại Trả hàng/Hoàn tiền.
  - [ ] Xem chi tiết lý do, ảnh bằng chứng của Người mua và lập luận của Người bán.
  - [ ] Nút thao tác Admin: "Đồng ý Hoàn tiền cho Người mua" hoặc "Bác bỏ Yêu cầu".
  - *BE Dependency:* `GET/POST /api/v1/admin/disputes`

- [ ] **FE-702: Tối ưu UI/UX, Performance & Code Quality**
  - [ ] Cấu hình Lazy Loading & Dynamic Imports cho các Route chính (Code splitting).
  - [ ] Skeleton Loading State cho tất cả các trang khi đang fetch API.
  - [ ] Rà soát & dọn dẹp Clean Code (Loại bỏ console.log, code thừa, đảm bảo 100% comment Tiếng Việt súc tích).
  - [ ] Kiểm tra Responsive trên Mobile, Tablet & Desktop.
  - *BE Dependency:* N/A
