# Shopew - Project Details (100% Shopee Clone)

## Overview
Shopew is a fullstack, enterprise-grade multi-role E-Commerce platform replicating the complete Shopee ecosystem. It encompasses complex product discovery, social commerce (livestreaming), multi-tier marketing systems, escrow payments, and deep logistics integration.

## Tech Stack
- **Backend:** Node.js, TypeScript, NestJS, Prisma ORM / TypeORM
- **Frontend:** React.js, Tailwind CSS, zustand, React Query
- **Database:** PostgreSQL (Ledger & Primary DB) + Elasticsearch (Search & Filter)
- **Cache & Real-time:** Redis (caching, session), Socket.io (Chat & Notifications)
- **Media & Streaming:** AWS S3 / MinIO (Media), Nginx-RTMP / AWS IVS (Livestream/Video)
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

### 4. Advanced Discovery & Search Engine (Level: Khó)
- **Deep Category Tree:** Multi-level categories with dynamic attributes (e.g., Electronics -> RAM).
- **Smart Search (Elasticsearch):** Typo tolerance, autocomplete, trending keywords, syncing Postgres to ES.
- **Faceted Filtering:** Filter by location, price, rating, shipping options.

### 5. Flash Sales, Finance & Escrow (Level: Rất Khó)
- **Flash Sales:** Time-slotted, extremely high-concurrency handling using Redis distributed locks and DB row-locks to prevent overselling.
- **ShopeePay & Wallet:** Double-entry Ledger DB system for E-wallet deposit/withdraw and PIN protection.
- **Escrow System:** Holding funds centrally and executing complex payouts to Sellers upon order completion.

### 6. Social Commerce & Interactive (Level: Cực Khó)
- **Buyer-Seller Chat:** Real-time bi-directional chat using WebSockets (Socket.io) with read receipts and offline queues.
- **Shopee Live & Video:** Setting up RTMP servers, broadcasting livestream video, and integrating real-time product pins during streams.
