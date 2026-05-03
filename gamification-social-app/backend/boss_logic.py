import random

# Màn Boss là Sliding Puzzle 3x3 (9 ô, vị trí từ 0 đến 8)
# Danh sách chuẩn là các target_idx theo đúng thứ tự 0 -> 8
CORRECT_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8]

BOSS_DIALOGS = {
    "welcome": "Cụ Phan vuốt râu: 'Bức tranh nhân sinh đã vỡ nát. Cháu hãy dùng 7 mảnh ghép thu thập được để khôi phục lại trật tự vốn có của nó.'",
    
    "hints": [
        "Cụ Phan lắc đầu: 'Sự Thấu Cảm phải đi trước Sự Điềm Tĩnh, hãy nhìn kỹ lại xem.'",
        "Cụ Phan nhíu mày: 'Các mối quan hệ vẫn còn lộn xộn lắm, đừng vội vàng.'",
        "Cụ Phan thở dài: 'Có những mảnh đã đúng chỗ, nhưng tổng thể thì chưa khớp. Hãy kiên nhẫn trượt lại.'",
        "Cụ Phan gõ gậy: 'Lắng nghe là nền tảng, đừng đặt nó ở quá xa sự Chân thành!'"
    ],
    
    "almost_there": "Cụ Phan mỉm cười khích lệ: 'Rất gần rồi cháu! Chỉ còn sai lệch một chút nữa thôi, bức tranh sắp hoàn thiện rồi!'",
    
    "success": "Cụ Phan gật đầu mãn nguyện, bức tranh sáng bừng lên: 'Tuyệt vời... Sự hỗn mang đã được sắp xếp lại. Cháu không chỉ ghép được tranh, mà đã thực sự kết nối được những tâm hồn. Chào mừng cháu đến với thế giới của OpenUp!'"
}

def check_boss_sequence(user_tile_sequence: list):
    """
    user_tile_sequence: List các target_idx (từ 0-8) theo thứ tự người chơi đang xếp trên lưới 3x3.
    Ví dụ Frontend gửi lên: [3, 0, 1, 4, 8, 2, 6, 7, 5]
    """
    # 1. Kiểm tra số lượng mảnh ghép (Lưới 3x3 phải có đúng 9 ô, tính cả ô trống số 8)
    if len(user_tile_sequence) != len(CORRECT_ORDER) or len(set(user_tile_sequence)) != 9:
        return {
            "is_correct": False,
            "message": "Cụ Phan: 'Khung tranh này có 9 ô cơ mà, cháu mang thiếu hoặc mang nhầm mảnh ghép rồi!'",
            "status": "RETRY",
            "correct_count": 0
        }

    # 2. Đếm số ô đã đặt đúng vị trí bằng hàm zip
    correct_count = sum(1 for u, d in zip(user_tile_sequence, CORRECT_ORDER) if u == d)

    # 3. Kiểm tra kết quả
    if correct_count == len(CORRECT_ORDER):
        return {
            "is_correct": True,
            "message": BOSS_DIALOGS["success"],
            "status": "WIN",
            "correct_count": correct_count
        }
    else:
        # Lựa chọn lời thoại dựa trên tiến độ (Tạo cảm giác Boss biết người chơi đang làm gì)
        if correct_count >= 6:
            message = BOSS_DIALOGS["almost_there"]
        else:
            message = random.choice(BOSS_DIALOGS["hints"])
            
        return {
            "is_correct": False,
            "message": message,
            "status": "RETRY",
            "correct_count": correct_count
        }