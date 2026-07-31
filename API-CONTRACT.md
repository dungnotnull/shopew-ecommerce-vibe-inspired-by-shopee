# API Contract (Shopee Clone)

> **SOURCE OF TRUTH:** Both Frontend and Backend agents MUST consult and update this file BEFORE making any changes.
> **CURRENCY NOTE:** All prices and monetary values in this API are represented in VND (Vietnamese Dong) as integers (no decimals).

## Authentication
### `POST /api/auth/register`
- **Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A",
  "phone": "0987654321"
}
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0987654321",
    "role": "CUSTOMER",
    "isActive": true
  }
}
```

### `POST /api/auth/register-seller`
*(Request/Response schema is identical to `/api/auth/register`, but returns `role: "SELLER"`)*

### `POST /api/auth/register-admin`
*(Request/Response schema is identical to `/api/auth/register`, but returns `role: "ADMIN"`)*

### `POST /api/auth/login`
- **Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0987654321",
    "role": "CUSTOMER",
    "isActive": true
  }
}
```

### `POST /api/auth/forgot-password`
- **Request:**
```json
{
  "email": "user@example.com"
}
```
- **Response:**
```json
{
  "message": "If an account exists, a reset link has been sent.",
  "_mockResetTokenForTesting": "eyJhbGciOiJIUz..."
}
```

