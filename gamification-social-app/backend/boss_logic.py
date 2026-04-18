import random

# Thứ tự chuẩn của 7 nguyên liệu (Dựa trên kiến thức cà phê muối)
CORRECT_ORDER = [
    "Phin Cà Phê",    # Bước 1: Chuẩn bị dụng cụ
    "Bột Cà Phê",     # Bước 2: Cho cà phê vào
    "Sữa Đặc",        # Bước 3: Tạo nền ngọt
    "Nước Sôi",       # Bước 4: Chiết xuất
    "Muối Biển",      # Bước 5: Thành phần quan trọng
    "Thìa Khuấy",     # Bước 6: Hòa quyện
    "Đá Viên"         # Bước 7: Thưởng thức lạnh
]

BOSS_DIALOGS = {
    "welcome": "Cuối cùng cũng thu thập đủ! Giờ hãy chứng minh cậu biết cách pha một ly cà phê muối di sản xem nào. Xếp chúng vào đúng vị trí cho ta!",
    "wrong_order": [
        "Cậu định cho đá vào khi cà phê chưa pha xong à? Làm lại!",
        "Thứ tự này chỉ dành cho kẻ học việc. Ta cần một bậc thầy!",
        "Sai bét! Nhìn lại cuốn Codex mà cậu đã thu thập đi!",
        "Hương vị sẽ bị hỏng hoàn toàn nếu làm theo cách của cậu!"
    ],
    "success": "Tuyệt vời... Hương vị này... chính là nó! Cậu đã chính thức trở thành bậc thầy pha chế Cà Phê Muối."
}

def check_boss_sequence(user_items: list):
    """
    Hàm kiểm tra danh sách nguyên liệu người dùng gửi lên.
    user_items: list[str] - Danh sách tên nguyên liệu theo thứ tự kéo thả.
    """
    if user_items == CORRECT_ORDER:
        return {
            "is_correct": True,
            "message": BOSS_DIALOGS["success"],
            "next_step": "FINISH_GAME"
        }
    else:
        # Trả về một câu mắng ngẫu nhiên
        return {
            "is_correct": False,
            "message": random.choice(BOSS_DIALOGS["wrong_order"]),
            "next_step": "RETRY"
        }