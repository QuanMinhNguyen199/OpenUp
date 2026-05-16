NAMES = ["Tuấn", "Lan", "Hùng", "Hoa", "Cường", "Mai", "Dũng", "Linh", "Hoàng", "Ngọc", "Khánh", "Trang", "Phú", "Thảo", "Nam", "Yến", "Phúc", "Hương", "Quân", "Diễm"]

# JOBS = ["Giáo viên", "Bác sĩ", "Kỹ sư", "Lập trình viên", "Kế toán", "Luật sư", "Nhân viên bán hàng", "Công nhân", "Tài xế", "Đầu bếp", "Thợ điện", "Thợ xây", "Nhà báo", "Thiết kế đồ họa", "Marketing", "Nhân viên ngân hàng", "Hướng dẫn viên du lịch", "Nông dân", "Công an", "Bộ đội"]
JOBS = ["Giáo viên", "Bác sĩ", "Y tá", "Dược sĩ", "Kỹ sư xây dựng", "Kỹ sư cơ khí", "Kỹ sư điện", "Lập trình viên", "Thiết kế web", "Thiết kế đồ họa", "Kế toán", "Kiểm toán", "Luật sư", "Nhân viên ngân hàng", "Nhân viên bảo hiểm", "Nhân viên kinh doanh", "Nhân viên bán hàng", "Marketing", "Chăm sóc khách hàng", "Lễ tân", "Phục vụ nhà hàng", "Pha chế", "Đầu bếp", "Phụ bếp", "Tài xế taxi", "Tài xế xe tải", "Shipper", "Giao hàng", "Bốc xếp", "Bảo vệ", "Công an", "Bộ đội", "Công nhân may", "Công nhân lắp ráp", "Công nhân sản xuất", "Thợ điện", "Thợ nước", "Thợ hàn", "Thợ mộc", "Thợ xây", "Phụ hồ", "Thợ sửa xe", "Thợ sửa điện lạnh", "Thợ may", "Thợ làm tóc", "Thợ nail", "Trang điểm", "Nhiếp ảnh gia", "Quay phim", "Biên tập viên", "Nhà báo", "Content writer", "Streamer", "YouTuber", "Nhân viên IT hỗ trợ", "Quản trị mạng", "Tester phần mềm", "Quản lý dự án", "Hướng dẫn viên du lịch", "Điều hành tour", "Lái xe du lịch", "Nông dân", "Chăn nuôi", "Nuôi trồng thủy sản", "Ngư dân", "Bán hàng online", "Chủ shop", "Tạp vụ", "Lao công", "Giúp việc gia đình", "Giữ trẻ", "Bảo mẫu", "Huấn luyện viên thể hình", "Giáo viên yoga", "Nhân viên spa", "Kỹ thuật viên massage", "Nhân viên khách sạn", "Quản lý khách sạn", "Thu ngân", "Thủ kho", "Xuất nhập khẩu", "Logistics", "Nhân sự (HR)", "Tuyển dụng", "Đào tạo", "Hành chính văn phòng", "Thư ký", "Trợ lý", "Phiên dịch", "Biên dịch", "Nhân viên in ấn", "Thợ quảng cáo", "Làm biển hiệu", "Sửa điện thoại", "Kỹ thuật viên máy tính"]

RELATIONSHIPS = ["bạn bè", "bạn thân", "người quen", "đồng nghiệp", "bạn cùng lớp", "họ hàng", "hàng xóm", "người lạ"]

LOCATIONS = ["trường học", "bệnh viện", "công ty", "nhà hàng", "quán cafe", "rạp chiếu phim", "công viên", "bãi biển", "khu du lịch", "trung tâm thương mại", "chợ", "ngân hàng", "nghĩa địa", "bảo tàng", "phòng tập gym", "thư viện", "sảnh chung cư", "sân vận động", "công ty"]

