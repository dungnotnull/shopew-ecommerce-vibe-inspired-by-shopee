# Shopew - Project Details (100% Shopee Clone)

## Overview
Shopew is a fullstack, enterprise-grade multi-role E-Commerce platform replicating the complete Shopee ecosystem. It encompasses complex product discovery, social commerce (livestreaming), multi-tier marketing systems, escrow payments, and deep logistics integration.

## Tech Stack
- **Backend:** Node.js, TypeScript, NestJS, Prisma ORM / TypeORM
- **Frontend:** React.js, Tailwind CSS, zustand, React Query
- **Database:** PostgreSQL (Ledger & Primary DB) + Elasticsearch (Search & Filter)
- **Cache & Real-time:** Redis (caching, session), Socket.io (Chat & Notifications)
- **Media & Streaming:** docker local
- **DevOps & Tooling:** Docker, Docker Compose, Swagger, Jest

## Core Features (Ordered by Implementation Difficulty: Easiest to Hardest)

### 1. Multi-Role RBAC & Basic E-Commerce (Level: Dễ)
- **Multi-Role RBAC:** Customer/Buyer, Seller, Admin authentication via JWT.
- **Product Management:** 
  - Áp dụng triệt để kiến trúc SPU & SKU (Xem chi tiết ở phần *Architecture Deep Dive* bên dưới).
  - Hỗ trợ Badges: Shopee Mall, Shop Yêu Thích.
  - Quản lý chỉ số: Số lượng đã bán (Sold count), Đã thích (Like count).
  - Khuyến mãi cơ bản: Cấu hình phần trăm giảm giá (Discount %).

---

## Architecture Deep Dive: Product SPU & SKU
Để đáp ứng các biến thể phức tạp (ví dụ: Màu sắc + Kích thước) như trang thật, hệ thống áp dụng chuẩn **SPU (Standard Product Unit)** và **SKU (Stock Keeping Unit)**:

1. **SPU (Sản phẩm gốc):**
   - Đại diện cho mặt hàng tổng thể (Ví dụ: "Kẹp Tóc 15 Chi Tiết hellokitty").
   - Lưu trữ các thuộc tính dùng chung: `name`, `description`, `category_id`, `rating`, `sold_count`, `like_count`.
   - Lưu trữ khoảng giá (`price_min`, `price_max`) được tính toán tự động từ các SKU con.

2. **Variant Groups & Options (Nhóm Phân Loại):**
   - Hỗ trợ tối đa 2 cấp (Tier 1, Tier 2). Ví dụ Tier 1 là "Mẫu mã" (Option: Kẹp Kitty, Lợn Hồng), Tier 2 là "Kích cỡ" (Lớn, Nhỏ).
   - Nếu Sản phẩm không có biến thể, hệ thống sẽ tự sinh 1 SKU mặc định (Default SKU) ẩn dưới nền.

3. **SKU (Đơn vị lưu kho - Biến thể cụ thể):**
   - Là tổ hợp của các Options (Ví dụ: "Kẹp Kitty" + "Lớn").
   - Sở hữu **Tồn kho (Stock) Độc lập:** Khi khách hàng Mua/Thêm vào giỏ, hệ thống phải trừ tồn kho của chính xác SKU này để tránh oversell.
   - Sở hữu **Giá (Price) Độc lập:** Cùng 1 SPU nhưng SKU "Lợn Hồng" có thể đắt hơn "Kẹp Kitty".
   - Sở hữu **Ảnh Thumbnail Độc lập:** Khi chọn phân loại, UI tự đổi ảnh tương ứng.

