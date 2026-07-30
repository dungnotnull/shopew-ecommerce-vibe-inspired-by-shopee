# General Project Convention & Architecture (Shopew)

## Project Overview
Shopew is an enterprise-grade multi-role E-Commerce platform designed as a 100% clone of Shopee.vn, handling extremely complex business logic including Multi-tier Vouchers, Flash Sales, Real-time Chat, Livestreaming, Escrow, and Advanced Search.

## Architecture & Tech Stack
- **Backend:** Node.js, TypeScript, NestJS, Prisma/TypeORM
- **Database:** PostgreSQL (Primary DB & Ledger) + Elasticsearch (Search & Filter)
- **Caching/Real-time:** Redis, Socket.io
- **Media/Streaming:** S3 / MinIO, RTMP Server (AWS IVS / Nginx-RTMP)
- **Frontend:** React.js, Tailwind CSS, zustand, React Query
- **DevOps:** Docker, Swagger, Jest

## Monorepo Structure
- `/apps/frontend`: Client Application (Customer Storefront, Seller Center, Admin Portal)
- `/apps/backend`: NestJS Backend API

## General Conventions
1. **Source of Truth:** Always refer to `API-CONTRACT.md` before making changes to endpoints, schemas, or payloads.
2. **Version Tracking:** Keep `CHANGELOG.md` updated with significant architecture or feature changes.
3. **Module Communication:** 
   - HTTP REST for standard CRUD.
   - WebSockets (Socket.io) for Chat and real-time Notifications.
   - RTMP/HLS for Shopee Live.
   - Order processing MUST use ACID transactions with row-level locks (`SELECT FOR UPDATE`) to handle Flash Sale concurrency.

## Agent Instructions
- **Read First:** You MUST read the `RULES.md` file located at the root of the project before making any code changes.
- **Frontend Agent:** Focus on UI/UX, state management (zustand), handling WebSocket connections for Chat, RTMP integration for Live, and complex forms for Seller Center.
- **Backend Agent:** Focus on performance, race conditions (Flash Sale), complex DB queries (Vouchers logic, Elasticsearch), financial Ledger (ShopeePay), and strictly follow `backend/CLAUDE.md`.
