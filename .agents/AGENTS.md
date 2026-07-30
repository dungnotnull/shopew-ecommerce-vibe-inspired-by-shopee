# Workspace Rules & Directives (Shopew)

Mỗi khi thao tác hoặc phát triển dự án Shopew, tất cả AI Agents BẮT BUỘC phải đọc và tuân thủ các file quan trọng thuộc Source of Truth sau đây:
1. `API-CONTRACT.md`: Schema, Endpoint, Status Code, Tiền tệ VND.
2. `CHANGELOG.md`: Lịch sử thay đổi và cập nhật dự án.
3. `CLAUDE.md` (bao gồm `frontend/CLAUDE.md` & `backend/CLAUDE.md`): Tech stack & Hướng dẫn vận hành.
4. `PROJECT-DETAIL.md`: Phân tích nghiệp vụ SPU/SKU, Redis Order Queue, Flash Sale, Chat WebSocket.

## Quy tắc thao tác
- Code FE chỉ nằm trong `frontend/`; Code BE chỉ nằm trong `backend/`.
- Clean code (không comment-out code cũ, không console.log dư thừa).
- 100% Comment bằng Tiếng Việt ngắn gọn, súc tích và đúng trọng tâm.
