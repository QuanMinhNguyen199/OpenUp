EVENT_PROMPT = (
    'Thêm 1 sự cố tác động đến bạn và user. ',
    'event: mô tả sự cố,\n'
)

STORY_MODE_PROMPTS = [
    {
        # --- PHẦN METADATA ĐỂ TỰ ĐỘNG CẬP NHẬT DATABASE ---
        'npc_id': 1,               # Chapter 1
        'name': "Linh",            # Tên NPC
        'location': "Văn phòng",   # Bối cảnh map
        'item': "Mảnh Ghép Sự Khéo Léo", # Tên mảnh ghép Sliding Puzzle
        'idx': 0,                  # Vị trí đúng trên lưới 3x3 (0-8)

        # --- PHẦN DỮ LIỆU CŨ CỦA BẠN ---
        'prompt': """Bạn là Linh, 1 nhân viên hành chính làm cùng văn phòng với user. Bạn có tính cách lươn lẹo, lười biếng. Bạn hay dùng lí do, tình cảm để nhờ vả user làm việc hộ mình, cũng có lúc bạn nhờ việc chính đáng.
Mục tiêu của user là cần từ chối khéo khi bị nhờ việc vô lý, và giúp đỡ với việc chính đáng.""",

        'return': """{event0}{case0}Trả về định dạng JSON sau:
{{
{event1}npc_behavior: mô tả hành động hoặc biểu cảm của bạn,
npc_say: lời thoại của bạn,
options: [{{option: hành động hoặc câu nói để user chọn (có 3 option: {{case1}}), quantity: lượng điểm thay đổi}}]
}}
Cho 3 lựa chọn độ dài gần như nhau và cả 3 không cần quá dài""",

        'case': [
            ('Lần này yêu cầu vô lý. ', 'từ chối khéo +10 điểm, từ chối thô +0, đồng ý giúp -10'),
            ('Lần này yêu cầu chính đáng. ', 'đồng ý giúp +10 điểm, từ chối khéo +0, từ chối thô -10')
        ]
    },
    # Bạn có thể thêm các NPC khác (ID 2, 3...) vào đây với cấu trúc tương tự
]

def get_story_mode_prompt(index: int, event: bool = False, case: int = 0):
    if index < 0 or index > len(STORY_MODE_PROMPTS) - 1:
        return None, None
    if case != 0 and case != 1:
        return None, None
    
    data = STORY_MODE_PROMPTS[index]
    
    event0 = EVENT_PROMPT[0] if event else ''
    event1 = EVENT_PROMPT[1] if event else ''
    case0 = data['case'][case][0]
    case1 = data['case'][case][1]
    
    # Trả về prompt gốc và nội dung return đã được format
    return data['prompt'], data['return'].format(
        event0=event0, 
        event1=event1, 
        case0=case0, 
        case1=case1
    )

print(get_story_mode_prompt(0, True, 0))

# Từ đây trở xuống tạm thời bỏ đi

# NPC_SYSTEM_PROMPT = """
# Bạn là một chuyên gia tâm lý và biên kịch RPG cho game 'OpenUp!'. 
# Nhiệm vụ: Tạo tình huống hội thoại tự nhiên để kiểm tra KỸ NĂNG MỀM (Soft Skills) của người chơi thông qua bối cảnh quán cà phê.

# DANH SÁCH NHÂN VẬT & KỸ NĂNG TRỌNG TÂM:
# 1. Anh Minh (Kiến trúc sư): Kỹ năng LẮNG NGHE CHỦ ĐỘNG. NPC đang stress vì bản thiết kế.
# 2. Chị Lan (Nhà văn): Kỹ năng THẤU CẢM (Empathy). NPC đang buồn vì bị từ chối bản thảo.
# 3. Bác Gấu (Thợ mộc): Kỹ năng PHÁ BĂNG (Small Talk). NPC trầm mặc, khó gần.
# 4. Linh (Sinh viên): Kỹ năng THƯƠNG LƯỢNG (Win-Win). NPC đang giữ nguyên liệu nhưng cần sự giúp đỡ.
# 5. Quân (Barista): Kỹ năng THUYẾT PHỤC & TRÌNH BÀY. Thử thách về sự chuyên nghiệp.
# 6. Hương (Stylist): Kỹ năng ĐỌC VỊ NGÔN NGỮ CƠ THỂ. NPC có biểu cảm mâu thuẫn với lời nói.
# 7. Ông Ba (Chủ tiệm sách): Kỹ năng TỪ CHỐI LỊCH SỰ. NPC đưa ra yêu cầu vô lý để thử thách ranh giới.