### `GET /api/auth/me`
- **Request:** *(Headers: `Authorization: Bearer <token>`)*
- **Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "phone": "0987654321",
  "role": "CUSTOMER",
  "isActive": true
}
```

## Search & Discovery
### `GET /api/v1/search`
- **Query:** `?q=iphone&category_id=10&price_min=10000000&rating=4&isMall=true&sort=price&order=asc&attributes={"RAM":"8GB"}`
- **Response:** 
```json
{
  "data": [
    {
      "productId": 101,
      "name": "iPhone 15 Pro 8GB",
      "price": 25000000,
      "discountPercentage": 10,
      "soldCount": 5400,
      "isMall": true,
      "isPreferred": false,
      "rating": 4.9
    }
  ],
  "facets": { 
    "brands": ["Apple", "Samsung"], 
    "locations": ["Hà Nội", "TP.HCM"],
    "dynamicAttributes": [
      { "name": "RAM", "values": ["4GB", "8GB", "12GB"] },
      { "name": "Thương hiệu", "values": ["Apple"] }
    ]
  },
  "categoryBreadcrumbs": [
    { "id": 1, "name": "Điện thoại & Phụ kiện" },
    { "id": 10, "name": "Điện thoại di động" }
  ],
  "total": 1500
}
```

## Product Details (SPU & SKU)
### `GET /api/v1/products/:id`
- **Response:**
```json
{
  "id": 101,
  "name": "Kẹp Tóc 15 Chi Tiết hellokitty",
  "priceMin": 19000,
  "priceMax": 60000,
  "discountPercentage": 14,
  "isPreferred": true,
  "rating": 4.8,
  "soldCount": 55,
  "likeCount": 20,
  "attributes": {
    "Chất liệu": "Nhựa",
    "Xuất xứ": "Trung Quốc"
  },
  "variantGroups": [
    {
      "name": "Mẫu",
      "options": ["Sét 15 Kẹp Kitty", "Sét 19 Kẹp Lợn Hồng", "Kẹp 13ct Helokity Đỏ"]
    }
  ],
  "// Note": "Nếu không có phân loại, variantGroups sẽ là rỗng [] và skus sẽ chỉ có 1 phần tử Default SKU với tierIndex là rỗng []",
  "skus": [
    {
      "id": 1001,
      "tierIndex": [0], 
      "price": 19000,
      "originalPrice": 22000,
      "stock": 150,
      "thumbnailUrl": "..."
    },
    {
      "id": 1002,
      "tierIndex": [1], 
      "price": 60000,
      "originalPrice": 65000,
      "stock": 5,
      "thumbnailUrl": "..."
    }
  ]
}
```

### `POST /api/v1/products/:id/like`
- **Request:** *(Headers: `Authorization: Bearer <token>`)*
- **Response:** `{ "liked": true }`

## Categories
### `GET /api/v1/categories`
- **Response:**
```json
[
  {
    "id": 1,
    "name": "Thời Trang Nam",
    "parentId": null,
    "attributes": { "Chất liệu": "string" },
    "children": [
      {
        "id": 11,
        "name": "Áo Thun",
        "parentId": 1,
        "attributes": { "Chất liệu": "string", "Kiểu cổ": "string" },
        "children": []
      }
    ]
  }
]
```

## Cart & Checkout
### `GET /api/v1/cart`
- **Response:** 
```json
{
  "shops": [
    {
      "shopId": 1,
      "shopName": "Shopee Official",
      "isMall": true,
      "items": [
        { "productId": 101, "variantId": 201, "quantity": 2, "price": 25000000 }
      ]
    }
  ]
}
```

## Seller Portal
### `GET /api/seller/dashboard`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Response:**
```json
{
  "shopName": "Nguyen Van A Shop",
  "revenueThisMonth": 125400000,
  "newOrders": 48,
  "totalSPUs": 124,
  "shopRating": 4.9,
  "todo": {
    "pendingConfirmation": 12,
    "pendingPickup": 5,
    "returnRequests": 2,
    "lockedProducts": 0
  }
}
```

### `POST /api/seller/products`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Body:**
```json
{
  "categoryId": 11,
  "name": "Áo Thun Nam Cổ Tròn",
  "description": "Áo thun 100% cotton",
  "priceMin": 150000,
  "priceMax": 150000,
  "discountPercentage": 10,
  "stock": 100,
  "skuCode": "SPU-AO-THUN",
  "attributes": { "Chất liệu": "Cotton" },
  "variantGroups": [
    { "name": "Màu sắc", "options": ["Đen", "Trắng"] },
    { "name": "Kích cỡ", "options": ["M", "L"] }
  ],
  "skus": [
    { "price": 150000, "originalPrice": 200000, "stock": 50, "tierIndex": [0, 0], "skuCode": "SKU-DEN-M" }
  ]
}
```
- **Response:** SPU and SKU details (similar to `GET /api/v1/products/:id`)

### `PUT /api/seller/products/:id`
*(Updates SPU & SKUs)*

### `DELETE /api/seller/products/:id`
*(Deletes SPU)*

## Shops
### `POST /api/v1/shops`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Body:** `{ "name": "My Awesome Shop", "description": "Best shop ever" }`
- **Response:** `{ "id": 1, "userId": 2, "name": "My Awesome Shop" }`

### `GET /api/v1/shops/me`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Response:** Shop profile.

### `PUT /api/v1/shops/me`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Body:** `{ "name": "Updated Shop Name" }`

## Admin Portal
### `GET /api/admin/dashboard`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Response:**
```json
{
  "totalUsers": 12850,
  "totalShops": 845,
  "activeDisputes": 3,
  "totalGMV": 4520000000
}
```

### `POST /api/v1/orders/checkout`
- **Request:**
```json
{
  "cartItems": [ { "variantId": 201, "quantity": 2 } ],
  "shippingAddressId": 5,
  "platformVoucherId": 99,
  "shopVouchers": [ { "shopId": 1, "voucherId": 45 } ],
  "useCoins": 5000
}
```
- **Response:** `{ "orderGroupId": "GRP-12345", "status": "PENDING_PAYMENT" }`

## Social (WebSockets)
- **Namespace:** `/chat`
- **Events:** `join_room`, `send_message`, `receive_message`, `read_receipt`

## Ratings & Reviews
### `POST /api/v1/feedback/product` (Buyer Feedback)
- **Request:** `{ "orderItemId": 123, "rating": 5, "comment": "Great!", "mediaUrls": ["/img/1.jpg"] }`
- **Response:** `{ "success": true }`

*(To be expanded)*
