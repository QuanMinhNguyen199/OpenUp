import re
import os
import json
import asyncio

# Load env BEFORE importing Langfuse (critical: Langfuse init reads env vars)
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
from langfuse import observe, get_client
from langfuse.openai import OpenAI

# Import các kịch bản từ các file prompt riêng biệt
from prompts.story_prompts import get_story_mode_prompt
# Lưu ý: Đảm bảo các biến NPC_SYSTEM_PROMPT và SPECIFIC_NPC_CONTEXT được định nghĩa trong single_prompts
from prompts.single_prompts import get_singleplayer_prompt, get_customplay_prompt, get_multiplayer_prompt

# Khởi tạo Clients
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"), # Dùng nếu bạn chạy qua Proxy hoặc bối cảnh cụ thể
    timeout=60
)


def _update_current_generation(**kwargs):
    get_client().update_current_generation(**kwargs)


def _clamp_quantity(value) -> float:
    try:
        quantity = float(value)
    except (ValueError, TypeError):
        return 0.0

    if quantity > 0:
        return min(25.0, quantity)
    if quantity < 0:
        return max(-25.0, quantity)
    return 0.0


# --- CHẾ ĐỘ 1: STORY MODE (HARDCODED CỐT TRUYỆN) ---
@observe(as_type="generation")
async def gen_dialogue_story_mode(index: int, event: bool, case: int, history: list[dict], current_turn: int = 1, user_id: int = None):
    #"Đây là session của Chapter mấy"
    _update_current_generation(
        input={
            "game_mode": "story",
            "chapter": index + 1,
            "turn": current_turn,
            "event": event,
            "case": case,
            "user_id": user_id,
        }
    )
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
            "QUY TẮC CHẤM ĐIỂM BẮT BUỘC: Tuân thủ tuyệt đối LUẬT CHẤM ĐIỂM RIÊNG trong hồ sơ nhân vật. 'quantity' PHẢI LÀ SỐ. "
            "TRẢ VỀ JSON HỢP LỆ:\n"
            "{\n"
            '  "npc_behavior": "Mô tả hành động ngôi thứ 3, dùng tên NPC",\n'
            '  "npc_say": "Lời thoại mới, không lặp lại, phù hợp giai đoạn",\n'
            '  "options": [\n'
            '    {"option": "<Đáp án ĐÚNG với mục tiêu bài học của Chapter này>", "quantity": <20 đến 25>},\n'
            '    {"option": "<Đáp án SAI với mục tiêu bài học của Chapter này>", "quantity": <-25 đến -15>},\n'
            '    {"option": "<Đáp án hời hợt, ba phải, nước đôi>", "quantity": 0}\n'
            "  ]\n"
            "}"
        )

    messages.append({"role": "user", "content": request_prompt + " Bắt buộc trả về JSON hợp lệ."})

    MAX_RETRIES = 2
    raw = ""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
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
                        opt["quantity"] = _clamp_quantity(opt["quantity"])

            # Set output on span: don't include the full options to avoid noise
            _update_current_generation(
                output={
                    "npc_behavior": result.get("npc_behavior"),
                    "npc_say_preview": result.get("npc_say", "")[:100],
                    "has_options": len(result.get("options", [])),
                }
            )
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

# SINGLEPLAYER MODE
@observe(as_type="generation")
async def gen_dialogue_singleplayer(name_idx: int, job_idx: int, relationship_idx: int, lesson_idx: int, event: bool, case: int, turn: int, location: str, history: list[object], old_case: int = 0, user_id: int = None):
    _update_current_generation(
        input={
            "game_mode": "singleplayer",
            "turn": turn,
            "location": location,
            "event": event,
            "case": case,
            "user_id": user_id,
        }
    )

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
            messages.append({"role": "user", "content": combined_content})
    messages.append({"role": "user", "content": request_prompt})

    MAX_RETRIES = 2
    raw = ""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.5,
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
            parsed = json.loads(raw)
            _update_current_generation(
                output={
                    "npc_behavior": parsed.get("npc_behavior"),
                    "npc_say_preview": parsed.get("npc_say", "")[:100],
                }
            )
            return parsed
        except json.JSONDecodeError as e:
            print(f"⚠ Lỗi Parse JSON Singleplayer: {e}\nRaw: {raw}")
            break

    return {
        "npc_behavior": "chớp mắt",
        "npc_say": "Xin lỗi nãy tôi đang mải suy nghĩ, bạn có thể nói lại được không?"
    }

# CUSTOM PLAY

