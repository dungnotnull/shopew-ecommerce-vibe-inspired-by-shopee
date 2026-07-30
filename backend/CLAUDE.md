# Backend Agent Context (NestJS / Node.js)

## Framework & Tools
- **Framework:** NestJS (Node.js, TypeScript)
- **Database:** Prisma ORM / PostgreSQL + Elasticsearch
- **Caching & Real-time:** Redis + Socket.io
- **Storage/Streaming:** MinIO / AWS S3 + RTMP Server

## Conventions & Architecture
1. **Flash Sale Concurrency:** When handling inventory deduction, you MUST handle race conditions. Use Redis distributed locks or PostgreSQL Row-Level Locks (`SELECT FOR UPDATE`).
2. **Transactions (ACID):** Complex operations like Checkout (Validating multiple vouchers, calculating shipping, deducting coins, locking stock, creating sub-orders) MUST be wrapped in a single Database Transaction.
3. **Financial Ledger (ShopeePay & Escrow):** Any movement of funds (Wallet top-up, Order payment, Escrow release to Seller) MUST use double-entry bookkeeping (Ledger pattern) in PostgreSQL to guarantee data integrity.
4. **Search:** Use Elasticsearch for querying products on the storefront to relieve PostgreSQL load. All product updates must sync to Elasticsearch.
5. **WebSockets:** Keep Socket.io controllers lightweight. Delegate business logic to Services.
6. **Tracking:** 
   - Log task progress in `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`.
   - Track backend issues in `ISSUES-LIST-TRACKING.md`.
