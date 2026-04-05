Để test thử database vs FastAPI hoạt động hay không, trước hết phải có Docker Desktop trên máy và đc bật lên:
1. Kiểm tra trạng thái Docker
Trước khi test, đảm bảo các container đang chạy xanh trong Docker Desktop:

Terminal chạy: docker-compose up -d

db: Database PostgreSQL (Port 5432).

redis: Cache hệ thống (Port 6379).

pgadmin: Giao diện quản lý Database (Port 8080).

2. Test bằng giao diện Swagger UI (Nhanh nhất)
FastAPI cung cấp giao diện tương tác trực tiếp với API.

Khởi động server: uvicorn src.app.main:app --reload

Truy cập: http://127.0.0.1:8000/docs

Test Case 1 - Lấy Profile:

Tìm GET /user/profile.

Nhấn Try it out -> Execute.

Kỳ vọng: Trả về mã 200 OK và thông tin User (nếu đã seed dữ liệu).

Test Case 2 - Gửi tin nhắn:

Tìm POST /chat/send.

Nhập JSON mẫu: {"npc_id": 1, "message": "Hello Minh"}.

Kỳ vọng: Trả về câu trả lời của AI và điểm affinity_score được lưu vào DB.