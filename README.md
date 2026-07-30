# 🛒🛍️ Shopew: Shopee-Inspired Multi-Role E-Commerce Vibing Platform

[![NestJS](https://img.shields.io/badge/Backend-NestJS-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Vue-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20MySQL-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A fullstack, enterprise-grade multi-role E-Commerce platform inspired by Shopee, engineered with **NestJS, PostgreSQL/MySQL, Redis, and React/Vue** to handle complex product variant matrices, real-time inventory tracking, and ACID-compliant order fulfillment.

---

## 📸 Key Features

- **🔐 Multi-Role Access Control (RBAC)** — Strict role segregation and middleware authorization across 4 distinct user tiers:
  - **Customer / Buyer**: Browse products, manage cart, place orders, track order lifecycle.
  - **Seller**: Manage shop profile, CRUD products & complex SKU variants, track shop orders.
  - **Admin**: System-wide platform metrics, user management, seller audits, category management.
- **🎨 Complex SKU & Variant Architecture** — Supports multi-dimensional product variations (Color, Size, Material, Custom Attributes) with individual pricing, SKU codes, images, and localized inventory tracking.
- **🛒 Hybrid Cart Synchronization** — Ultra-fast transient cart storage using Redis sessions, automatically reconciled and synced with persistent database storage upon user authentication.
- **⚡ ACID Database Order Transactions** — Guarantees zero overselling and data integrity during checkout by executing stock availability checks, inventory deduction, and order/order-item creation within atomic transaction blocks.
- **🐳 Containerized Environment** — Fully pre-configured `docker-compose` setup for seamless local development with PostgreSQL, Redis, and API services.

---

## 🏗️ System Architecture & Execution Flow

The backend follows a modular, clean architecture separating domain entities, business use cases, and infrastructure adapters.

```text
┌─────────────────────────────────────────────────────────────────┐
│                 Frontend Client (React / Vue)                   │
│      (Customer Storefront / Seller Center / Admin Portal)       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / REST / JWT
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS API Gateway & Guards                  │
│             (JWT Authentication & RBAC Middleware)              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Auth   │                 │ Product │                 │  Order  │
│ Module  │                 │ Module  │                 │ Module  │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Redis Session   │       │ PostgreSQL       │       │ ACID Transaction │
│ (Transient Cart) │       │ (Products/SKUs)  │       │ (Stock Audit/Pmt)│
└──────────────────┘       └──────────────────┘       └──────────────────┘
```
---

## 🧱 Order Processing Execution Flow
```
Buyer Initiates Checkout
  ➡️ RBAC Guard & Token Verification
  ➡️ Redis/DB Cart Retrieval
  ➡️ Begin DB Transaction
  ➡️ Lock & Deduct SKU Stock
  ➡️ Create Order & Line-Items Records
  ➡️ Commit Transaction
  ➡️ Clear Cart & Emit Real-Time Order Event
```

## 🛠️ Tech Stack
```
Backend: "Node.js, TypeScript, NestJS, Prisma ORM / TypeORM"
Frontend: "React.js / Vue.js, Tailwind CSS, Redux Toolkit / Pinia, React Query"
Database: PostgreSQL / MySQL (primary relational DB)
Cache: Session,"Redis (caching, session management, transient carts)"
DevOps & Tooling: "Docker, Docker Compose, Swagger (API Docs), Jest"
```

## 📂 Sample Project Structure
```
shopew/
├── apps/
│   ├── backend/                    # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/        # Feature Modules (Auth, Products, Orders, Cart)
│   │   │   ├── common/         # Guards, Interceptors, Filters, Decorators
│   │   │   └── database/       # Migrations, Seeds, ORM Configuration
│   │   └── test/               # E2E Test Suites
│   └── frontend/                    # React / Vue Frontend Application
│       ├── src/
│       │   ├── components/     # Reusable UI Components
│       │   ├── pages/          # Route Views (Storefront, Dashboard)
│       │   ├── services/       # API Clients & State Management
│       │   └── hooks/          # Custom React/Vue Hooks
├── docker-compose.yml          # Local Infrastructure (Postgres, Redis)
└── README.md

```