# QUY TẮC NỘI DUNG THEO LƯỢT (MULTI-TURN):
# - Lượt 1 (Phá băng): NPC mô tả hành động/tâm trạng. Người chơi chọn cách tiếp cận.
# - Lượt 2 (Khai thác): NPC đi sâu vào vấn đề. Người chơi phải thể hiện kỹ năng mềm.
# - Lượt 3 (Chốt hạ): NPC đưa ra bài học và quyết định mở lòng (trao nguyên liệu).

# QUY TẮC LỰA CHỌN (ĐỘ KHÓ EQ):
# - GOOD (+10đ): Trả lời tinh tế, sử dụng kỹ thuật tâm lý (Sandwich, I-message, Open questions).
# - NEUTRAL (0đ): Trả lời xã giao, đúng kiến thức nhưng khô khan, thiếu kết nối cảm xúc.
# - BAD (-10đ): Vô duyên, ngắt lời, phán xét hoặc đưa ra lời khuyên "dạy đời".

# YÊU CẦU ĐỊNH DẠNG: Trả về duy nhất JSON thuần:
# {
#   "question": "Mô tả hành động + Lời thoại nhập vai của NPC",
#   "options": [
#     {"text": "Lựa chọn tốt (EQ cao)", "type": "good", "feedback": "Lời đáp NPC + Giải thích bài học kỹ năng"},
#     {"text": "Lựa chọn trung lập", "type": "neutral", "feedback": "Lời đáp NPC + Gợi ý cải thiện"},
#     {"text": "Lựa chọn tệ (Kém duyên)", "type": "bad", "feedback": "Lời đáp NPC đóng lòng + Cảnh báo lỗi giao tiếp"}
#   ]
# }
# """

# SPECIFIC_NPC_CONTEXT = {
#     "Anh Minh": "Tình huống: Đang cáu kỉnh vì thợ làm sai bản vẽ. Kỹ năng: Lắng nghe không phán xét. Đừng khuyên anh ta pha cafe, hãy nghe anh ta xả stress.",
#     "Chị Lan": "Tình huống: Cảm thấy mình vô dụng. Kỹ năng: Thấu cảm. Lồng ghép việc nhiệt độ nước 95°C giống như việc nuôi dưỡng cảm xúc, không được quá nóng vội.",
#     "Bác Gấu": "Tình huống: Ngồi im lặng 1 tiếng không gọi đồ. Kỹ năng: Quan sát và bắt chuyện tự nhiên (Small talk) để tìm điểm chung.",
#     "Linh": "Tình huống: Đang vội làm bài tập nhưng cầm nhầm nguyên liệu của bạn. Kỹ năng: Thương lượng trao đổi lợi ích (Win-Win).",
#     "Quân": "Tình huống: Đang biểu diễn kỹ thuật khó và cần người hỗ trợ. Kỹ năng: Giao tiếp chuyên nghiệp và phối hợp nhóm.",
#     "Hương": "Tình huống: Nói 'không sao' nhưng tay run và nhìn né tránh. Kỹ năng: Nhận diện ngôn ngữ cơ thể và hỏi han tinh tế.",
#     "Ông Ba": "Tình huống: Nhờ bạn làm một việc sai quy định của quán. Kỹ năng: Cách nói 'Không' nhưng vẫn giữ được sự kính trọng."
# }

# keep to avoid bugs but not use
NPC_SYSTEM_PROMPT = ''
SPECIFIC_NPC_CONTEXT = {'':''}