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

### 2.1. Role Seller (Product Management)
- [x] **Shop Profile:** API to manage Shop profiles (create, update, view).
- [x] **CRUD Products (SPU & SKU Architecture):**
  - [x] `POST /api/seller/products`: Create SPU, Variant Groups (e.g., "Màu sắc", "Kích thước"), and SKUs (price, stock, tierIndex).
  - [x] Logic: Auto-generation of a "Default SKU" if SPU is created without variant groups.
  - [x] `GET /api/seller/products`: List all products belonging to the seller.
  - [x] `PUT /api/seller/products/:id`: Update SPU & SKUs.
  - [x] `DELETE /api/seller/products/:id`: Delete SPU and its SKUs.
  - [x] Setup `isMall`, `isPreferred` flags for the shop's products.

### 2.2. Role Customer (Discovery & Shopping)
- [x] **Categories Master Data:**
  - [x] Define Nested Set or Adjacency List schema for Category Tree.
  - [x] `GET /api/v1/categories`: Fetch Category Tree (for Home & Search pages).
- [ ] **Home Page APIs:**
  - [ ] `GET /api/v1/home/banners`: Fetch active promotional banners for the slider.
  - [ ] `GET /api/v1/home/flash-sale`: Fetch active flash sale items with countdown and progress bar data.
  - [ ] `GET /api/v1/home/daily-discover`: Fetch paginated "Gợi ý hôm nay" products.
- [ ] **Search & Filter API (Catalog):**
  - [ ] `GET /api/v1/products/search`: Search products by keyword (`q`).
  - [ ] Implement filtering by `category_id`, `price_min`, `price_max`, `rating`, `isMall`, `isPreferred`.
  - [ ] Implement sorting by `relevance`, `sold`, `newest`, `price` (asc/desc).
  - [ ] *Note: Each product card response must contain necessary fields mapped to FE (`name`, `priceMin`, `priceMax`, `discountPercentage`, `rating`, `soldCount`, `likeCount`, `thumbnailUrl`, `isMall`, `isPreferred`).*
- [x] **Product Details & Interactive:**
  - [x] `GET /api/v1/products/:id`: Fetch full SPU details, variant groups, SKUs, and Shop info.
  - [x] `POST /api/v1/products/:id/like`: Toggle Wishlist (Like/Unlike) product.

### 2.3. Role Admin (View Only)
- [ ] **Dashboard:**
  - [ ] `GET /api/admin/dashboard`: View overall statistics (Total Users, Total Shops, Active Disputes, Total GMV).
- [ ] **Data Viewing:**
  - [ ] `GET /api/admin/users`: View user list.
  - [ ] `GET /api/admin/shops`: View shop list.
  - [ ] `GET /api/admin/products`: View all products across platform.

## Phase 3: Advanced Search (Elasticsearch) *[Optional / Future]*
- [ ] Sync PostgreSQL `Product` data to Elasticsearch index.
- [ ] Setup Full-text search with Typo tolerance in `/api/v1/products/search`.
- [ ] Implement Faceted Filters (Dynamic Attributes depending on Category).

## Phase 4: Cart, Checkout & Orders
- [ ] **Cart Management:**
  - [ ] `GET /api/v1/cart`: Fetch cart grouped by `shopId`.
  - [ ] `POST /api/v1/cart`: Add to cart / Update quantity.
- [ ] **Checkout (The Core Transaction):**
  - [ ] `POST /api/v1/orders/checkout`: Process checkout.
  - [ ] Validate stock for all selected SKUs.
  - [ ] Begin PostgreSQL Transaction (`BEGIN`), execute `SELECT ... FOR UPDATE` to lock inventory rows.
  - [ ] Split Master Order into multiple Sub-Orders per `shopId`.
  - [ ] Deduct inventory, update `soldCount`, Commit Transaction.

## Phase 5: Promotions & Flash Sales
- [ ] **Vouchers:**
  - [ ] Define `Voucher` schema.
  - [ ] Update Checkout Transaction to validate Platform + Shop vouchers.
- [ ] **Flash Sales (High Concurrency):**
  - [ ] Implement Redis Distributed Lock (Redlock) to handle high-volume stock deduction.
  - [ ] Async sync from Redis to PostgreSQL for Flash Sale orders.

## Phase 6: Social, Chat & Dispute
- [ ] **Ratings & Reviews:**
  - [ ] `POST /api/v1/feedback/product`: Buyer rate Product/Shop for completed orders.
- [ ] **Real-time Chat:**
  - [ ] Setup Socket.io Gateway.
  - [ ] Build 1-to-1 Room joining and Message broadcasting between Buyer and Seller.