LESSONS = [
    {
        'describe': '''Bạn hay dùng lí do, tình cảm hoặc đạo đức để nhờ vả người khác làm việc hộ, cũng có lúc bạn nhờ việc chính đáng.''',
        'cases': [
            ('Giờ hãy nhờ 1 việc k có lợi/ảnh hưởng gì cho user. ', 'từ chối hợp lý, lịch sự +10 điểm, từ chối thô -5, đồng ý giúp -15'),
            ('Giờ hãy nhờ 1 việc có lợi/ảnh hưởng tới user. ', 'đồng ý giúp +10 điểm, từ chối hợp lý, lịch sự -5, từ chối thô -15')
        ]
    },
    {
        'describe': '''Bạn hay kể về xui xẻo, mất mát, chuyện k may của bản thân.''',
        'cases': [
            ('Giờ hãy kể cho user 1 chuyện buồn do hoàn cảnh tác động. ', 'an ủi, đồng cảm +10 điểm, khích lệ cho có -5, xem thường -15'),
            ('Giờ hãy kể cho user 1 chuyện buồn do bạn gây ra. ', 'giải thích lý do chủ quan, khuyên nhủ +10 điểm, an ủi, đồng cảm -5, xem thường -15')
        ]
    },
    {
        'describe': '''Bạn hay tò mò, tọc mạch, thích can thiệp vào chuyện của người khác.''',
        'cases': [
            ('Giờ hãy hỏi về chuyện đời tư cá nhân của user. ', 'trả lời chung chung, từ chối khéo +10 điểm, từ chối thẳng -5, nói hẳn ra, phản ứng gay gắt -15'),
            ('Giờ hãy hỏi user về kiến thức, trải nghiệm chung chung mà k đi sâu vào đời tư. ', 'chia sẻ thẳng thắn, thật lòng +10 điểm, trả lời chung chung, từ chối khéo -5, từ chối thẳng -15')
        ]
    },
]

EVENT_PROMPT = {
    True: ('Thêm 1 sự cố khác tác động đến bạn và user. ', 'event: mô tả sự cố,\n'),
    False: ('', '')
}

FIRST_PROMPT = {
    True: "start_context: mô tả bối cảnh ban đầu (mối quan hệ 2 người, nghề của bạn, địa điểm, KO đc tiết lộ tính cách, mục đích của bạn),\nlocation: địa điểm,\n",
    False: "score: chấm điểm lượt trả lời cuối của user (theo CHÍNH XÁC tiêu chí: {criteria}),\nreason: lí do user được điểm đó theo hướng tiêu cực (theo ngôi 3),\n"
}

FIRST_PROMPT_MULTI = {
    True: "start_context: mô tả bối cảnh ban đầu (mối quan hệ 2 người, nghề của bạn, địa điểm, KO đc tiết lộ tính cách, mục đích của bạn),\n",
    '2': 'score1: chấm điểm cách trả lời 1 của user: "{user_say1}"  (theo CHÍNH XÁC tiêu chí: {criteria}),\nreason1: lí do user được điểm đó theo hướng tiêu cực (theo ngôi 3),\nscore2: chấm điểm cách trả lời 2 của user: "{user_say2}"  (theo CHÍNH XÁC tiêu chí: {criteria}),\nreason2: lí do user được điểm đó theo hướng tiêu cực (theo ngôi 3),\n',
    '1': 'score: chấm điểm câu trả lời của user: "{user_say}"  (theo CHÍNH XÁC tiêu chí: {criteria}),\nreason: lí do user được điểm đó theo hướng tiêu cực (theo ngôi 3),\n',
    '0': '',
}

CASE2 = ('Giờ hãy chỉ nói chuyện xã giao bình thường. ', 'tạo thiện cảm và kéo dài cuộc hội thoại +20 điểm, tạo thiện cảm nhưng k kéo dài hội thoại +10, k gây ấn tượng -5, làm mất thiện cảm -15')

def get_singleplayer_prompt(name_idx: int, job_idx: int, relationship_idx: int, lesson_idx: int, event: bool = False, case: int = 0, turn: int = 1, location: str = '', old_case: int = 0):
    if name_idx < 0 or name_idx >= len(NAMES):
        return None, None
    if job_idx < 0 or job_idx >= len(JOBS):
        return None, None
    if relationship_idx < 0 or relationship_idx >= len(RELATIONSHIPS):
        return None, None
    if lesson_idx < 0 or lesson_idx >= len(LESSONS):
        return None, None
    if case > 3 or case < 0:
        return None, None
    
    case_desc = LESSONS[lesson_idx]['cases'][case][0] if case < 2 else CASE2[0]
    case_crit = LESSONS[lesson_idx]['cases'][old_case][1] if old_case < 2 else CASE2[1]
    job = JOBS[job_idx] if relationship_idx != 4 else 'học sinh'
    location_prompt = f', địa điểm: {location}' if turn > 1 else ''
    first_prompt = FIRST_PROMPT[turn == 1] if turn == 1 else FIRST_PROMPT[turn == 1].format(criteria=case_crit)

    system_prompt = f"""Bạn là {NAMES[name_idx]}, nghề: {job}, mối quan hệ với user: {RELATIONSHIPS[relationship_idx]}{location_prompt}. {LESSONS[lesson_idx]['describe']}"""
    request_prompt = f"""{EVENT_PROMPT[event][0]}{case_desc}Trả về định dạng JSON sau:
{{
{first_prompt}{EVENT_PROMPT[event][1]}npc_behavior: mô tả hành động hoặc biểu cảm bên ngoài của bạn theo ngôi 3,
npc_say: lời thoại của bạn
}}
Cần tiếp diễn cuộc hội thoại 1 cách mượt mà, tự nhiên, KO đc tiết lộ mục đích của bạn. Chỗ nào trong các câu mô tả nói về user thì dùng từ 'bạn'"""
    return system_prompt, request_prompt

