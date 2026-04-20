import random

# Thứ tự chuẩn dựa trên 7 kỹ năng sinh tồn
# ID hoặc Tên phải khớp hoàn toàn với bảng collections trên Supabase
CORRECT_ORDER = [
    "Phin Cà Phê",    # Bước 1: Sự Chuẩn Bị (Tâm thế)
    "Bột Cà Phê",     # Bước 2: Sự Thấu Cảm (Lắng nghe)
    "Sữa Đặc",        # Bước 3: Sự Chân Thành (Nền tảng)
    "Nước Sôi",       # Bước 4: Sự Nhiệt Huyết (Đúng lúc)
    "Muối Biển",      # Bước 5: Sự Tinh Tế (Cân bằng)
    "Thìa Khuấy",     # Bước 6: Sự Kết Nối (Thương lượng)
    "Đá Viên"         # Bước 7: Sự Điềm Tĩnh (Ranh giới)
]

BOSS_DIALOGS = {
    "welcome": "Cụ Phan nheo mắt: '7 mảnh ghép, 7 kỹ năng. Giờ hãy cho ta thấy bản lĩnh giao tiếp của cháu qua ly cà phê này. Nhớ kỹ: Đạo làm người cũng như đạo pha trà, sai một ly đi một dặm!'",
    
    "wrong_order": [
        "Cụ Phan đập bàn: 'Cháu định rót nước khi chưa có bột cafe sao? Đừng cố đưa ra lời khuyên khi cháu còn chưa chịu lắng nghe đối phương!'",
        "Cụ Phan lắc đầu: 'Cháu cho đá vào quá sớm rồi. Cái đầu lạnh chỉ có ích khi cháu đã xây dựng được sự chân thành ở bước đầu thôi!'",
        "Cụ Phan nhíu mày: 'Muối phải cho sau cùng để cân bằng vị đắng. Đừng cố tỏ ra tinh tế khi bản chất câu chuyện còn chưa định hình!'",
        "Cụ Phan thở dài: 'Khuấy mà không có sữa, có cafe? Sự kết nối của cháu thật rỗng tuếch nếu thiếu đi nền tảng thấu cảm!'"
    ],
    
    "success": "Cụ Phan khẽ nhấp một ngụm, ánh mắt giãn ra: 'Đắng, ngọt, mặn... hòa quyện hoàn hảo. Cháu không chỉ biết pha cà phê, cháu đã thấu hiểu cách mở lòng người khác. Chào mừng tân truyền nhân của OpenUp!'"
}

def check_boss_sequence(user_items: list):
    """
    user_items: List tên vật phẩm gửi từ Frontend.
    """
    # 1. Kiểm tra số lượng (Phòng trường hợp kéo thiếu)
    if len(user_items) < len(CORRECT_ORDER):
        return {
            "is_correct": False,
            "message": "Cụ Phan nhắc nhở: 'Thiếu nguyên liệu rồi cháu ơi, đừng nóng vội!'",
            "status": "RETRY"
        }

    # 2. Kiểm tra thứ tự
    if user_items == CORRECT_ORDER:
        return {
            "is_correct": True,
            "message": BOSS_DIALOGS["success"],
            "status": "WIN"
        }
    else:
        # 3. Logic mắng thông minh: Chỉ ra bước sai đầu tiên
        wrong_index = -1
        for i in range(len(user_items)):
            if user_items[i] != CORRECT_ORDER[i]:
                wrong_index = i
                break
        
        # Lấy câu mắng ngẫu nhiên hoặc theo bước sai
        return {
            "is_correct": False,
            "message": random.choice(BOSS_DIALOGS["wrong_order"]),
            "wrong_step": wrong_index + 1,
            "status": "RETRY"
        }