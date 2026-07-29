# API Contract

> **SOURCE OF TRUTH:** Both Frontend and Backend agents MUST consult and update this file BEFORE making any changes to endpoints, schemas, or payloads.

## Base URL
`/api/v1`

## Authentication
### `POST /auth/login`
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "accessToken": "...", "user": { "id": 1, "role": "CUSTOMER" } }`

## Products
### `GET /products`
- **Query Params:** `page`, `limit`, `category`
- **Response:** `{ "data": [...], "total": 100 }`

*(To be expanded as development progresses)*
