EVENT_PROMPT = (
    'Đột ngột có một sự cố phát sinh tại bối cảnh này tác động đến cả bạn và user. ',
    '"event": "mô tả ngắn gọn sự cố vừa xảy ra",\n'
)

STORY_MODE_PROMPTS = [
    {
        # --- CHAPTER 1 ---
        'npc_id': 1, 'name': "Linh", 'location': "Văn phòng", 'item': "Mảnh Ghép Sự Khéo Léo", 'idx': 0,
        'prompt': """Bạn là Linh, nhân viên hành chính lươn lẹo, lười biếng. Bạn hay dùng giọng thảo mai, 'anh/chị ơi giúp em' để đẩy việc riêng cho người khác.
        Tính cách: Nói ngọt, hay kể lể hoàn cảnh để người khác mủi lòng.""",
        'case': [
            {'desc': 'Linh nhờ bạn làm hộ báo cáo vì Linh bận... đi làm móng.', 'types': ['Từ chối khéo léo', 'Từ chối thô lỗ', 'Đồng ý làm hộ'], 'vals': [10, 0, -10]},
            {'desc': 'Linh nhờ bạn hướng dẫn dùng máy in vì Linh thực sự mới vào và máy bị kẹt.', 'types': ['Nhiệt tình hướng dẫn', 'Chỉ dẫn qua loa', 'Mắng Linh chậm hiểu'], 'vals': [10, 5, -10]}
        ]
    },
    {
        # --- CHAPTER 2 ---
        'npc_id': 2, 'name': "Bác Bảo", 'location': "Cổng trường", 'item': "Mảnh Ghép Kiên Nhẫn", 'idx': 1,
        'prompt': """Bạn là Bác Bảo, bảo vệ già nghiêm túc nhưng công tâm. Bạn đang chặn user vì user đi học muộn và quy định là không được vào nếu không có giáo viên bảo lãnh.""",
        'case': [
            {'desc': 'User cố tình hối lộ bác bảo bằng tiền mặt để được vào.', 'types': ['Giải thích bình tĩnh', 'Nài nỉ van xin', 'Đưa tiền hối lộ'], 'vals': [10, 5, -20]},
            {'desc': 'User quên thẻ dự thi và chỉ còn 5 phút nữa là bắt đầu.', 'types': ['Trình bày thẻ căn cước và nhờ bác kiểm tra danh sách', 'Cố tình vượt rào', 'Nổi nóng với bác'], 'vals': [10, -15, -10]}
        ]
    },
    {
        # --- CHAPTER 3 ---
        'npc_id': 3, 'name': "Chị Mai", 'location': "Quán Café", 'item': "Mảnh Ghép Lắng Nghe", 'idx': 2,
        'prompt': """Bạn là Chị Mai, chủ quán café đang rất mệt mỏi vì vừa bị một khách hàng mắng chửi vô lý. Bạn cần một người để trút bầu tâm sự.""",
        'case': [
            {'desc': 'Chị Mai đang kể khổ, user bận xem điện thoại không tập trung.', 'types': ['Cất điện thoại và lắng nghe', 'Vừa nghe vừa gật đầu lấy lệ', 'Ngắt lời chị để nói chuyện mình'], 'vals': [10, 0, -15]},
            {'desc': 'Chị Mai hỏi lời khuyên có nên đuổi việc nhân viên làm sai không.', 'types': ['Gợi ý chị bình tĩnh xem xét nguyên nhân', 'Xúi chị đuổi ngay cho rảnh', 'Bảo chị đừng làm phiền mình'], 'vals': [10, -5, -15]}
        ]
    },
    {
        # --- CHAPTER 4 ---
        'npc_id': 4, 'name': "Nam", 'location': "Sân bóng", 'item': "Mảnh Ghép Đồng Đội", 'idx': 3,
        'prompt': """Bạn là Nam, một cầu thủ nóng tính. Team đang thua và bạn đang đổ lỗi cho user vì bỏ lỡ một cơ hội ghi bàn.""",
        'case': [
            {'desc': 'Nam mắng user thậm tệ trước mặt mọi người.', 'types': ['Nhận lỗi và đề nghị cùng cố gắng lượt sau', 'Mắng lại Nam', 'Bỏ trận đấu đi về'], 'vals': [10, -10, -25]},
            {'desc': 'Nam bị đau chân và muốn cố đá tiếp dù rất nguy hiểm.', 'types': ['Khuyên Nam nên nghỉ ngơi vì sức khỏe', 'Cổ vũ Nam đá tiếp bất chấp', 'Mỉa mai Nam yếu đuối'], 'vals': [10, -5, -10]}
        ]
    },
    {
        # --- CHAPTER 5 ---
        'npc_id': 5, 'name': "Cô Hoa", 'location': "Chợ", 'item': "Mảnh Ghép Sẻ Chia", 'idx': 4,
        'prompt': """Bạn là Cô Hoa bán rau, đang bị một người khách khác ép giá và mắng chửi là đồ lừa đảo dù rau cô rất tươi.""",
        'case': [
            {'desc': 'User thấy cô Hoa đang khóc vì bị ức hiếp.', 'types': ['Mua ủng hộ và an ủi cô', 'Đứng xem kịch hay', 'Cùng khách hàng kia ép giá thêm'], 'vals': [10, 0, -20]},
            {'desc': 'Cô Hoa thối nhầm tiền thừa cho user (nhiều hơn thực tế).', 'types': ['Trả lại tiền thừa cho cô', 'Im lặng cầm tiền đi về', 'Khoe với bạn bè là lừa được bà già'], 'vals': [15, -10, -30]}
        ]
    },
    {
        # --- CHAPTER 6 ---
        'npc_id': 6, 'name': "Hoàng", 'location': "Thư viện", 'item': "Mảnh Ghép Tập Trung", 'idx': 5,
        'prompt': """Bạn là Hoàng, một 'mọt sách' chính hiệu. Bạn cực kỳ khó chịu khi user làm ồn trong không gian yên tĩnh này.""",
        'case': [
            {'desc': 'User vô tình làm rơi sấp sách gây tiếng động lớn.', 'types': ['Nhẹ nhàng thu dọn và ra hiệu xin lỗi', 'Cười đùa coi như không có gì', 'Cãi nhau với Hoàng khi bị nhắc'], 'vals': [10, -10, -15]},
            {'desc': 'Hoàng đang làm bài tập khó và vò đầu bứt tai.', 'types': ['Hỏi xem có giúp được gì không', 'Vứt rác sang bàn Hoàng', 'Gõ bàn làm phiền Hoàng'], 'vals': [10, -15, -20]}
        ]
    },
    {
        # --- CHAPTER 7 ---
        'npc_id': 7, 'name': "Cụ Phan", 'location': "Đền Cổ", 'item': "Mảnh Ghép Thông Thái", 'idx': 6,
        'prompt': """Bạn là Cụ Phan, người canh giữ đền. Bạn nói chuyện bằng triết lý và đang thử thách tư duy của user về lòng nhân ái.""",
        'case': [
            {'desc': 'Cụ hỏi: "Nếu phải chọn giữa lợi ích bản thân và sự thật, ngươi chọn gì?".', 'types': ['Chọn sự thật dù mình thiệt thòi', 'Chọn lợi ích bản thân', 'Im lặng không trả lời'], 'vals': [15, -10, 0]},
            {'desc': 'Cụ yêu cầu user quét lá sân đền để đổi lấy mảnh ghép cuối.', 'types': ['Chăm chỉ quét dọn với lòng thành kính', 'Quét qua loa cho xong chuyện', 'Than vãn mệt mỏi'], 'vals': [10, 0, -10]}
        ]
    }
]

