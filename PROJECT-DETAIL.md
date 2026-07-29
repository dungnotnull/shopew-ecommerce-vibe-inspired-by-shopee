# Shopew - Chi tiết Dự án (100% Shopee Clone)

## Tổng quan
Shopew là một nền tảng Thương mại điện tử đa vai trò, toàn diện cấp doanh nghiệp, sao chép lại toàn bộ hệ sinh thái Shopee. Nền tảng này bao gồm hệ thống khám phá sản phẩm phức tạp, thương mại xã hội (livestreaming), hệ thống tiếp thị đa tầng, thanh toán trung gian (escrow), và tích hợp sâu về logistics.

## Công nghệ sử dụng
- **Backend:** Node.js, TypeScript, NestJS, Prisma ORM / TypeORM
- **Frontend:** React.js, Tailwind CSS, zustand, React Query
- **Database (Cơ sở dữ liệu):** PostgreSQL (Sổ cái & DB chính) + Elasticsearch (Tìm kiếm & Lọc)
- **Cache & Real-time:** Redis (caching, session, hàng đợi queue), Socket.io (Chat & Thông báo)
- **Media & Streaming:** docker local
- **DevOps & Tooling:** Docker, Docker Compose, Swagger, Jest

## Các tính năng cốt lõi (Sắp xếp theo độ khó thực hiện: Dễ đến Khó)

### 1. Phân quyền đa vai trò & Thương mại điện tử cơ bản (Mức độ: Dễ)
- **Phân quyền (RBAC):** Xác thực Khách hàng/Người mua, Người bán, Quản trị viên qua JWT.
- **Quản lý sản phẩm:** 
  - Áp dụng triệt để kiến trúc SPU & SKU (Xem chi tiết ở phần *Phân tích Kiến trúc* bên dưới).
  - Hỗ trợ Huy hiệu (Badges): Shopee Mall, Shop Yêu Thích.
  - Quản lý chỉ số: Số lượng đã bán, Số lượt thích.
  - Khuyến mãi cơ bản: Cấu hình phần trăm giảm giá.
  - **Tiền tệ:** Toàn bộ giá cả trên hệ thống được lưu và hiển thị theo đơn vị tiền tệ **VND (Việt Nam Đồng)**.

---

## Phân tích Kiến trúc Chuyên sâu: Product SPU & SKU
Để đáp ứng các biến thể phức tạp (ví dụ: Màu sắc + Kích thước) như trang thật, hệ thống áp dụng chuẩn **SPU (Standard Product Unit)** và **SKU (Stock Keeping Unit)**:

1. **SPU (Sản phẩm gốc):**
   - Đại diện cho mặt hàng tổng thể (Ví dụ: "Kẹp Tóc 15 Chi Tiết hellokitty").
   - Lưu trữ các thuộc tính dùng chung: Tên, Mô tả, ID Danh mục, Đánh giá, Số lượng bán, Số lượt thích.
   - Lưu trữ khoảng giá tính bằng VND (`price_min`, `price_max`) được tính toán tự động từ các SKU con.

2. **Nhóm Phân loại & Tùy chọn (Variant Groups & Options):**
   - Hỗ trợ tối đa 2 cấp (Tier 1, Tier 2). Ví dụ Tier 1 là "Mẫu mã" (Option: Kẹp Kitty, Lợn Hồng), Tier 2 là "Kích cỡ" (Lớn, Nhỏ).
   - Nếu Sản phẩm không có biến thể, hệ thống sẽ tự sinh 1 SKU mặc định (Default SKU) ẩn dưới nền.

3. **SKU (Đơn vị lưu kho - Biến thể cụ thể):**
   - Là tổ hợp của các Tùy chọn (Ví dụ: "Kẹp Kitty" + "Lớn").
   - Sở hữu **Tồn kho (Stock) Độc lập:** Khi khách hàng Mua/Thêm vào giỏ, hệ thống phải trừ tồn kho của chính xác SKU này.
   - Sở hữu **Giá (Price) Độc lập:** Cùng 1 SPU nhưng giá bán (VND) của các SKU có thể khác nhau.
   - Sở hữu **Ảnh Thumbnail Độc lập:** Khi chọn phân loại, UI tự đổi ảnh tương ứng.

