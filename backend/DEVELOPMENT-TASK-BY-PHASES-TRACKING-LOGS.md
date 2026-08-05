# Backend Development Task & Phase Tracking

## Phase 1: Database & Core Setup
- [x] Initialize NestJS project (Nest CLI).
- [x] Setup Docker Compose for PostgreSQL, Redis, Elasticsearch.
- [x] Configure TypeORM/Prisma with NestJS.
- [x] Setup Swagger UI for API Documentation.
- [x] Implement Global Exception Filter and Response Interceptor.
- [x] **Auth & Users:**
  - [x] Define `User`, `Role`, `Address` entities.
  - [x] Implement JWT Authentication strategy.
  - [x] Create `@Roles()` decorator and `RolesGuard`.
  - [x] Build `/auth/register` and `/auth/login` endpoints.
  - [x] Build `/auth/me` endpoint for profile/role fetching.
  - [x] Auto-create Default Shop for Seller upon registration.

## Phase 2: Core E-Commerce API (Role-based)

### 2.1. Role Admin (System & Management)
- [x] **Categories Management:**
  - [x] Define Nested Set or Adjacency List schema for Category Tree.
  - [x] `POST /api/v1/categories`: API tạo category mới.
  - [x] `GET /api/v1/categories`: API lấy danh sách Category Tree.
  - [x] `GET /api/v1/categories/:id`: API tìm chi tiết category theo ID.
  - [x] `PUT /api/v1/categories/:id`: API sửa thông tin category.
  - [x] `DELETE /api/v1/categories/:id`: API xóa category.
- [x] **Dashboard & Data Viewing:**
  - [x] `GET /api/v1/admin/dashboard`: View overall statistics (Total Users, Total Shops, Active Disputes, Total GMV).
  - [x] `POST /api/v1/admin/users`: API tạo mới user (tùy chọn role).
  - [x] `GET /api/v1/admin/users`: View user list.
  - [x] `GET /api/v1/admin/shops`: View shop list.
  - [x] `GET /api/v1/admin/products`: View all products across platform.
- [x] **Banners Management:**
  - [x] `GET /api/v1/admin/banners`: API lấy danh sách banners cho Admin.
  - [x] `POST /api/v1/admin/banners`: API tạo mới banner.
  - [x] `PUT /api/v1/admin/banners/:id`: API cập nhật banner.
  - [x] `DELETE /api/v1/admin/banners/:id`: API xóa banner.

### 2.2. Product Management (Role Seller)
- [x] **Shop Profile:** API to manage Shop profiles (create, update, view).
- [x] **CRUD Products (SPU & SKU Architecture):**
  - [x] `POST /api/seller/products`: API tạo SPU, Variant Groups và SKUs.
  - [x] Logic: Auto-generation of a "Default SKU" if SPU is created without variant groups.
  - [x] `GET /api/seller/products`: API danh sách products của seller.
  - [x] `GET /api/seller/products/:id`: API tìm chi tiết product cho seller để sửa.
  - [x] `PUT /api/seller/products/:id`: API sửa SPU & SKUs.
  - [x] `DELETE /api/seller/products/:id`: API xóa SPU and SKUs.
  - [x] Setup `isMall`, `isPreferred` flags for the shop's products.
  - [x] Thêm Upload API (`POST /api/v1/upload`) và trường `images` cho SPU.

### 2.3. Discovery & Shopping (Role Customer)
- [x] **Home Page & Flash Sale APIs:**
  - [x] `GET /api/v1/home/banners`: Fetch active promotional banners cho slider.
  - [x] `GET /api/v1/home/flash-sale`: API lấy danh sách flash sale items với countdown và progress.
  - [x] `GET /api/v1/home/daily-discover`: Fetch paginated "Gợi ý hôm nay" products.
- [x] **Search & Filter API (Catalog):**
  - [x] `GET /api/v1/products`: API get products (danh sách chung, có pagination).
  - [x] `GET /api/v1/products/search`: API tìm kiếm products bằng từ khóa (`q`).
  - [x] `GET /api/v1/products/filter`: API filter products theo category, price, rating, isMall, v.v. (Có thể thiết kế gộp chung query params vào API search/list).
  - [x] Implement sorting by `relevance`, `sold`, `newest`, `price` (asc/desc).
  - [x] *Note: Each product card response must contain necessary fields mapped to FE.*
