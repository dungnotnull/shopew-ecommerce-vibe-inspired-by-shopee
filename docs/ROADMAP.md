# Project Roadmap (Shopee Clone)

## Phase 1: Foundation & DB Setup
- Initialize Monorepo. Setup PostgreSQL, Redis, Elasticsearch.
- Define DB schemas (Users, Products, Cart).

## Phase 2: Core E-Commerce & Product Management
- Implement Category Tree and Dynamic Attributes (JSONB).
- Implement SPU & SKU Architecture (Tier Variants, Default SKU).
- Setup Shopee Mall and Preferred Seller badging.

## Phase 3: Elasticsearch & Advanced Search
- Integrate Elasticsearch: Full-text search, Typo tolerance.
- Build Faceted Filtering (Price, Rating, Category Attributes).
- Combined Search Endpoint (Search + Category + Filter + Sort).

## Phase 4: Cart, Checkout & Orders
- Cart grouping by Shop in Redis.
- Checkout flow: ACID Transactions, Inventory locking (`SELECT FOR UPDATE`).
- Shipping mock calculation.

## Phase 5: Promotions & Flash Sales
- 3-Tier Vouchers (Platform, Shop, Coins).
- Build Flash Sale system (Redis Concurrency).
- Marketing Center: Bundle Deals, Add-on Deals.

## Phase 6: Social, Chat & Dispute Management
- Real-time Buyer-Seller Chat (Socket.io).
- Ratings & Reviews (Media upload).
- Return & Refund (Dispute workflow).

## Phase 7: Admin Portal & E2E Testing
- Admin & Seller Dashboards.
- Performance optimization, Jest E2E Testing.