@observe(as_type="generation")
async def gen_dialogue_customplay(
    name: str,
    relationship: str,
    npcGoal: str,
    userGoal: str,
    turn: int,
    location: str,
    npcGender: str,
    userGender: str,
    user_id: int,
    history: list[object],
    # optional
    additionalInfo: str,
    job: str,
    personality: str
):
    _update_current_generation(
        input={
            "game_mode": "customplay",
            "turn": turn,
            "location": location,
            "user_id": user_id,
        }
    )

    system_prompt, request_prompt = get_customplay_prompt(
        name=name,
        relationship=relationship,
        npcGoal=npcGoal,
        userGoal=userGoal,
        turn=turn,
        location=location,
        npcGender=npcGender,
        userGender=userGender,
        additionalInfo=additionalInfo,
        job=job,
        personality=personality
    )

    messages = [{"role": "system", "content": system_prompt}]    
    last_6 = history[-6:]
    for i in range(0, len(last_6), 2):
        if i + 1 < len(last_6):
            asst_msg = last_6[i]
            user_msg = last_6[i+1]
            asst_content = getattr(asst_msg, "content", '')
            user_content = getattr(user_msg, "content", '')
            combined_content = f"Bạn nói: '{asst_content}'. User nói: '{user_content}'"
            messages.append({"role": "user", "content": combined_content})
    messages.append({"role": "user", "content": request_prompt})

    MAX_RETRIES = 2
    raw = ""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()

        except Exception as e:
            print(f"⚠ [{attempt}/{MAX_RETRIES}] Lỗi Customplay: {e}")
            if attempt == MAX_RETRIES:
                break
            await asyncio.sleep(1)
            continue

        try:
            parsed = json.loads(raw)
            _update_current_generation(
                output={
                    "npc_behavior": parsed.get("npc_behavior"),
                    "npc_say_preview": parsed.get("npc_say", "")[:100],
                }
            )
            return parsed
        except json.JSONDecodeError as e:
            print(f"⚠ Lỗi Parse JSON Customplay: {e}\nRaw: {raw}")
            break

    return {
        "npc_behavior": "chớp mắt",
        "npc_say": "Xin lỗi nãy tôi đang mải suy nghĩ, bạn có thể nói lại được không?"
    }


# MULTIPLAYER MODE
# @observe(as_type="generation")
async def gen_dialogue_multiplayer(
    name_idx: int, 
    job_idx: int, 
    relationship_idx: int, 
    location_idx: int,
    lesson_idx: int, 
    user_say1: str,
    user_say2: str,
    case: int, 
    turn: int, 
    history: list[object],
    old_case: int = 0,
    # user_id: int = None
):
    # _update_current_generation(
    #     input={
    #         "game_mode": "singleplayer",
    #         "turn": turn,
    #         "location": location,
    #         "event": event,
    #         "case": case,
    #         "user_id": user_id,
    #     }
    # )

    system_prompt, request_prompt = get_multiplayer_prompt(
        name_idx=name_idx,
        job_idx=job_idx,
        relationship_idx=relationship_idx,
        location_idx=location_idx,
        lesson_idx=lesson_idx,
        user_say1=user_say1,
        user_say2=user_say2,
        case=case,
        turn=turn,
        old_case=old_case
    )
    if system_prompt is None or request_prompt is None:
        return {"error": "Dữ liệu lỗi"}

    messages = [{"role": "system", "content": system_prompt}]    
    last_6 = history[-5:]
    for i in range(0, len(last_6), 2):
        asst_content = getattr(last_6[i], "content", '')
        if i + 1 < len(last_6):
            user_content = getattr(last_6[i + 1], "content", '')
            combined_content = f"Bạn nói: '{asst_content}'. User nói: '{user_content}'"
        else:
            combined_content = f"Bạn nói: '{asst_content}'"
        messages.append({"role": "user", "content": combined_content})
    messages.append({"role": "user", "content": request_prompt})

    MAX_RETRIES = 2
    raw = ""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()

        except Exception as e:
            print(f"⚠ [{attempt}/{MAX_RETRIES}] Lỗi Multiplayer: {e}")
            if attempt == MAX_RETRIES:
                break
            await asyncio.sleep(1)
            continue

        try:
            parsed = json.loads(raw)
            # _update_current_generation(
            #     output={
            #         "npc_behavior": parsed.get("npc_behavior"),
            #         "npc_say_preview": parsed.get("npc_say", "")[:100],
            #     }
            # )
            return parsed
        except json.JSONDecodeError as e:
            print(f"⚠ Lỗi Parse JSON Multiplayer: {e}\nRaw: {raw}")
            break

    return {
        "npc_behavior": "chớp mắt",
        "npc_say": "Xin lỗi nãy tôi đang mải suy nghĩ, bạn có thể nói lại được không?"
    }



