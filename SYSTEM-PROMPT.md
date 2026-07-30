# System Prompt & Core Directives (Shopew Project)

## 🚨 MANDATORY INSTRUCTIONS FOR ALL AI AGENTS & DEVELOPERS

Mỗi khi bắt đầu bất kỳ thao tác phát triển, chỉnh sửa code hoặc tư vấn trong dự án **Shopew**, BẮT BUỘC phải đọc và tham chiếu các file quan trọng thuộc **Source of Truth** sau đây:

---

### 1. 📄 [API-CONTRACT.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/API-CONTRACT.md)
- **Vai trò:** Hợp đồng giao tiếp chính thức giữa Frontend và Backend.
- **Yêu cầu:** 
  - Mọi API Endpoint, Payload Request, Response Data và HTTP Status Code đều BẮT BUỘC phải khớp 100% với tài liệu này.
  - Toàn bộ giá trị tiền tệ giao tiếp và hiển thị phải là **VND (Việt Nam Đồng)** dưới dạng số nguyên (không có thập phân).

---

### 2. 📄 [CHANGELOG.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/CHANGELOG.md)
- **Vai trò:** Nhật ký ghi nhận lịch sử thay đổi của dự án.
- **Yêu cầu:** 
  - Đọc để nắm được các cập nhật kiến trúc, tính năng mới hoặc breaking changes gần nhất.
  - Cập nhật nhật ký mỗi khi hoàn thành các tính năng/kiến trúc lớn.

---

### 3. 📄 [CLAUDE.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/CLAUDE.md) (kèm [frontend/CLAUDE.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/frontend/CLAUDE.md) & [backend/CLAUDE.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/backend/CLAUDE.md))
- **Vai trò:** Ngữ cảnh hệ thống và hướng dẫn vận hành chuyên biệt cho từng phân vùng.
- **Yêu cầu:** 
  - Đọc để hiểu Tech Stack (React + Tailwind + Zustand + React Query phía FE; NestJS + Prisma + PostgreSQL + Redis + Socket.io phía BE).
  - Nắm rõ các lệnh khởi chạy cơ bản (`npm run dev`, `npm run build`, `npm run lint`).

---

### 4. 📄 [PROJECT-DETAIL.md](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/PROJECT-DETAIL.md)
- **Vai trò:** Tài liệu phân tích chuyên sâu các tính năng và nghiệp vụ cốt lõi của Shopew.
- **Yêu cầu:**
  - Nắm vững **Kiến trúc Product SPU & SKU** (2-Tier Variants, Default SKU fallback, Dynamic Attributes JSONB).
  - Hiểu rõ luồng Checkout chống bán lố (Redis Message Queue + Concurrency Lock), Mã giảm giá 3 tầng (Platform, Shop, Coins), và Chat Real-time Socket.io.

---

## 🛑 QUY TẮC THAO TÁC TỐI THƯỢNG (SUPREME RULES)

1. **Phạm vi thư mục:** Phía Frontend CHỈ chỉnh sửa trong `frontend/`; Phía Backend CHỈ chỉnh sửa trong `backend/`. Không can thiệp sang thư mục đối phương trừ khi cập nhật tài liệu dùng chung ở gốc.
2. **Giữ Code Sạch Sẽ (Clean Code):** Tuyệt đối KHÔNG để lại code thừa bị comment-out, không để lại console.log hoặc debugger dư thừa.
3. **Comment Tiếng Việt:** Tất cả comment giải thích code BẮT BUỘC viết bằng Tiếng Việt ngắn gọn, súc tích và tập trung vào lý do xử lý.
4. **Kiểm thử trước khi xác nhận:** Bắt buộc chạy lệnh kiểm tra build (`npm run build` / `npm test`) để đảm bảo không có lỗi trước khi hoàn thành công việc.
