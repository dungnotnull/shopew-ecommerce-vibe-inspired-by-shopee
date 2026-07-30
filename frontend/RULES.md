# Frontend Code Standards & Guidelines (Shopew FE)

Tài liệu này quy định các quy chuẩn code và nguyên tắc vận hành BẮT BUỘC dành riêng cho phía Frontend của dự án **Shopew**. Tất cả thành viên team FE và các AI Assistant khi can thiệp vào codebase FE đều phải tuân thủ nghiêm ngặt.

---

## 🛑 NGUYÊN TẮC TỐI THƯỢNG (SUPREME RULES)

> [!CAUTION]
> **1. PHẠM VI THAO TÁC THƯ MỤC:**
> Tuyệt đối CHỈ thực hiện tạo mới, chỉnh sửa và can thiệp vào các file nằm trong thư mục `frontend/` (hoặc `/apps/frontend`). KHÔNG ĐƯỢC CHỈNH SỬA HOẶC XÓA BẤT KỲ FILE NÀO NẰM NGOÀI THƯ MỤC NÀY (như `backend/`, `docs/`, `API-CONTRACT.md`,...).

> [!WARNING]
> **2. GIỮ CODE SẠCH SẼ (CLEAN CODE - NO CODE RÁC):**
> - KHÔNG được comment-out các đoạn code thừa/code cũ rồi để lại trong file (Code rác). Nếu code không dùng nữa, hãy XÓA HẲN.
> - KHÔNG để lại các lệnh `console.log`, `debugger` hoặc dữ liệu mock không cần thiết sau khi hoàn thành task.

> [!IMPORTANT]
> **3. QUY ĐỊNH VỀ COMMENT TRONG CODE:**
> - Toàn bộ comment giải thích code **BẮT BUỘC PhẢI VIẾT BẰNG TIẾNG VIỆT**.
> - Comment phải **ngắn gọn, súc tích, đúng trọng tâm**, giải thích LÝ DO (Tại sao lại viết như vậy) thay vì giải thích cú pháp cơ bản.

---

## 🎨 Best Practices Phía Frontend (React + TypeScript + Tailwind)

### 1. Naming Conventions (Quy chuẩn Đặt tên)
- **Components & Pages:** Đặt tên dạng `PascalCase` (Ví dụ: `ProductCard.tsx`, `SKUSelector.tsx`, `CartPage.tsx`).
- **Hooks:** Bắt đầu bằng tiền tố `use` dạng `camelCase` (Ví dụ: `useProductDetail.ts`, `useCartStore.ts`).
- **Variables & Functions:** Đặt tên dạng `camelCase` thể hiện rõ ý nghĩa (Ví dụ: `calculateTotalPrice`, `isMallSeller`).
- **Constants:** Đặt tên dạng `UPPER_SNAKE_CASE` (Ví dụ: `MAX_VOUCHER_DISCOUNT_VND`, `API_BASE_URL`).
- **Thư mục & File Tiện ích:** Đặt tên dạng `kebab-case` hoặc `camelCase` (Ví dụ: `services/api-client.ts`, `utils/format-currency.ts`).

### 2. Cấu trúc Component & Phân tách Logic
- **Single Responsibility Principle (Đơn trách nhiệm):** Mỗi component chỉ nên làm tốt một việc. Tách nhỏ UI thành các component phụ nếu vượt quá 150-200 dòng code.
- **Custom Hooks cho Logic:** Tách toàn bộ logic call API, tính toán complex state ra khỏi JSX UI và đưa vào Custom Hooks (Ví dụ: `useSKUSelection.ts`).

### 3. Quản lý State (State Management Standard)
- **State Cục bộ (Local UI State):** Dùng `useState` cho trạng thái đóng/mở modal, hover, active tab.
- **State Toàn cục (Global App State):** Dùng **Zustand** cho User Session (JWT), Giỏ hàng tạm, Cấu hình giao diện.
- **Server State (Dữ liệu từ API):** Dùng **React Query** (`useQuery`, `useMutation`). KHÔNG lưu dữ liệu API trùng lặp vào `useState` cục bộ.

### 4. Xử lý Dữ liệu Tiền tệ & Giá cả (VND Currency)
- Toàn bộ giá trị tiền tệ trong hệ thống là **VND** (Số nguyên).
- Sử dụng hàm tiện ích dùng chung để format hiển thị:
```typescript
// utils/format-currency.ts
/** Format số tiền sang định dạng VND chuẩn Shopee (VD: 25.000.000 ₫) */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
```

### 5. Giao tiếp API & Handling Errors
- Sử dụng instance `axios` tập trung tại `services/api-client.ts`.
- Mọi Type/Interface của Request/Response phải match 100% với `API-CONTRACT.md`.
- Bắt buộc xử lý Exception/Toast thông báo lỗi cho người dùng khi API trả về mã lỗi `4xx`, `5xx`.