- [x] **Product Details & Interactive:**
  - [x] `GET /api/v1/products/:id`: API get product detail (full SPU, SKU, Variant Groups, Shop info).
  - [x] `POST /api/v1/products/:id/like`: Toggle Wishlist (Like/Unlike) product.



## Phase 3: Advanced Search (Elasticsearch) *[Optional / Future  - IMPORTANT ! SKIP THIS PHARSE FOR NOW]*
- [ ] Sync PostgreSQL `Product` data to Elasticsearch index.
- [ ] Setup Full-text search with Typo tolerance in `/api/v1/products/search`.
- [ ] Implement Faceted Filters (Dynamic Attributes depending on Category).


## Phase 4: Cart, Checkout & Orders

- [x] **Database Schema Update (Cart & Order):**
  - [x] Update `schema.prisma` to add `CartItem` model (Relations to `User`, `Shop`, `Product`, `SKU`).
  - [x] Update `schema.prisma` to add `Order` and `OrderItem` models.
  - [x] Run `npx prisma db push` to sync schema.

- [x] **Cart Management (`src/cart`):**
  - [x] Generate module/controller/service (`nest g res cart`).
  - [x] `POST /api/v1/cart`: Add to cart (Cộng dồn số lượng).
    - [x] Check if `variantId` exists in `SKU` table.
    - [x] Check if `newQuantity` <= `SKU.stock`.
    - [x] Upsert record in `CartItem` (Increment logic).
  - [x] `PUT /api/v1/cart/:variantId`: Cập nhật chính xác số lượng sản phẩm trong giỏ.
  - [x] `DELETE /api/v1/cart/:variantId`: Xóa sản phẩm khỏi giỏ hàng.
  - [x] `GET /api/v1/cart`: Fetch cart grouped by `shopId`.
    - [x] Fetch all `CartItem` for `req.user.id` including `Shop`, `Product`, `SKU` relations.
    - [x] Map response to group by `shopId` matching `API-CONTRACT.md`.

- [x] **Checkout (The Core Transaction - `src/orders`):**
  - [x] Generate module/controller/service (`nest g res orders`).
  - [x] **Redis Queue Integration (Anti-Overselling):**
    - [x] Configure `BullModule` (BullMQ) in `AppModule`.
    - [x] Create `checkout` queue and a Consumer/Worker class.
  - [x] `POST /api/v1/orders/checkout`: API entrypoint.
    - [x] Validate `shippingAddressId` belongs to user. Throws error if no address exists (Removed mock creation).
    - [x] Dispatch checkout payload to `checkout` queue and return `PENDING_PAYMENT`.
  - [x] **Worker Process (`CheckoutProcessor`):**
    - [x] Begin Prisma Transaction (`prisma.$transaction`).
    - [x] Execute `SELECT ... FOR UPDATE` via `$queryRaw` to lock inventory rows in `SKU` table.
    - [x] Validate `stock >= quantity` for all selected SKUs. If not, rollback transaction.
    - [x] Split Master Order into multiple Sub-Orders per `shopId`.
    - [x] Deduct inventory: Update `SKU.stock` and `Product.soldCount`.
    - [x] Remove processed items from `CartItem`.
    - [x] Commit Transaction.

- [x] **User Addresses Management (`src/users/addresses`):**
  - [x] Thêm trường `receiverName` và `receiverPhone` vào bảng Address.
  - [x] `POST /api/v1/users/addresses`: Thêm địa chỉ mới.
  - [x] `PUT /api/v1/users/addresses/:id`: Cập nhật địa chỉ.
  - [x] `DELETE /api/v1/users/addresses/:id`: Xóa địa chỉ.
  - [x] `GET /api/v1/users/addresses`: Lấy danh sách địa chỉ.

- [x] **Order Management & Payment (Customer):**
  - [x] `POST /api/v1/orders/:id/pay`: Mock API thanh toán (Chuyển trạng thái từ PENDING_PAYMENT sang PROCESSING).
  - [x] `POST /api/v1/orders/:id/rebuy`: API Mua lại đơn hàng (Tự động quét sản phẩm đơn cũ vào giỏ hàng).
  - [x] `GET /api/v1/orders`: Lịch sử đơn hàng của User.
  - [x] `GET /api/v1/orders/:id`: Chi tiết đơn hàng.
  - [x] `PUT /api/v1/orders/:id/cancel`: Hủy đơn hàng.

