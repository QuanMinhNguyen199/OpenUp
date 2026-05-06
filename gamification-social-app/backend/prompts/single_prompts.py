NAMES = ["Tuấn", "Lan", "Hùng", "Hoa", "Cường", "Mai", "Dũng", "Linh", "Hoàng", "Ngọc", "Khánh", "Trang", "Phú", "Thảo", "Nam", "Yến", "Phúc", "Hương", "Quân", "Diễm"]

# JOBS = ["Giáo viên", "Bác sĩ", "Kỹ sư", "Lập trình viên", "Kế toán", "Luật sư", "Nhân viên bán hàng", "Công nhân", "Tài xế", "Đầu bếp", "Thợ điện", "Thợ xây", "Nhà báo", "Thiết kế đồ họa", "Marketing", "Nhân viên ngân hàng", "Hướng dẫn viên du lịch", "Nông dân", "Công an", "Bộ đội"]
JOBS = ["Giáo viên", "Bác sĩ", "Y tá", "Dược sĩ", "Kỹ sư xây dựng", "Kỹ sư cơ khí", "Kỹ sư điện", "Lập trình viên", "Thiết kế web", "Thiết kế đồ họa", "Kế toán", "Kiểm toán", "Luật sư", "Nhân viên ngân hàng", "Nhân viên bảo hiểm", "Nhân viên kinh doanh", "Nhân viên bán hàng", "Marketing", "Chăm sóc khách hàng", "Lễ tân", "Phục vụ nhà hàng", "Pha chế", "Đầu bếp", "Phụ bếp", "Tài xế taxi", "Tài xế xe tải", "Shipper", "Giao hàng", "Bốc xếp", "Bảo vệ", "Công an", "Bộ đội", "Công nhân may", "Công nhân lắp ráp", "Công nhân sản xuất", "Thợ điện", "Thợ nước", "Thợ hàn", "Thợ mộc", "Thợ xây", "Phụ hồ", "Thợ sửa xe", "Thợ sửa điện lạnh", "Thợ may", "Thợ làm tóc", "Thợ nail", "Trang điểm", "Nhiếp ảnh gia", "Quay phim", "Biên tập viên", "Nhà báo", "Content writer", "Streamer", "YouTuber", "Nhân viên IT hỗ trợ", "Quản trị mạng", "Tester phần mềm", "Quản lý dự án", "Hướng dẫn viên du lịch", "Điều hành tour", "Lái xe du lịch", "Nông dân", "Chăn nuôi", "Nuôi trồng thủy sản", "Ngư dân", "Bán hàng online", "Chủ shop", "Tạp vụ", "Lao công", "Giúp việc gia đình", "Giữ trẻ", "Bảo mẫu", "Huấn luyện viên thể hình", "Giáo viên yoga", "Nhân viên spa", "Kỹ thuật viên massage", "Nhân viên khách sạn", "Quản lý khách sạn", "Thu ngân", "Thủ kho", "Xuất nhập khẩu", "Logistics", "Nhân sự (HR)", "Tuyển dụng", "Đào tạo", "Hành chính văn phòng", "Thư ký", "Trợ lý", "Phiên dịch", "Biên dịch", "Nhân viên in ấn", "Thợ quảng cáo", "Làm biển hiệu", "Sửa điện thoại", "Kỹ thuật viên máy tính"]

RELATIONSHIPS = ["bạn", "bạn thân", "người quen", "đồng nghiệp", "bạn cùng lớp", "họ hàng", "hàng xóm", "người lạ"]

LESSONS = [
    {
        'describe': '''Bạn hay dùng lí do, tình cảm hoặc đạo đức để nhờ vả người khác làm việc hộ, cũng có lúc bạn nhờ việc chính đáng.
Mục tiêu của user là cần từ chối khi bị nhờ việc vô lý và đồng ý với việc chính đáng.''',
        'cases': [
            ('Lần này yêu cầu vô lý. ', 'từ chối hợp lý +10 điểm, từ chối thô -5, đồng ý giúp -15'),
            ('Lần này yêu cầu chính đáng. ', 'đồng ý giúp +10 điểm, từ chối hợp lý -5, từ chối thô -15')
        ]
    }
]

EVENT_PROMPT = (
    'Thêm 1 sự cố tác động đến bạn và user. ',
    'event: mô tả sự cố,\n'
)

def get_singleplayer_prompt(name_idx: int, job_idx: int, relationship_idx: int, lesson_idx: int, event: bool = False, case: int = 0):
    if name_idx < 0 or name_idx >= len(NAMES):
        return None, None
    if job_idx < 0 or job_idx >= len(JOBS):
        return None, None
    if relationship_idx < 0 or relationship_idx >= len(RELATIONSHIPS):
        return None, None
    if lesson_idx < 0 or lesson_idx >= len(LESSONS):
        return None, None
    if case != 0 and case != 1:
        return None, None
    
    system_prompt = f"""Bạn là {NAMES[name_idx]}, nghề: {JOBS[job_idx]}, mối quan hệ với user: {RELATIONSHIPS[relationship_idx]}."""

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