def get_customplay_prompt(
    name: str,
    relationship: str,
    npcGoal: str,
    userGoal: str,
    turn: int,
    location: str,
    npcGender: str,
    userGender: str,
    # optional
    additionalInfo: str,
    job: str,
    personality: str
):
    _job = f', nghề: {job}' if job != '' else ''
    _additionalInfo = f' Thông tin thêm mà user cung cấp: "{additionalInfo}".' if additionalInfo != '' else ''
    _personality = f', tính cách: {personality}' if personality != '' else ''
    first_prompt = '' if turn == 1 else FIRST_PROMPT[turn == 1].format(criteria='giao tiếp khéo léo, đạt được mục đích +10 điểm, đạt được mục đích nhưng làm mất lòng -5, không đạt được mục đích -15, không đạt mục đích mà còn làm mất thiện cảm -25')
    system_prompt = f"""Bạn tên là {name}, giới tính: {npcGender}{_personality}{_job}, mối quan hệ với user: {relationship}. Mục tiêu của bạn là: {npcGoal}. User giới tính {userGender}, mục tiêu là: {userGoal}. 2 người đang ở {location}.{_additionalInfo} """
    request_prompt = f"""Trả về định dạng JSON sau:
{{
{first_prompt}npc_behavior: mô tả hành động hoặc biểu cảm bên ngoài của bạn theo ngôi 3,
npc_say: lời thoại của bạn,
}}
Cần tiếp diễn cuộc hội thoại 1 cách mượt mà, tự nhiên, KO đc tiết lộ mục đích của bạn. Chỗ nào trong các câu mô tả nói về user thì dùng từ 'bạn'"""
    return system_prompt, request_prompt

def get_multiplayer_prompt(
    name_idx: int, 
    job_idx: int, 
    relationship_idx: int, 
    location_idx: int,
    lesson_idx: int, 
    user_say1: str,
    user_say2: str,
    case: int = 0, 
    turn: int = 1, 
    old_case: int = 0
):
    if name_idx < 0 or name_idx >= len(NAMES):
        return None, None
    if job_idx < 0 or job_idx >= len(JOBS):
        return None, None
    if relationship_idx < 0 or relationship_idx >= len(RELATIONSHIPS):
        return None, None
    if location_idx < 0 or location_idx >= len(LOCATIONS):
        return None, None
    if lesson_idx < 0 or lesson_idx >= len(LESSONS):
        return None, None
    if case > 3 or case < 0:
        return None, None
    
    case_desc = LESSONS[lesson_idx]['cases'][case][0] if case < 2 else CASE2[0]
    case_crit = LESSONS[lesson_idx]['cases'][old_case][1] if old_case < 2 else CASE2[1]
    job = JOBS[job_idx] if relationship_idx != 4 else 'học sinh'
    first_prompt = ''
    if turn == 1:
        first_prompt = FIRST_PROMPT_MULTI[True]
    else:
        if user_say1 != '' and user_say2 != '':
            first_prompt = FIRST_PROMPT_MULTI['2'].format(criteria=case_crit, user_say1=user_say1, user_say2=user_say2)
        elif user_say1 == '' and user_say2 == '':
            first_prompt = FIRST_PROMPT_MULTI['0']
        else:
            first_prompt = FIRST_PROMPT_MULTI['1'].format(criteria=case_crit, user_say=(user_say1 if user_say1 != '' else user_say2))

    system_prompt = f"""Bạn là {NAMES[name_idx]}, nghề: {job}, mối quan hệ với user: {RELATIONSHIPS[relationship_idx]}, địa điểm: {LOCATIONS[location_idx]}. {LESSONS[lesson_idx]['describe']}"""
    request_prompt = f"""{case_desc}Trả về định dạng JSON sau:
{{
{first_prompt}npc_behavior: mô tả hành động hoặc biểu cảm bên ngoài của bạn theo ngôi 3,
npc_say: lời thoại của bạn
}}
Cần tiếp diễn cuộc hội thoại 1 cách mượt mà, tự nhiên, KO đc tiết lộ mục đích của bạn. Chỗ nào trong các câu mô tả nói về user thì dùng từ 'bạn'"""
    return system_prompt, request_prompt


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

