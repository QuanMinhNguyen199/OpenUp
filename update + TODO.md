# 📝 Nhật Ký Cập Nhật & CÔNG VIỆC (TODO)
**Ngày cập nhật:** 30/04/2026

---

## Trí sửa BE:
- [30/4] thêm helper func tính level theo rule mới (Cần 100xp lên lv2, thêm 200xp lên lv3, thêm 300xp lên lv4...) và thay những chỗ trong main.py đang tính level thủ công -> gọi hàm
- [29/4] trả thêm role cho endpoint "/api/user/status/{user_id}"
- [29/4] sửa thông báo lỗi khi đăng ký tk mới mà username đã tồn tại

---

## ✅ Phần 1: Trạng Thái Backend (Member 1)
**Tình trạng:** Đã hoàn thành các tính năng cốt lõi.

### 🔐 Hệ thống Xác thực (Auth)
- [x] Hoàn thiện API Đăng ký (`register`) và Đăng nhập (`login`).
- [x] Triển khai cơ chế băm mật khẩu 2 lớp (SHA-256) - *Khắc phục lỗi Bcrypt trên Windows*.
- [x] Tự động khởi tạo 2 tài khoản Admin khi chạy server: `admin_quan` và `admin_tri`.
  > **Lưu ý:** Mật khẩu test mặc định cho Admin là `123456` và `654321`.

### 🎮 Gameplay Logic
- [x] Xây dựng API lấy kịch bản hội thoại (`scenario`).
- [x] Xử lý logic tính điểm thiện cảm (affinity) - *Tự động mở khóa nguyên liệu khi đạt 80 điểm*.

### 🎒 Codex & Boss
- [x] Hoàn thiện API Codex: Kiểm tra kho đồ người chơi.
- [x] Hoàn thiện API màn Boss: Kiểm tra thứ tự 7 bước pha chế cà phê muối (trả về gợi ý lỗi sai cụ thể).

### ⚙️ Môi trường
- [x] Cập nhật `requirements.txt` chuẩn để đồng bộ thư viện cho cả team.

---

## 🛠️ Phần 2: Nhiệm Vụ Database & Môi Trường (Member 2)
**Tình trạng:** Cần thực hiện ngay để Backend và Database có thể kết nối.

### Môi trường & Database (Supabase)
- [ ] **Cài đặt môi trường:** Chạy lệnh `pip install -r requirements.txt` để cài đặt đủ driver kết nối DB.
- [ ] **Khởi tạo Database:** Tạo các bảng theo cấu trúc trong file `models.py`.
- [ ] **Seeding dữ liệu:** Chạy script SQL Seeding để nạp 7 NPC, 7 nguyên liệu và kịch bản hội thoại mẫu.
- [ ] **Quản lý dữ liệu:** Giám sát bảng `user_collections` và `conversations` khi Member 3 test game để đảm bảo tính toàn vẹn của dữ liệu.
- [ ] **Triển khai (Docker):** Tiến hành cấu hình file `docker-compose.yml` để đóng gói dự án.

---

## 🎨 Phần 3: Nhiệm Vụ Frontend (Member 3 - Next.js/React)
**Tình trạng:** Bắt đầu tích hợp giao diện với các API Backend.

### 1. Luồng Hội Thoại (Conversation)
- [ ] Gọi `GET /game/scenario/{npc_id}` để lấy câu hỏi và danh sách lựa chọn.
- [ ] Khi chọn đáp án, gọi `POST /game/choose-option` (truyền `option_id` và `user_id`).
- [ ] **UI/UX:** Nếu nhận về `unlocked_item: true`, hiển thị thông báo chúc mừng người chơi nhận nguyên liệu mới.

### 2. Trang Codex (Inventory)
- [ ] Gọi `GET /api/user/codex/{user_id}` để lấy danh sách 7 nguyên liệu.
- [ ] **UI/UX:** Những nguyên liệu có `is_owned: false` cần hiển thị icon mờ (gray-scale) hoặc dấu chấm hỏi.

### 3. Màn Boss (Mini-game Pha Chế)
- [ ] Thiết kế UI kéo thả (Drag & Drop) để xếp 7 nguyên liệu vào cốc.
- [ ] Gọi `POST /api/game/mix-recipe` (gửi mảng ID theo thứ tự người chơi xếp).
- [ ] **UI/UX:** Nếu Backend trả về `FAIL`, hiển thị `message` từ response để gợi ý lỗi sai cho người chơi.

---

## 🚀 Bảng Tổng Hợp API Endpoints Cần Chú Ý

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Đăng ký tài khoản mới |
| `POST` | `/api/login` | Đăng nhập (lấy `user_id` và `role`) |
| `GET`  | `/game/scenario/{npc_id}` | Lấy dữ liệu hội thoại của NPC |
| `POST` | `/game/choose-option` | Gửi câu trả lời hội thoại |
| `GET`  | `/api/user/codex/{user_id}`| Lấy dữ liệu kho đồ (Codex) |
| `POST` | `/api/game/mix-recipe` | Nộp kết quả giải đố màn Boss |

---
*Ghi chú chung: Mọi thành viên chú ý sử dụng đúng thông tin tài khoản test để tránh bị lỗi 401 Unauthorized.*