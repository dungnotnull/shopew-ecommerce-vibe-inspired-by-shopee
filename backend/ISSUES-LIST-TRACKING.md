# Backend Issues List & Tracking

| Issue ID | Description | Status | Priority | Notes |
|----------|-------------|--------|----------|-------|
| BE-001   | Define initial DB schemas including Vouchers & Flash Sales | Open | High | Needs alignment with API-CONTRACT.md |
| BE-002   | Setup Elasticsearch indexing pipeline & Deep Categories | Open | Medium | Required before Product API completion |
| BE-003   | Design robust Concurrency Control for Checkout | Open | High | Prevent overselling during Flash Sale |
| BE-004   | Design Ledger Schema for ShopeePay Wallet | Open | High | Essential for Escrow payment flow |
| BE-005   | Setup RTMP Server for Shopee Live Integration | Open | Medium | Dependent on infrastructure capabilities |
| BE-006   | Fix "Wrong password still logs in" (Frontend was mocking, BE updated contract & returned user object) | Closed | High | Modified `auth.service.ts` to return `user` object and updated `API-CONTRACT.md` |

*(Add new issues here as they arise)*
