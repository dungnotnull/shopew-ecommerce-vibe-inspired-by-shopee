# Backend Development Task & Phase Tracking

## Phase 1: Database & Core Setup
- [ ] Initialize NestJS project (Nest CLI).
- [ ] Setup Docker Compose for PostgreSQL, Redis, Elasticsearch.
- [ ] Configure TypeORM/Prisma with NestJS.
- [ ] Setup Swagger UI for API Documentation.
- [ ] Implement Global Exception Filter and Response Interceptor.
- [ ] **Auth & Users:**
  - [ ] Define `User`, `Role`, `Address` entities.
  - [ ] Implement JWT Authentication strategy.
  - [ ] Create `@Roles()` decorator and `RolesGuard`.
  - [ ] Build `/auth/register` and `/auth/login` endpoints.

## Phase 2: Core E-Commerce & Product Management
- [ ] **Categories:**
  - [ ] Define Nested Set or Adjacency List schema for Category Tree.
  - [ ] Define Dynamic Attributes schema (JSONB or EAV pattern) linked to Categories.
  - [ ] Build API to fetch Category Tree, including sub-categories and their dynamic attributes.
- [ ] **Products (SPU & SKU Architecture):**
  - [ ] Define `Product` (SPU) entity for shared attributes: Name, Description, CategoryId, ViewCount, LikeCount, and `attributes` (JSONB for dynamic category specs).
  - [ ] Define `ProductVariantGroup` (e.g., "Màu sắc", "Kích thước") and `ProductVariantOption` (e.g., "Đỏ", "Xanh").
  - [ ] Define `SKU` entity holding specific combination data: `price`, `promotional_price`, `stock`, `sku_code`, `thumbnail_image_id`.
  - [ ] **Logic:** Implement Auto-generation of a "Default SKU" if the SPU is created without any variant groups.
  - [ ] Add Product metrics & flags to SPU: `isMall`, `isPreferred`, `soldCount`, `discountPercentage`.
  - [ ] Build CRUD APIs for Seller to manage SPU and multi-tier SKUs.
  - [ ] Build User interactions API: Like/Unlike product (Wishlist).
- [ ] **Shop Profiles:**
  - [ ] Define `Shop` entity and relation to `User` (Seller).
  - [ ] Build API to manage Shop profiles.

## Phase 3: Elasticsearch & Advanced Search
- [ ] Install `@nestjs/elasticsearch` module.
- [ ] Write Sync Job (Cron or Event-driven) to sync PostgreSQL `Product` data to Elasticsearch index.
- [ ] Implement Search Endpoint (`GET /search`):
  - [ ] Setup Full-text search with Typo tolerance.
  - [ ] Implement Faceted Filters (Price range, Location, Rating, Mall/Yêu Thích, Dynamic Attributes depending on Category).
  - [ ] Implement Sorting logic (Relevance, Price, Date, Sales).
  - [ ] Ensure API supports querying by (Search term + Category ID + Filters + Sorting) simultaneously in 1 request.

## Phase 4: Cart, Checkout & Orders
- [ ] **Cart Management:**
  - [ ] Implement Redis-backed temporary Cart.
  - [ ] Group Cart items by `shopId` when returning to Frontend.
- [ ] **Shipping Mock:**
  - [ ] Create Service to calculate shipping fee based on User Address and Shop Address.
- [ ] **Checkout (The Core Transaction):**
  - [ ] Implement Redis Message Queue (e.g., BullMQ) for processing incoming orders to handle extreme concurrency (multiple users buying the last item).
  - [ ] Queue Consumer pulls order, validates stock for all selected variants.
  - [ ] Begin PostgreSQL Transaction (`BEGIN`).
  - [ ] Execute `SELECT ... FOR UPDATE` to lock inventory rows.
  - [ ] Split Master Order into multiple Sub-Orders per `shopId`.
  - [ ] Deduct inventory, calculate totals.
  - [ ] Update `soldCount` for purchased products.
  - [ ] Commit Transaction (`COMMIT`).

## Phase 5: Promotions & Flash Sales
- [ ] **Vouchers:**
  - [ ] Define `Voucher` schema (Type, MinSpend, DiscountRate, MaxCap, Stock).
  - [ ] Update Checkout Transaction to validate and consume Platform + Shop vouchers.
- [ ] **Flash Sales (High Concurrency):**
  - [ ] Create Flash Sale time-slot management API.
  - [ ] Implement Redis Distributed Lock (Redlock) to handle high-volume stock deduction.
  - [ ] Async sync from Redis to PostgreSQL for Flash Sale orders.

## Phase 6: Social, Chat & Dispute
- [ ] **Ratings & Reviews (Buyer Feedback):**
  - [ ] Integrate local docker storage for Media upload.
  - [ ] Build API for Buyer to rate Product/Shop (upload images/videos) for completed orders.
- [ ] **Dispute System:**
  - [ ] Build Return/Refund request API for Buyers.
  - [ ] Build Accept/Reject workflow for Sellers.
  - [ ] Build Admin Mediation endpoints.
- [ ] **Real-time Chat:**
  - [ ] Setup Socket.io Gateway.
  - [ ] Handle Authentication within WebSocket connection.
  - [ ] Build 1-to-1 Room joining and Message broadcasting.
  - [ ] Persist chat messages to DB.

## Phase 7: Polish & Testing
- [ ] **E2E Testing:**
  - [ ] Write Jest E2E tests for Checkout Transaction.
  - [ ] Admin approval endpoints for Seller payouts.
