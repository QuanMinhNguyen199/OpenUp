import random

# Màn Boss là Sliding Puzzle 3x3 (9 ô, vị trí từ 0 đến 8)
# Danh sách chuẩn là các target_idx theo đúng thứ tự 0 -> 8
CORRECT_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8]

# Đã thay đổi: Phản hồi từ Bảo Vật / Hệ Thống thay vì Cụ Phan
BOSS_DIALOGS = {
    "welcome": "Bảo vật Ký ức đang chờ được hợp nhất. Hãy trượt các mảnh ghép về đúng vị trí để hoàn thiện bức tranh nhân sinh.",
    
    "hints": [
        "Các mảnh ghép chưa thực sự cộng hưởng với nhau. Hãy nhìn kỹ lại.",
        "Một vài ký ức vẫn còn đặt sai chỗ, đừng vội vàng.",
        "Sự kết nối vẫn còn đứt gãy. Hãy kiên nhẫn sắp xếp lại.",
        "Ánh sáng đang le lói nhưng chưa thể hòa làm một. Hãy tiếp tục trượt."
    ],
    
    "almost_there": "Bảo vật đang rung lên và tỏa sáng rực rỡ! Chỉ còn sai lệch một chút nữa thôi, bức tranh sắp hoàn thiện rồi!",
    
    "success": "BÙM! Bức tranh bừng sáng rực rỡ. Tuyệt vời! Sự hỗn mang đã được sắp xếp lại. Bạn không chỉ ghép được tranh, mà đã thực sự kết nối được những tâm hồn. Chúc mừng bạn đã phá đảo OpenUp!"
}

def check_boss_sequence(user_tile_sequence: list):
    """
    user_tile_sequence: List các target_idx (từ 0-8) theo thứ tự người chơi đang xếp trên lưới 3x3.
    """
    # 1. Kiểm tra số lượng mảnh ghép
    if len(user_tile_sequence) != len(CORRECT_ORDER) or len(set(user_tile_sequence)) != 9:
        return {
            "is_correct": False,
            "message": "Hệ thống: Khung tranh này yêu cầu 9 ô, dữ liệu mảng bị sai lệch!",
            "status": "RETRY",
            "correct_count": 0
        }

    # 2. Đếm số ô đã đặt đúng vị trí
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
        # Phản hồi theo tiến độ
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