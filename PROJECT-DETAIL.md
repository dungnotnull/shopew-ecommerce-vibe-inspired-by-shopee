# Shopew - Project Details

## Overview
Shopew is a fullstack, enterprise-grade multi-role E-Commerce platform inspired by Shopee, engineered to handle complex product variant matrices, real-time inventory tracking, and ACID-compliant order fulfillment.

## Tech Stack
- **Backend:** Node.js, TypeScript, NestJS, Prisma ORM / TypeORM
- **Frontend:** React.js / Vue.js, Tailwind CSS, Redux Toolkit / Pinia, React Query
- **Database:** PostgreSQL / MySQL (primary relational DB)
- **Cache:** Redis (caching, session management, transient carts)
- **DevOps & Tooling:** Docker, Docker Compose, Swagger (API Docs), Jest

## Core Features
- **Multi-Role Access Control (RBAC):** Strict role segregation and middleware authorization across distinct user tiers (Customer/Buyer, Seller, Admin).
- **Complex SKU & Variant Architecture:** Supports multi-dimensional product variations (Color, Size, Material, Custom Attributes) with individual pricing, SKU codes, images, and localized inventory tracking.
- **Hybrid Cart Synchronization:** Ultra-fast transient cart storage using Redis sessions, automatically reconciled and synced with persistent database storage upon user authentication.
- **ACID Database Order Transactions:** Guarantees zero overselling and data integrity during checkout by executing stock availability checks, inventory deduction, and order/order-item creation within atomic transaction blocks.

## System Architecture
The backend follows a modular, clean architecture separating domain entities, business use cases, and infrastructure adapters:
- Frontend Client (Storefront, Seller Center, Admin Portal) -> NestJS API Gateway & Guards (JWT, RBAC) -> Modules (Auth, Product, Order) -> Redis / PostgreSQL.

## Order Processing Execution Flow
1. Buyer Initiates Checkout
2. RBAC Guard & Token Verification
3. Redis/DB Cart Retrieval
4. Begin DB Transaction
5. Lock & Deduct SKU Stock
6. Create Order & Line-Items Records
7. Commit Transaction
8. Clear Cart & Emit Real-Time Order Event