4. **Thuộc tính động / Thông số kỹ thuật (Dynamic Attributes):**
   - Thuộc tính của sản phẩm thay đổi hoàn toàn phụ thuộc vào Danh mục. Ví dụ: "Laptop" cần có RAM, CPU; "Quần áo" cần Chất liệu; "Sách" cần Tác giả.
   - Các thuộc tính chung này được gắn vào **SPU**.
   - **Lưu trữ Database:** Sử dụng kiểu dữ liệu **JSONB** trong PostgreSQL (hoặc mô hình EAV) để lưu trữ linh hoạt các cặp `key: value` không giới hạn. Lượng dữ liệu này sẽ được đồng bộ sang Elasticsearch để phục vụ Lọc (Faceted Filtering).

### 2. Giỏ hàng Nâng cao & Thanh toán (Mức độ: Trung bình)
- **Giỏ hàng:** Nhóm sản phẩm theo Shop (`shopId`) trong local storage/Redis.
- **Luồng Thanh toán (Checkout):** 
  - Tính tổng tiền (VND), tính phí vận chuyển giả lập theo khoảng cách/cân nặng.
  - **Hàng đợi Redis (Redis Queue):** Áp dụng Message Queue (như BullMQ) để đẩy các yêu cầu đặt hàng vào hàng đợi xử lý tuần tự. Điều này giải quyết triệt để bài toán **Nhiều người cùng bấm mua 1 sản phẩm cuối cùng trong kho**, đảm bảo hệ thống không bao giờ bị bán lố (oversell) và chỉ người nhanh nhất mới mua thành công.
- **Đánh giá & Nhận xét:** Tải lên văn bản và hình ảnh/video đánh giá qua docker local.

### 3. Hệ sinh thái Voucher & Marketing (Mức độ: Trung bình - Khó)
- **Voucher 3 Tầng:** Xác thực Voucher Sàn, Voucher Shop, và Shopee Xu (Logic kiếm & tiêu xu).
- **Khuyến mãi Nâng cao:** Combo Khuyến mãi (Mua 2 giảm 10%), Mua kèm Deal sốc.
- **Vận hành & Tranh chấp:** Máy trạng thái (State machines) cho Trạng thái Đơn hàng, Sinh mã Vận đơn (AWB), và luồng Trả hàng/Hoàn tiền (Người mua -> Người bán -> Admin).

### 4. Hệ thống Khám phá & Tìm kiếm Nâng cao (Categories, Search, Filters)
- **Cây danh mục đa tầng (Deep Category Tree):**
  - Hệ thống danh mục phân cấp sâu (Root -> Level 1 -> Level 2...).
  - Trang danh mục riêng biệt hiển thị sub-category và sản phẩm.
  - Hỗ trợ Breadcrumbs rõ ràng (ví dụ: `Trang chủ > Điện thoại > Apple`).
- **Lọc đa chiều - Thanh Sidebar (Faceted Filtering):**
  - Lọc theo Loại Shop: Shopee Mall, Shop Yêu Thích.
  - Lọc theo Nơi Bán: Tỉnh thành. Hỗ trợ chọn nhiều.
  - Lọc theo Giá: Nhập `Khoảng giá (Từ - Đến) (VND)`.
  - Lọc theo Đánh giá: Từ 1 sao đến 5 sao.
  - Lọc theo Thuộc tính động: Tự động hiển thị bộ lọc dựa trên Danh mục (ví dụ: RAM, Thương hiệu).
- **Tìm kiếm thông minh & Sắp xếp:**
  - Gợi ý tìm kiếm (Autocomplete).
  - Tab Sắp xếp: Phổ biến, Mới nhất, Bán chạy, Giá.
  - **QUAN TRỌNG:** Phải hỗ trợ kết hợp đồng thời Tìm kiếm + Danh mục + Bộ lọc + Sắp xếp trong cùng 1 Request URL.

### 5. Flash Sales, Tài chính & Thanh toán Đảm bảo (Mức độ: Rất Khó)
- **Flash Sales:** Chạy theo khung giờ, xử lý lượng truy cập cực lớn bằng cách sử dụng khóa phân tán Redis (Distributed locks) và khóa hàng trong DB để chống bán lố (Overselling).

### 6. Thương mại Xã hội & Tương tác (Mức độ: Cực Khó)
- **Chat Người Mua - Người Bán:** Chat hai chiều theo thời gian thực sử dụng WebSockets (Socket.io) với trạng thái đã đọc và hàng đợi khi offline.
