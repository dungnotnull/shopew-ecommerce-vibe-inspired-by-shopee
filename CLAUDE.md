# General Project Convention & Architecture (Shopew)

## Project Overview
Shopew is an enterprise-grade multi-role E-Commerce platform (inspired by Shopee) supporting multiple roles (Customer/Buyer, Seller, Admin).

## Architecture & Tech Stack
- **Backend:** Node.js, TypeScript, NestJS, Prisma ORM / TypeORM
- **Database:** PostgreSQL / MySQL
- **Caching/Session:** Redis (Local Docker for transient carts)
- **Frontend:** React.js / Vue.js, Tailwind CSS, Redux Toolkit / Pinia, React Query
- **DevOps & Tooling:** Docker, Docker Compose, Swagger (API Docs), Jest
- **Communication:** RESTful APIs (JWT HTTP) documented in `API-CONTRACT.md`

## Monorepo Structure
- `/apps/frontend`: Client Application (Customer Storefront, Seller Center, Admin Portal)
- `/apps/backend`: NestJS Backend API
*(Note: Documentation and task tracking may exist at the root or within specific `backend/` folders as defined in previous configurations)*

## General Conventions
1. **Source of Truth:** Always refer to `API-CONTRACT.md` before making changes to endpoints, schemas, or payloads.
2. **Version Tracking:** Keep `CHANGELOG.md` updated with any significant changes to ensure the context state is accurate.
3. **Module Communication:** 
   - Frontend and Backend communicate strictly via the defined APIs.
   - Redis is used for hybrid cart management (transient sessions) automatically reconciled and synced with the database upon authentication.
   - Order processing MUST use ACID transactions.

## Agent Instructions
- **Frontend Agent:** Focus on UI/UX, state management (Redux/Pinia, React Query), and integrating with APIs defined in `API-CONTRACT.md`.
- **Backend Agent:** When working in `/apps/backend` or `/backend`, refer to the backend-specific `CLAUDE.md` for framework contexts and conventions. Always track tasks in `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` and issues in `ISSUES-LIST-TRACKING.md`.
