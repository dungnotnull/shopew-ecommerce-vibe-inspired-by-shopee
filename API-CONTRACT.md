# API Contract (Shopee Clone)

> **SOURCE OF TRUTH:** Both Frontend and Backend agents MUST consult and update this file BEFORE making any changes.

## Search & Discovery
### `GET /api/v1/search`
- **Query:** `?q=iphone&category_id=10&price_min=100&rating=4&sort=relevance`
- **Response:** `{ "data": [...], "facets": { "brands": [...], "locations": [...] }, "total": 1500 }`

## Cart & Checkout
### `GET /api/v1/cart`
- **Response:** 
```json
{
  "shops": [
    {
      "shopId": 1,
      "shopName": "Shopee Official",
      "items": [
        { "productId": 101, "variantId": 201, "quantity": 2, "price": 150000 }
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

## ShopeePay (Wallet)
### `POST /api/v1/wallet/topup`
- **Request:** `{ "amount": 500000, "source": "BANK_TRANSFER" }`
- **Response:** `{ "transactionId": "TXN-001", "newBalance": 500000 }`

## Social (WebSockets)
- **Namespace:** `/chat`
- **Events:** `join_room`, `send_message`, `receive_message`, `read_receipt`

*(To be expanded)*
