# API Contract (Shopee Clone)

> **SOURCE OF TRUTH:** Both Frontend and Backend agents MUST consult and update this file BEFORE making any changes.

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

*(To be expanded)*
