# Project Roadmap

## Phase 1: Foundation & Setup
- Initialize Monorepo (apps/frontend, apps/backend).
- Setup Database (PostgreSQL/MySQL) and Redis locally via Docker Compose.
- Configure NestJS, Prisma/TypeORM, and Swagger.
- Define Database schemas (Users, Roles, Products, Variants, Cart, Orders).
- Establish API Contract (`API-CONTRACT.md`).

## Phase 2: Core Backend Services & Auth
- Implement JWT Authentication and RBAC (Admin, Seller, Customer).
- Develop Product Management APIs (CRUD, Categories, Complex SKU Variants).
- Implement Hybrid Cart logic with Redis.

## Phase 3: Frontend Integration & Order Flow
- Build Frontend UI components (React/Vue, Tailwind).
- Integrate Auth, State Management (Redux/Pinia, React Query) and Product browsing.
- Implement Cart UI and sync with Backend.
- Develop the Order placement flow with ACID Database Transactions.

## Phase 4: Refinement & Admin Dashboard
- Build Seller and Admin portals.
- Implement Order tracking and status updates.
- Setup Jest E2E tests, Performance optimization and bug fixing.
