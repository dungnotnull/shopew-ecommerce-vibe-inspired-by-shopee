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
- **Product Management:** CRUD operations for basic products.
- **Shopee Mall & Preferred Seller:** Simple Boolean flags or Badging system on Shop profiles.

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

