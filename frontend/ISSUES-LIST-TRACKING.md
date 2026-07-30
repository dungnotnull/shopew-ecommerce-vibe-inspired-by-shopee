# Frontend Issues & Bug Tracking Log (Shopew FE)

Bảng dưới đây dùng để theo dõi các lỗi (issues/bugs) phát sinh trong quá trình phát triển Frontend và phối hợp tích hợp với Backend.

| Issue ID | Ngày tạo | Mức độ ưu tiên | Mô tả lỗi | Màn hình / Component bị lỗi | Trạng thái | Người xử lý | Cách giải quyết |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FE-ISSUE-001 | 2026-07-30 | High | Chọn biến thể 2 cấp (Màu sắc + Kích thước) nhưng giá không tự động cập nhật theo SKU tương ứng. | Trang Chi tiết Sản phẩm (`PDP/SKUSelector.tsx`) | In Progress | FE | Sửa lại logic map `tierIndex` khớp với mảng `skus` trả về từ API `GET /api/v1/products/:id`. |
| FE-ISSUE-002 | 2026-07-30 | Medium | Giỏ hàng không tự nhóm sản phẩm theo `shopId` khi lưu dữ liệu tạm ở Zustand local state. | Trang Giỏ hàng (`Cart/CartShopGroup.tsx`) | Open | FE/BE | BE kiểm tra lại API `GET /api/v1/cart`, FE cập nhật hàm `groupByShopId` trong Zustand Store. |
| FE-ISSUE-003 | 2026-07-30 | High | Nhấn Đặt hàng trong Flash Sale bị mất Voucher Sàn đã chọn khi API trả về lỗi 409 Conflict. | Trang Thanh toán (`Checkout/VoucherModal.tsx`) | Open | FE | Xử lý Catch error status 409, giữ nguyên state Voucher và thông báo "Rất tiếc, sản phẩm Flash Sale đã hết hàng". |

*(Bổ sung các Issue mới phát sinh vào các dòng bên dưới)*