# --- HÀM GET PROMPT DÙNG CHUNG (KHÔNG ĐỔI) ---
def get_story_mode_prompt(index: int, event: bool = False, case: int = 0):
    if index < 0 or index >= len(STORY_MODE_PROMPTS):
        return None, None
    
    data = STORY_MODE_PROMPTS[index]
    case_data = data['case'][case]
    
    event0 = EVENT_PROMPT[0] if event else ''
    event1 = EVENT_PROMPT[1] if event else ''

    # Template Return Format (Hardcoded ở đây để tránh lặp lại trong list trên)
    return_template = """{event0}{case_desc}
Hãy nhập vai và trả về JSON:
{{
    {event1}"npc_behavior": "mô tả hành động của {name}",
    "npc_say": "lời thoại của {name}",
    "options": [
        {{"option": "User chọn: {t1}", "quantity": {v1}}},
        {{"option": "User chọn: {t2}", "quantity": {v2}}},
        {{"option": "User chọn: {t3}", "quantity": {v3}}}
    ]
}}"""

    system_p = data['prompt']
    instruction_p = return_template.format(
        event0=event0,
        event1=event1,
        case_desc=case_data['desc'],
        name=data['name'],
        t1=case_data['types'][0], v1=case_data['vals'][0],
        t2=case_data['types'][1], v2=case_data['vals'][1],
        t3=case_data['types'][2], v3=case_data['vals'][2]
    )
    
    return system_p, instruction_p