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

- [ ] **Database Schema Update (Cart & Order):**
  - [ ] Update `schema.prisma` to add `CartItem` model (Relations to `User`, `Shop`, `Product`, `SKU`).
  - [ ] Update `schema.prisma` to add `Order` and `OrderItem` models.
  - [ ] Run `npx prisma db push` to sync schema.

- [ ] **Cart Management (`src/cart`):**
  - [ ] Generate module/controller/service (`nest g res cart`).
  - [ ] `POST /api/v1/cart`: Add to cart / Update quantity.
    - [ ] Check if `variantId` exists in `SKU` table.
    - [ ] Check if `quantity` <= `SKU.stock`.
    - [ ] Upsert record in `CartItem`.
  - [ ] `GET /api/v1/cart`: Fetch cart grouped by `shopId`.
    - [ ] Fetch all `CartItem` for `req.user.id` including `Shop`, `Product`, `SKU` relations.
    - [ ] Map response to group by `shopId` matching `API-CONTRACT.md`.

- [ ] **Checkout (The Core Transaction - `src/orders`):**
  - [ ] Generate module/controller/service (`nest g res orders`).
  - [ ] **Redis Queue Integration (Anti-Overselling):**
    - [ ] Configure `BullModule` (BullMQ) in `AppModule`.
    - [ ] Create `checkout` queue and a Consumer/Worker class.
  - [ ] `POST /api/v1/orders/checkout`: API entrypoint.
    - [ ] Validate `shippingAddressId` belongs to user (check `Address` model).
    - [ ] Dispatch checkout payload to `checkout` queue and return `PENDING_PAYMENT`.
  - [ ] **Worker Process (`CheckoutProcessor`):**
    - [ ] Begin Prisma Transaction (`prisma.$transaction`).
    - [ ] Execute `SELECT ... FOR UPDATE` via `$queryRaw` to lock inventory rows in `SKU` table.
    - [ ] Validate `stock >= quantity` for all selected SKUs. If not, rollback transaction.
    - [ ] Split Master Order into multiple Sub-Orders per `shopId`.
    - [ ] Deduct inventory: Update `SKU.stock` and `Product.soldCount`.
    - [ ] Remove processed items from `CartItem`.
    - [ ] Commit Transaction.


## Phase 5: Promotions & Flash Sales

- [ ] **Database Schema Update (Promotions):**
  - [ ] Add `Voucher` model to `schema.prisma`.
  - [ ] Add `FlashSaleSession` and `FlashSaleItem` models to `schema.prisma` (Relation to `Product`, `SKU`).
  - [ ] Run `npx prisma db push`.

- [ ] **Vouchers (`src/vouchers`):**
  - [ ] Define `Voucher` schema.
  - [ ] Update Checkout Transaction (`CheckoutProcessor`) to validate `platformVoucherId` and `shopVouchers`.
  - [ ] Calculate total discount and update `Voucher.usedCount`.

- [ ] **Flash Sales (High Concurrency - `src/flash-sales`):**
  - [ ] `GET /api/v1/home/flash-sale`: Fetch active `FlashSaleItem`, return with `stock`, `soldCount` and `discountPercentage`.
  - [ ] **Redis Operations:**
    - [ ] Sync Flash Sale `promotionalStock` to Redis memory on session start.
    - [ ] Implement Redis Distributed Lock (Redlock) or use atomic `DECRBY` to handle high-volume stock deduction.
    - [ ] Reject checkout request immediately if Redis stock < 0.
  - [ ] Async sync from Redis to PostgreSQL for Flash Sale orders (using BullMQ).
  

## Phase 6: Social, Chat & Dispute
- [ ] **Ratings & Reviews:**
  - [ ] `POST /api/v1/feedback/product`: Buyer rate Product/Shop for completed orders.
- [ ] **Real-time Chat:**
  - [ ] Setup Socket.io Gateway.
  - [ ] Build 1-to-1 Room joining and Message broadcasting between Buyer and Seller.
