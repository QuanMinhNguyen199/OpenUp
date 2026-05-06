import os
import json
import asyncio
from google import genai
from openai import OpenAI
from dotenv import load_dotenv

# Import các kịch bản từ các file prompt riêng biệt
from prompts.story_prompts import get_story_mode_prompt
# Lưu ý: Đảm bảo các biến NPC_SYSTEM_PROMPT và SPECIFIC_NPC_CONTEXT được định nghĩa trong single_prompts
# from prompts.single_prompts import get_single_prompt

load_dotenv()

# Khởi tạo Clients
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"), # Dùng nếu bạn chạy qua Proxy hoặc bối cảnh cụ thể
    timeout=60
)

# --- CHẾ ĐỘ 1: STORY MODE (HARDCODED CỐT TRUYỆN) ---
async def gen_dialogue_story_mode(index: int, event: bool, case: int, history: list[dict]):
    """
    Xử lý hội thoại Story Mode bằng GPT-4o-mini.
    Hệ thống lấy kịch bản từ story_prompts.py và AI xào nấu lại dựa trên lịch sử.
    """
    system_prompt, request_prompt = get_story_mode_prompt(index=index, event=event, case=case)
    
    if system_prompt is None or request_prompt is None:
        return {"error": "Không tìm thấy kịch bản cho Chapter này"}

    # Xây dựng Messages: System -> Lịch sử chat -> Chỉ thị format
    messages = [{"role": "system", "content": system_prompt}]
    
    # BƯỚC 2: Xử lý History an toàn (Chống lỗi 500 FastAPI vs Pydantic)
    valid_roles = ["system", "assistant", "user"]
    for msg in history[-6:]:
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else "")
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
        
        if role not in valid_roles: 
            role = "user" # Nếu Frontend truyền linh tinh thì ép về user
        if content: 
            messages.append({"role": role, "content": content})

    # BƯỚC 3: Bẻ lái kịch bản nếu đã có lịch sử chat (Chống lỗi lặp kịch bản)
    if len(history) > 0:
        request_prompt = (
            "Dựa vào câu nói/hành động vừa rồi của user, hãy thể hiện cảm xúc và phản ứng lại. "
            "Tự nghĩ ra diễn biến tiếp theo và đưa ra 3 lựa chọn mới cho user (kèm điểm quantity từ -20 đến +20). "
            "TRẢ VỀ KẾT QUẢ BẰNG ĐỊNH DẠNG JSON NHƯ SAU:\n"
            "{\n"
            '  "npc_behavior": "mô tả hành động",\n'
            '  "npc_say": "lời thoại phản hồi",\n'
            '  "options": [\n'
            '    {"option": "lựa chọn 1", "quantity": điểm}\n'
            "  ]\n"
            "}"
        )

    # BƯỚC 4: Chốt lệnh (Chống lỗi 400 thiếu từ khóa JSON của OpenAI)
    messages.append({"role": "user", "content": request_prompt + " Bắt buộc trả về kết quả dưới dạng JSON hợp lệ."})

    MAX_RETRIES = 2
    raw = ""
    
    for attempt in range(1, MAX_RETRIES + 1):
        # BƯỚC 1: Gọi API (Chỉ retry nếu lỗi đường truyền hoặc lỗi từ phía máy chủ OpenAI)
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7, # Thấp hơn để AI bám sát kịch bản cứng
                response_format={ "type": "json_object" } # Ép GPT trả về JSON
            )
            raw = response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"⚠ [{attempt}/{MAX_RETRIES}] Lỗi Mạng/API OpenAI Story Mode: {e}")
            if attempt == MAX_RETRIES:
                break  # Hết lượt cứu chữa, thoát vòng lặp để xuống dùng Fallback
            await asyncio.sleep(1)
            continue # Gọi lại API lần nữa
            
        # BƯỚC 2: Parse JSON (Nếu gọi API thành công nhưng AI nhả JSON lỗi -> Thoát luôn, KHÔNG gọi lại API gây tốn tiền)
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            print(f"⚠ Lỗi Parse JSON (Dừng, không gọi lại API): {e}\nRaw: {raw}")
            break # Thoát vòng lặp ngay lập tức để xuống dùng Fallback

    # BƯỚC 3: Fallback cứng (Chỉ chạy đến đây nếu API sập cả 2 lần hoặc JSON bị rác)
    return {
        "npc_behavior": "đang suy nghĩ",
        "npc_say": "Tôi hơi bối rối một chút, bạn có thể nói lại được không?",
        "options": [
            {"option": "Nhắc lại ý vừa rồi", "quantity": 0},
            {"option": "Để tôi nói lại cho rõ", "quantity": 0},
            {"option": "Im lặng chờ đợi", "quantity": 0}
        ]
    }

