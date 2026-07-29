# Backend Development Task & Phase Tracking

## Phase 1: Database & Core Setup
- [ ] Initialize NestJS project (Nest CLI).
- [ ] Setup Docker Compose for PostgreSQL, Redis, Elasticsearch, MinIO.
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
  - [ ] Build API to fetch Category Tree structure.
- [ ] **Products & Variants:**
  - [ ] Define `Product`, `ProductVariant` (Tier variations like Color/Size), `ProductImage` entities.
  - [ ] Build CRUD APIs for Seller to manage Products.
- [ ] **Shop Profiles:**
  - [ ] Define `Shop` entity and relation to `User` (Seller).
  - [ ] Build API to apply/approve Shopee Mall/Preferred Seller status.

## Phase 3: Elasticsearch & Advanced Search
- [ ] Install `@nestjs/elasticsearch` module.
- [ ] Write Sync Job (Cron or Event-driven) to sync PostgreSQL `Product` data to Elasticsearch index.
- [ ] Implement Search Endpoint (`GET /search`):
  - [ ] Setup Full-text search with Typo tolerance.
  - [ ] Implement Faceted Filters (Price range, Location, Rating).
  - [ ] Implement Sorting logic (Relevance, Price, Date).

## Phase 4: Cart, Checkout & Orders
- [ ] **Cart Management:**
  - [ ] Implement Redis-backed temporary Cart.
  - [ ] Group Cart items by `shopId` when returning to Frontend.
- [ ] **Shipping Mock:**
  - [ ] Create Service to calculate shipping fee based on User Address and Shop Address.
- [ ] **Checkout (The Core Transaction):**
  - [ ] Validate stock for all selected variants.
  - [ ] Begin PostgreSQL Transaction (`BEGIN`).
  - [ ] Execute `SELECT ... FOR UPDATE` to lock inventory rows.
  - [ ] Split Master Order into multiple Sub-Orders per `shopId`.
  - [ ] Deduct inventory, calculate totals.
  - [ ] Commit Transaction (`COMMIT`).

## Phase 5: Finance (ShopeePay) & Escrow
- [ ] **Ledger System (ShopeePay):**
  - [ ] Define immutable `LedgerTransaction` and `AccountBalance` entities.
  - [ ] Build Wallet Top-up API (Credit user account).
- [ ] **Order Payment & Escrow:**
  - [ ] Implement logic to deduct from ShopeePay during Checkout.
  - [ ] Move funds to Platform Escrow account.
  - [ ] Build webhook/cron to release Escrow funds to Seller's Wallet when Order is marked "Completed".

## Phase 6: Promotions & Flash Sales
- [ ] **Vouchers:**
  - [ ] Define `Voucher` schema (Type, MinSpend, DiscountRate, MaxCap, Stock).
  - [ ] Update Checkout Transaction to validate and consume Platform + Shop vouchers.
- [ ] **Flash Sales (High Concurrency):**
  - [ ] Create Flash Sale time-slot management API.
  - [ ] Implement Redis Distributed Lock (Redlock) or Lua Scripts to handle high-volume stock deduction instantly.
  - [ ] Async sync from Redis to PostgreSQL for Flash Sale orders.

## Phase 7: Social, Chat & Dispute
- [ ] **Ratings & Reviews:**
  - [ ] Integrate AWS S3 / MinIO SDK for Media upload.
  - [ ] Build API for users to rate and upload images for completed orders.
- [ ] **Dispute System:**
  - [ ] Build Return/Refund request API for Buyers.
  - [ ] Build Accept/Reject workflow for Sellers.
  - [ ] Build Admin Mediation endpoints.
- [ ] **Real-time Chat:**
  - [ ] Setup Socket.io Gateway.
  - [ ] Handle Authentication within WebSocket connection.
  - [ ] Build 1-to-1 Room joining and Message broadcasting.
  - [ ] Persist chat messages to DB.

## Phase 8: Livestreaming & Polish
- [ ] **Shopee Live:**
  - [ ] Research and integrate RTMP URL generation for Sellers.
  - [ ] Build API to fetch active Live Sessions for Homepage.
- [ ] **E2E Testing:**
  - [ ] Write Jest E2E tests for Checkout Transaction.
  - [ ] Write Jest E2E tests for Ledger integrity.
