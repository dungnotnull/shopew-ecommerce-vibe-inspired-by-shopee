# Backend Agent Context (NestJS / Node.js)

## Framework & Tools
- **Framework:** NestJS (Node.js, TypeScript)
- **Database ORM:** Prisma ORM / TypeORM
- **Database:** PostgreSQL / MySQL
- **Caching:** Redis (Session management, transient carts)
- **Tooling:** Docker, Swagger (API Docs), Jest

## Conventions & Architecture
1. **Architecture:** Follow NestJS modular, clean architecture separating domain entities, business use cases, and infrastructure adapters (Modules, Controllers, Services, Guards, Interceptors).
2. **Transactions (ACID):** All critical operations (like Order creation, Stock availability checks, and Inventory deduction) MUST be wrapped in an atomic database transaction to prevent overselling.
3. **RBAC:** Apply role guards on endpoints appropriately (Customer, Seller, Admin).
4. **API Updates:** If you change an endpoint payload or response, YOU MUST update `../API-CONTRACT.md` before committing the change.
5. **Tracking:** 
   - Log task progress in `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`.
   - Track and update backend issues in `ISSUES-LIST-TRACKING.md`.
