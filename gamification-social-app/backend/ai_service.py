import re
import os
import json
import asyncio
from google import genai
from openai import OpenAI
from dotenv import load_dotenv

# Import các kịch bản từ các file prompt riêng biệt
from prompts.story_prompts import get_story_mode_prompt
# Lưu ý: Đảm bảo các biến NPC_SYSTEM_PROMPT và SPECIFIC_NPC_CONTEXT được định nghĩa trong single_prompts
from prompts.single_prompts import get_singleplayer_prompt

load_dotenv()

# Khởi tạo Clients
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"), # Dùng nếu bạn chạy qua Proxy hoặc bối cảnh cụ thể
    timeout=60
)

# --- CHẾ ĐỘ 1: STORY MODE (HARDCODED CỐT TRUYỆN) ---
async def gen_dialogue_story_mode(index: int, event: bool, case: int, history: list[dict], current_turn: int = 1):
    system_prompt, request_prompt, pronoun = get_story_mode_prompt(index=index, event=event, case=case)
    
    if system_prompt is None or request_prompt is None:
        return {"error": "Không tìm thấy kịch bản cho Chapter này"}

    # Tạo rule xưng hô cứng từ pronoun data
    npc_calls = pronoun.get('npc', 'Tôi')
    user_calls = pronoun.get('user', 'Bạn')
    pronoun_rule = (
        f"QUY TẮC XƯNG HÔ TUYỆT ĐỐI (KHÔNG ĐƯỢC VI PHẠM): "
        f"NPC xưng '{npc_calls}', gọi user là '{user_calls}'. "
        f"User trong các options PHẢI xưng '{user_calls}', gọi NPC là '{npc_calls}'. "
        f"ĐỒNG NHẤT 100% trong cả npc_say lẫn 3 options. Vi phạm = kết quả bị loại.\n\n"
    )

    messages = [{"role": "system", "content": pronoun_rule + system_prompt}]  # Inject vào system

    valid_roles = ["system", "assistant", "user"]
    for msg in history[-6:]:
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else "")
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
        if role not in valid_roles:
            role = "user"
        if content:
            messages.append({"role": role, "content": content})

    if len(history) > 0:
        turn_stages = {
            1: "Mở đầu: NPC vừa nêu vấn đề lần đầu, cảm xúc còn nhẹ.",
            2: "Phát triển: Mâu thuẫn rõ hơn, NPC bắt đầu bộc lộ cảm xúc thật bên trong.",
            3: "Leo thang: NPC căng thẳng cao độ, có thể trách móc hoặc hé lộ bí mật.",
            4: "Cao trào: Tình huống đạt đỉnh điểm, mọi lời nói đều có hậu quả nặng nề.",
            5: "Quyết định: NPC phản ứng dứt khoát dựa trên toàn bộ hành trình vừa rồi.",
        }
        stage = turn_stages.get(current_turn, "Tiếp tục đẩy câu chuyện lên cao trào, không lặp lại cảm xúc hay tình huống cũ.")

        request_prompt = (
            f"GIAI ĐOẠN HIỆN TẠI (Lượt {current_turn}): {stage}\n"
            f"KỊCH BẢN GỐC CẦN BÁM SÁT: {request_prompt}\n\n"
            f"NHẮC LẠI XƯNG HÔ: NPC='{npc_calls}', User trong options='{user_calls}'. ĐỒNG NHẤT 100%.\n"
            "Hãy đọc kỹ lịch sử chat ở trên. Dựa vào câu nói vừa rồi của user và giai đoạn hiện tại, hãy phản ứng lại. "
            "LỆNH CẤM 1: TUYỆT ĐỐI KHÔNG lặp lại tình huống, cảm xúc, hay lời thoại đã xuất hiện ở các lượt trước. ÁP DỤNG QUY TẮC LEO THANG đúng với giai đoạn. "
            "LỆNH CẤM 2: KHÔNG để lộ số điểm (quantity) vào trong lời thoại. "
            "LỆNH CẤM 3 (ĐỘ KHÓ): CẢ 3 LỰA CHỌN PHẢI LÀ CÁC CÂU NÓI CỰC KỲ LỊCH SỰ, HỢP LÝ VÀ ĐỜI THƯỜNG. Phải làm cho người chơi rất khó phân biệt đâu là lựa chọn đúng! "
            "QUY TẮC CHẤM ĐIỂM BẮT BUỘC: Bắt buộc phải chia làm 3 mốc điểm rõ ràng. 'quantity' PHẢI LÀ SỐ. "
            "TRẢ VỀ JSON HỢP LỆ:\n"
            "{\n"
            '  "npc_behavior": "Mô tả hành động ngôi thứ 3, dùng tên NPC",\n'
            '  "npc_say": "Lời thoại mới, không lặp lại, phù hợp giai đoạn",\n'
            '  "options": [\n'
            '    {"option": "<Thấu cảm đúng tâm lý>", "quantity": <20 đến 25>},\n'
            '    {"option": "<Lịch sự nhưng sai bài học>", "quantity": <-15 đến -5>},\n'
            '    {"option": "<Nhẹ nhàng nhưng đùn đẩy trách nhiệm>", "quantity": <-25 đến -20>}\n'
            "  ]\n"
            "}"
        )

    messages.append({"role": "user", "content": request_prompt + " Bắt buộc trả về JSON hợp lệ."})

    MAX_RETRIES = 2
    raw = ""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.6,
                max_tokens=450,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()

        except Exception as e:
            print(f"⚠ [{attempt}/{MAX_RETRIES}] Lỗi Mạng/API OpenAI Story Mode: {e}")
            if attempt == MAX_RETRIES:
                break
            await asyncio.sleep(1)
            continue

        try:
            result = json.loads(raw)

            safe_regex = r'([\[\(]?\s*[+-]\d+\s*(điểm|points|đ)?\s*[\]\)]?)'
            if "npc_say" in result:
                result["npc_say"] = re.sub(safe_regex, '', result["npc_say"], flags=re.IGNORECASE).strip()
            if "options" in result and isinstance(result["options"], list):
                for opt in result["options"]:
                    if "option" in opt:
                        opt["option"] = re.sub(safe_regex, '', opt["option"], flags=re.IGNORECASE).strip()
                    # CLAMP quantity: chặn AI trả giá trị vượt range
                    if "quantity" in opt:
                        try:
                            q = float(opt["quantity"])
                            opt["quantity"] = min(25.0, q) if q > 0 else max(-25.0, q)
                        except (ValueError, TypeError):
                            opt["quantity"] = 0.0

            return result

        except json.JSONDecodeError as e:
            print(f"⚠ [{attempt}/{MAX_RETRIES}] Lỗi Parse JSON: {e}\nRaw: {raw}")
            if attempt == MAX_RETRIES:
                break
            await asyncio.sleep(1)
            continue

    return {
        "npc_behavior": "cau mày bối rối",
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
async def gen_dialogue_singleplayer(name_idx: int, job_idx: int, relationship_idx: int, lesson_idx: int, event: bool, case: int, turn: int, location: str, history: list[object], old_case: int = 0):
    system_prompt, request_prompt = get_singleplayer_prompt(
        name_idx=name_idx,
        job_idx=job_idx,
        relationship_idx=relationship_idx,
        lesson_idx=lesson_idx,
        event=event,
        case=case,
        turn=turn,
        location=location,
        old_case=old_case
    )
    if system_prompt is None or request_prompt is None:
        return {"error": "Dữ liệu lỗi"}

    messages = [{"role": "system", "content": system_prompt}]    
    last_6 = history[-6:]
    for i in range(0, len(last_6), 2):
        if i + 1 < len(last_6):
            asst_msg = last_6[i]
            user_msg = last_6[i+1]
            asst_content = getattr(asst_msg, "content", '')
            user_content = getattr(user_msg, "content", '')
            combined_content = f"Bạn nói: '{asst_content}'. User nói: '{user_content}'"
            messages.append({"role": "assistant", "content": combined_content})
    messages.append({"role": "user", "content": request_prompt})

    MAX_RETRIES = 2
    raw = ""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()

        except Exception as e:
            print(f"⚠ [{attempt}/{MAX_RETRIES}] Lỗi Singleplayer: {e}")
            if attempt == MAX_RETRIES:
                break
            await asyncio.sleep(1)
            continue

        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            print(f"⚠ Lỗi Parse JSON Singleplayer: {e}\nRaw: {raw}")
            break

    return {
        "npc_behavior": "chớp mắt",
        "npc_say": "Xin lỗi nãy tôi đang mải suy nghĩ, bạn có thể nói lại được không?"
    }



# --- TEST CODE ---
if __name__ == "__main__":
    async def test():
        print("--- TEST CREATIVE MODE (TURN 2) ---")
        res = await generate_npc_dialog("Linh", "Sự Khéo Léo", turn=2)
        print(json.dumps(res, indent=2, ensure_ascii=False))
        
    asyncio.run(test())