- [x] **Order Management (Seller):**
  - [x] `GET /api/v1/seller/orders`: Danh sách đơn đặt hàng của Shop.
  - [x] `PUT /api/v1/seller/orders/:id/status`: Cập nhật trạng thái đơn hàng (PROCESSING -> SHIPPED -> DELIVERED).


## Phase 5: Promotions & Flash Sales

- [x] **Database Schema Update (Promotions):**
  - [x] Add `Voucher` model to `schema.prisma`.
  - [x] Add `FlashSaleSession` and `FlashSaleItem` models to `schema.prisma` (Relation to `Product`, `SKU`).
  - [x] Run `npx prisma db push`.

- [x] **Vouchers (`src/vouchers`):**
  - [x] Define `Voucher` schema.
  - [x] `POST /api/v1/admin/vouchers`: Admin tạo voucher hệ thống.
  - [x] `GET /api/v1/admin/vouchers`: Admin lấy danh sách voucher hệ thống.
  - [x] `PUT /api/v1/admin/vouchers/:id`: Admin cập nhật voucher.
  - [x] `DELETE /api/v1/admin/vouchers/:id`: Admin xóa voucher.
  - [x] `POST /api/v1/seller/vouchers`: Seller tạo voucher cho Shop.
  - [x] `GET /api/v1/seller/vouchers`: Seller lấy danh sách voucher của Shop.
  - [x] `PUT /api/v1/seller/vouchers/:id`: Seller cập nhật voucher.
  - [x] `DELETE /api/v1/seller/vouchers/:id`: Seller xóa voucher.
  - [x] `POST /api/v1/vouchers/save`: User lưu voucher vào ví.
  - [x] `GET /api/v1/vouchers/wallet`: User lấy danh sách voucher khả dụng.
  - [x] Update Checkout Transaction (`CheckoutProcessor`) to validate `platformVoucherId` and `shopVouchers`, deduct voucher usage, and calculate final totalAmount.

- [x] **Flash Sales (High Concurrency - `src/flash-sales`):**
  - [x] `GET /api/v1/home/flash-sale`: Fetch active `FlashSaleItem`, return with `stock`, `soldCount` and `discountPercentage`.
  - [x] `POST /api/v1/admin/flash-sales`: Admin tạo khung giờ (Session) Flash Sale.
  - [x] `GET /api/v1/admin/flash-sales`: Admin xem danh sách Session.
  - [x] `PUT /api/v1/admin/flash-sales/:id`: Admin cập nhật Session.
  - [x] `DELETE /api/v1/admin/flash-sales/:id`: Admin xóa Session.
  - [x] `GET /api/v1/seller/flash-sales/sessions`: Seller lấy danh sách Session khả dụng để đăng ký.
  - [x] `GET /api/v1/seller/flash-sales/:sessionId/items`: Seller xem danh sách sản phẩm đã đăng ký.
  - [x] `POST /api/v1/seller/flash-sales/register`: Seller đăng ký sản phẩm tham gia.
  - [x] Update Checkout Transaction (`CheckoutProcessor`) to handle Flash Sale logic (validate if SKU in active flash sale, apply flash sale price instead of normal price).
  - [x] **Redis Operations:**
    - [x] Sync Flash Sale `promotionalStock` to Redis memory on session start.
    - [x] Implement Redis Distributed Lock (Redlock) or use atomic `DECRBY` to handle high-volume stock deduction.
    - [x] Reject checkout request immediately if Redis stock < 0.
  - [x] Async sync from Redis to PostgreSQL for Flash Sale orders (using BullMQ).
  

## Phase 6: Social, Chat & Dispute
- [ ] **Ratings & Reviews:**
  - [ ] `POST /api/v1/feedback/product`: Buyer rate Product/Shop for completed orders.
- [ ] **Real-time Chat:**
  - [ ] Setup Socket.io Gateway.
  - [ ] Build 1-to-1 Room joining and Message broadcasting between Buyer and Seller.
