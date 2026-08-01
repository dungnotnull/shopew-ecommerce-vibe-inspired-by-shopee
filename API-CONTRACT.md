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

## Home (Discovery)
### `GET /api/v1/home/banners`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Siêu Sale Thời Trang",
      "imageUrl": "https://images.unsplash.com/...",
      "linkUrl": "/search?category_id=1",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### `GET /api/v1/home/flash-sale`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "Kẹp Tóc 15 Chi Tiết",
      "priceMin": 19000,
      "priceMax": 60000,
      "discountPercentage": 14,
      "soldCount": 55,
      "stock": 150,
      "thumbnailUrl": "..."
    }
  ]
}
```

### `GET /api/v1/home/daily-discover`
- **Query:** `?page=1&limit=20`
- **Response:** Paginated products (similar to search results)

## Search & Filter
### `GET /api/v1/products`
*(Alias for `/api/v1/products/search`)*

### `GET /api/v1/products/search`
- **Query:** `?q=iphone&category_id=10&price_min=10000000&price_max=20000000&rating=4&isMall=true&isPreferred=true&sort=price&order=asc&page=1&limit=20`
- **Response:** 
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "iPhone 15 Pro 8GB",
      "priceMin": 25000000,
      "priceMax": 25000000,
      "discountPercentage": 10,
      "rating": 4.9,
      "soldCount": 5400,
      "likeCount": 120,
      "isMall": true,
      "isPreferred": false,
      "thumbnailUrl": "...",
      "shopId": 1,
      "shopName": "Apple Official Store"
    }
  ],
  "total": 1500,
  "page": 1,
  "limit": 20,
  "totalPages": 75
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
  "promotionalPrice": 15000,
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
      "discountPercentage": 14,
      "isDiscount": true,
      "stock": 150,
      "thumbnailUrl": "..."
    },
    {
      "id": 1002,
      "tierIndex": [1], 
      "price": 60000,
      "originalPrice": 65000,
      "discountPercentage": 8,
      "isDiscount": true,
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

### `GET /api/v1/categories/:id`
- **Response:** *(Similar to single item in category tree)*

### `POST /api/v1/categories`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Body:** `{ "name": "Category Name", "parentId": 1, "attributes": {} }`

### `PUT /api/v1/categories/:id`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Body:** `{ "name": "Updated Name", "parentId": 1, "attributes": {} }`

### `DELETE /api/v1/categories/:id`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Response:** `{ "success": true }`

## Admin
### `GET /api/v1/admin/dashboard`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Response:**
```json
{
  "totalUsers": 150,
  "totalShops": 20,
  "totalProducts": 500,
  "totalGMV": 0,
  "activeDisputes": 0
}
```

### `GET /api/v1/admin/users`
- **Query:** `?page=1&limit=20`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Response:** Paginated list of users.

### `GET /api/v1/admin/shops`
- **Query:** `?page=1&limit=20`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Response:** Paginated list of shops.

### `GET /api/v1/admin/products`
- **Query:** `?page=1&limit=20`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires ADMIN role*
- **Response:** Paginated list of all products.

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

## Uploads
### `POST /api/v1/upload`
- **Request:** `multipart/form-data` with field `file` (image).
- **Response:**
```json
{
  "url": "/uploads/1700000000000-123456789.jpg"
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

### `GET /api/seller/products`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Response:** Array of SPU and SKU details (similar to `GET /api/v1/products/:id`)

### `GET /api/seller/products/:id`
- **Request:** *(Headers: `Authorization: Bearer <token>`)* - *Requires SELLER role*
- **Response:** Single SPU and SKU details for the seller.

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
  "promotionalPrice": 135000,
  "stock": 100,
  "skuCode": "SPU-AO-THUN",
  "attributes": { "Chất liệu": "Cotton" },
  "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
  "variantGroups": [
    { "name": "Màu sắc", "options": ["Đen", "Trắng"] },
    { "name": "Kích cỡ", "options": ["M", "L"] }
  ],
  "skus": [
    { "price": 150000, "originalPrice": 200000, "discountPercentage": 10, "isDiscount": true, "stock": 50, "tierIndex": [0, 0], "skuCode": "SKU-DEN-M" }
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