# --- CHẾ ĐỘ 2: CREATIVE MODE (AI SINH TỰ DO THEO TURN) ---
async def generate_npc_dialog(npc_name: str, ingredient: str, turn: int = 1):
    """
    Sinh kịch bản hội thoại tự do bằng Gemini 2.0 Flash.
    Mỗi NPC có 3 lượt (turn) để người chơi chinh phục và lấy mảnh ghép.
    """
    NPC_SYSTEM_PROMPT = ''
    SPECIFIC_NPC_CONTEXT = {'':''}

    extra_context = SPECIFIC_NPC_CONTEXT.get(npc_name, "Một NPC bí ẩn trong thế giới OpenUp.")
    
    # Chiến lược dẫn dắt theo lượt
    turn_goals = {
        1: "Phá băng: NPC làm quen hoặc đưa ra một vấn đề nhẹ nhàng.",
        2: "Khai thác: Đi sâu vào mâu thuẫn hoặc cảm xúc. Đòi hỏi EQ cao hơn.",
        3: "Chốt hạ: Tình huống quyết định. Nếu thắng sẽ nhận được nguyên liệu kỹ năng."
    }
    goal = turn_goals.get(turn, turn_goals[1])

    try:
        # Sử dụng tính năng native JSON mode của Gemini 2.0 Flash
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            config={
                'system_instruction': NPC_SYSTEM_PROMPT,
                'response_mime_type': 'application/json',
                'temperature': 0.9 # Cao hơn để AI sáng tạo lời thoại
            },
            contents=(
                f"NPC: {npc_name}. Mảnh ghép đang giữ: {ingredient}. "
                f"Lượt hiện tại: {turn}/3. Mục tiêu lượt này: {goal}. "
                f"Bối cảnh tâm lý nhân vật: {extra_context}"
            )
        )
        
        if not response.text:
            raise ValueError("Gemini trả về rỗng")

        result = json.loads(response.text)
        result["turn"] = turn
        result["is_final_turn"] = (turn >= 3)
        
        return result

    except Exception as e:
        print(f"❌ Lỗi Creative Mode ({npc_name} - Turn {turn}): {e}")
        return {
            "question": f"Tiếp tục câu chuyện với {npc_name}, bạn sẽ nói gì?",
            "options": [
                {"text": "Chia sẻ chân thành", "type": "good", "feedback": "Sự chân thành luôn là chìa khóa tốt nhất."},
                {"text": "Nói chuyện xã giao", "type": "neutral", "feedback": "NPC vẫn đang quan sát bạn."},
                {"text": "Phớt lờ cảm xúc của NPC", "type": "bad", "feedback": "NPC cảm thấy không được tôn trọng."}
            ],
            "turn": turn,
            "is_final_turn": (turn >= 3)
        }


# SINGLEPLAYER MODE
async def gen_dialogue_singleplayer(name_idx: int, job_idx: int, relationship_idx: int, lesson_idx: int, event: bool, case: int, turn: int, location: str):
    pass


# --- TEST CODE ---
if __name__ == "__main__":
    async def test():
        print("--- TEST CREATIVE MODE (TURN 2) ---")
        res = await generate_npc_dialog("Linh", "Sự Khéo Léo", turn=2)
        print(json.dumps(res, indent=2, ensure_ascii=False))
        
    asyncio.run(test())