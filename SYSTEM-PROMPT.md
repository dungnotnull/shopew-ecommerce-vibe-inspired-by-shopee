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

### 5. 📄 [Skills Directory](file:///d:/shopew-ecommerce-vibe-inspired-by-shopee/.agents/skills)
- **Vai trò:** Thư viện Kỹ năng & Quy chuẩn kỹ thuật thực thi của hệ thống (`.agents/skills/`).
- **Yêu cầu:**
  - BẮT BUỘC phải đọc và tuân thủ nội dung các file `SKILL.md` tương ứng trong `.agents/skills/` (ví dụ: `frontend-design`, `react-best-practices`, `building-components`, `web-design-guidelines`, `agent-browser`, `tdd`, v.v.) trước khi thực thi công việc.

---

## 🛑 QUY TẮC THAO TÁC TỐI THƯỢNG (SUPREME RULES)

1. **Phạm vi thư mục:** Phía Frontend CHỈ chỉnh sửa trong `frontent/`; Phía Backend CHỈ chỉnh sửa trong `backend/`. Không can thiệp sang thư mục đối phương trừ khi cập nhật tài liệu dùng chung ở gốc.
2. **Đọc Kỹ năng (Skills First):** Đọc kỹ các hướng dẫn và tiêu chuẩn trong `.agents/skills/` liên quan tới tác vụ trước khi viết hoặc sửa code.
3. **Giữ Code Sạch Sẽ (Clean Code):** Tuyệt đối KHÔNG để lại code thừa bị comment-out, không để lại console.log hoặc debugger dư thừa.
4. **Comment Tiếng Việt:** Tất cả comment giải thích code BẮT BUỘC viết bằng Tiếng Việt ngắn gọn, súc tích và tập trung vào lý do xử lý.
5. **Kiểm thử trước khi xác nhận:** Bắt buộc chạy lệnh kiểm tra build (`npm run build` / `npm test`) để đảm bảo không có lỗi trước khi hoàn thành công việc.
6. **Xác nhận trước khi Git Push (Push Approval):** AI Agent CHỈ được thực hiện `git commit` mã nguồn cục bộ. Tuyệt đối KHÔNG tự ý thực hiện `git push` lên GitHub remote trừ khi người dùng kiểm tra và trực tiếp yêu cầu hoặc xác nhận đồng ý.
7. **Tách biệt Backend & Báo cáo Lỗi (Backend Error Reporting):** Tuyệt đối KHÔNG tự ý sửa đổi bất kỳ code nào trong thư mục `backend/`. Nếu phát hiện lỗi, thiếu endpoint hoặc cần điều chỉnh logic ở phía Backend, AI Agent phải **tổng hợp nguyên nhân, vị trí file và hướng đề xuất khắc phục chi tiết** để báo cho người dùng chuyển lại cho phía Backend xử lý.



