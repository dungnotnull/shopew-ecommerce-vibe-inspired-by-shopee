# Project Roadmap (100% Shopee Clone)

## Phase 1: Foundation & DB Setup
- Initialize Monorepo. Setup PostgreSQL, Redis, Elasticsearch, MinIO.
- Define DB schemas (Users, Products, Cart).

## Phase 2: Core E-Commerce & Advanced Search
- Implement Category Tree and Product Variants.
- Integrate Elasticsearch: Full-text search, Typo tolerance, Faceted Filtering.
- Setup Shopee Mall and Preferred Seller badging.

## Phase 3: Advanced Cart & Order Flow
- Cart grouping by Shop.
- Checkout flow: ACID Transactions, Inventory locking (`SELECT FOR UPDATE`).

## Phase 4: Logistics & Escrow Finance (ShopeePay)
- Implement Shopee Guarantee (Escrow).
- Setup ShopeePay Wallet (Ledger DB).
- Logistics AWB Generation and Tracking Mocks.

## Phase 5: Marketing & Vouchers Ecosystem
- 3-Tier Vouchers (Platform, Shop, Coins).
- Build Flash Sale system (Redis Concurrency).
- Marketing Center: Bundle Deals, Add-on Deals, Affiliate tracking.

## Phase 6: Social, Chat & Dispute Management
- Real-time Buyer-Seller Chat (Socket.io).
- Ratings & Reviews (Media upload).
- Return & Refund (Dispute workflow).

## Phase 7: Shopee Live & Video (Social Commerce)
- Setup RTMP / HLS streaming server.
- Integrate Shopee Live & Shopee Video feeds.

## Phase 8: Admin Portal, Dashboards & Polish
- Admin & Seller Dashboards, Performance optimization, Jest E2E Testing.