4. **Dynamic Attributes (Thuộc tính động / Thông số kỹ thuật):**
   - Thuộc tính của sản phẩm thay đổi hoàn toàn phụ thuộc vào Danh mục (Category). Ví dụ: "Laptop" cần có RAM, CPU; "Quần áo" cần Chất liệu, Phong cách; "Sách" cần Tác giả, NXB.
   - Các thuộc tính chung này được gắn vào **SPU**.
   - **Lưu trữ Database:** Sử dụng kiểu dữ liệu **JSONB** trong PostgreSQL (hoặc mô hình EAV) để lưu trữ linh hoạt các cặp `key: value` không giới hạn mà không cần phải liên tục tạo thêm cột mới trong Database. Lượng dữ liệu này sẽ được đồng bộ sang Elasticsearch để phục vụ Lọc (Faceted Filtering).

### 2. Advanced Cart & Checkout (Level: Trung bình)
- **Advanced Cart:** Items grouped by Shop (`shopId`) in local storage/Redis.
- **Checkout Flow:** Calculating total prices, Mocking shipping fees based on distance/weight.
- **Ratings & Reviews:** Uploading review text and images/videos via S3/MinIO.

### 3. Vouchers & Marketing Center (Level: Trung bình - Khó)
- **3-Tier Vouchers:** Validating Platform Vouchers, Shop Vouchers, and Shopee Coins (Earn & Spend logic).
- **Advanced Deals:** Bundle Deals (Mua 2 giảm 10%), Add-on Deals (Mua kèm deal sốc).
- **Logistics AWB & Dispute:** State machines for Order Status, AWB Generation, and Return/Refund workflows (Buyer -> Seller -> Admin).

### 4. Advanced Discovery & Search Engine (Categories, Search, Filters)
- **Deep Category Tree (Cây danh mục đa tầng):**
  - Hệ thống danh mục phân cấp sâu (Root -> Level 1 -> Level 2...).
  - Trang danh mục riêng biệt: Khi click vào một danh mục, Frontend cần hiển thị các sub-category tương ứng, và danh sách sản phẩm thuộc danh mục đó.
  - Hỗ trợ Breadcrumbs rõ ràng (ví dụ: `Trang chủ > Điện thoại & Phụ kiện > Điện thoại di động > Apple`).
- **Faceted Filtering (Lọc đa chiều - Thanh Sidebar):**
  - Cần xây dựng thanh lọc (Filter Sidebar) bên trái màn hình Desktop hoặc Popup Filter trên Mobile.
  - **Lọc theo Loại Shop:** Shopee Mall, Shop Yêu Thích.
  - **Lọc theo Nơi Bán:** Tỉnh thành (Hà Nội, TP.HCM...). Hỗ trợ checkbox chọn nhiều.
  - **Lọc theo Giá:** Input `Khoảng giá (Từ - Đến)` và nút Áp dụng.
  - **Lọc theo Đánh giá:** Từ 1 sao đến 5 sao (lọc các sản phẩm lớn hơn hoặc bằng số sao đã chọn).
  - **Lọc theo Thuộc tính động:** Tùy thuộc vào danh mục đang xem (ví dụ xem "Điện thoại", Filter sẽ tự hiển thị thêm lọc theo "Thương hiệu", "RAM").
- **Smart Search & Sorting (Tìm kiếm & Sắp xếp):**
  - Giao diện ô tìm kiếm trên Header hỗ trợ gợi ý (autocomplete).
  - Thanh Sorting (Tab Sắp xếp): Phổ biến, Mới nhất, Bán chạy, Giá (Thấp đến Cao, Cao đến Thấp).
  - **QUAN TRỌNG:** Phải hỗ trợ kết hợp đồng thời cả Search (từ khóa) + Categories (id danh mục) + Filters (nhiều điều kiện) + Sorting (sắp xếp) trong cùng 1 Request URL.

### 5. Flash Sales, Finance & Escrow (Level: Rất Khó)
- **Flash Sales:** Time-slotted, extremely high-concurrency handling using Redis distributed locks and DB row-locks to prevent overselling.


### 6. Social Commerce & Interactive (Level: Cực Khó)
- **Buyer-Seller Chat:** Real-time bi-directional chat using WebSockets (Socket.io) with read receipts and offline queues.

