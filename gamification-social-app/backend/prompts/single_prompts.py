NAMES = ["Tuấn", "Lan", "Hùng", "Hoa", "Cường", "Mai", "Dũng", "Linh", "Hoàng", "Ngọc", "Khánh", "Trang", "Phú", "Thảo", "Nam", "Yến", "Phúc", "Hương", "Quân", "Diễm"]

# Keep but not use.
# EVENT_PROMPT = (
#     'Thêm 1 sự cố tác động đến bạn và user. ',
#     'event: mô tả sự cố,\n'
# )

# STORY_MODE_PROMPTS = [
#     {
#         # --- PHẦN METADATA ĐỂ TỰ ĐỘNG CẬP NHẬT DATABASE ---
#         'npc_id': 1,               # Chapter 1
#         'name': "Linh",            # Tên NPC
#         'location': "Văn phòng",   # Bối cảnh map
#         'item': "Mảnh Ghép Sự Khéo Léo", # Tên mảnh ghép Sliding Puzzle
#         'idx': 0,                  # Vị trí đúng trên lưới 3x3 (0-8)

#         # --- PHẦN DỮ LIỆU CŨ CỦA BẠN ---
#         'prompt': """Bạn là Linh, 1 nhân viên hành chính làm cùng văn phòng với user. Bạn có tính cách lươn lẹo, lười biếng. Bạn hay dùng lí do, tình cảm để nhờ vả user làm việc hộ mình, cũng có lúc bạn nhờ việc chính đáng.
# Mục tiêu của user là cần từ chối khéo khi bị nhờ việc vô lý, và giúp đỡ với việc chính đáng.""",

#         'return': """{{event0}}{{case0}}Trả về định dạng JSON sau:
# {{
# {{event1}}npc_behavior: mô tả hành động hoặc biểu cảm của bạn,
# npc_say: lời thoại của bạn,
# options: [{{option: hành động hoặc câu nói để user chọn (có 3 option: {{case1}}), quantity: lượng điểm thay đổi}}]
# }}
# Cho 3 lựa chọn độ dài gần như nhau và cả 3 không cần quá dài""",

#         'case': [
#             ('Lần này yêu cầu vô lý. ', 'từ chối khéo +10 điểm, từ chối thô +0, đồng ý giúp -10'),
#             ('Lần này yêu cầu chính đáng. ', 'đồng ý giúp +10 điểm, từ chối khéo +0, từ chối thô -10')
#         ]
#     },
#     # Bạn có thể thêm các NPC khác (ID 2, 3...) vào đây với cấu trúc tương tự
# ]

# def get_story_mode_prompt(index: int, event: bool = False, case: int = 0):
#     if index < 0 or index > len(STORY_MODE_PROMPTS) - 1:
#         return None, None
#     if case != 0 and case != 1:
#         return None, None
    
#     data = STORY_MODE_PROMPTS[index]
    
#     event0 = EVENT_PROMPT[0] if event else ''
#     event1 = EVENT_PROMPT[1] if event else ''
#     case0 = data['case'][case][0]
#     case1 = data['case'][case][1]
    
#     # Trả về prompt gốc và nội dung return đã được format
#     return data['prompt'], data['return'].format(
#         event0=event0, 
#         event1=event1, 
#         case0=case0, 
#         case1=case1
#     )

