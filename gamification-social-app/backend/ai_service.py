import os
import json
import asyncio
from google import genai
from dotenv import load_dotenv
# Nhớ kiểm tra file prompts có tên đúng là system_prompts.py không nhé
from system_prompts import NPC_SYSTEM_PROMPT, SPECIFIC_NPC_CONTEXT

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_npc_dialog(npc_name: str, ingredient: str, turn: int = 1):
    """
    Sinh kịch bản hội thoại dựa trên lượt (turn). 
    Turn 1: Phá băng, Turn 2: Khai thác, Turn 3: Chốt hạ/Bài học EQ.
    """
    extra_context = SPECIFIC_NPC_CONTEXT.get(npc_name, "")
    
    # Xác định mục tiêu theo lượt để ép AI đi đúng hướng
    turn_goals = {
        1: "Khởi đầu nhẹ nhàng, quan sát thái độ. Đưa ra tình huống 'phá băng'.",
        2: "Đi sâu vào tâm tư hoặc mâu thuẫn. NPC bắt đầu đặt niềm tin hoặc thử thách.",
        3: "Tình huống quyết định để nhận được 'nguyên liệu kỹ năng'. Trả về feedback mang tính giáo dục EQ."
    }
    goal = turn_goals.get(turn, turn_goals[1])

    try:
        # Sử dụng model 2.0-flash để xử lý JSON và ngữ cảnh tốt hơn
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            config={
                'system_instruction': NPC_SYSTEM_PROMPT,
                'response_mime_type': 'application/json'
            },
            contents=(
                f"NPC: {npc_name}. Nguyên liệu đại diện: {ingredient}. "
                f"Lượt hiện tại: {turn}/3. Mục tiêu: {goal}. "
                f"Bối cảnh tâm lý: {extra_context}"
            )
        )
        
        if not response.text:
            raise ValueError("AI trả về rỗng")

        result = json.loads(response.text)
        
        # Bổ sung thông tin turn vào output để Backend/Frontend dễ xử lý
        result["turn"] = turn
        result["is_final_turn"] = (turn >= 3)
        
        return result

    except Exception as e:
        print(f"❌ Lỗi AI Service tại lượt {turn} của {npc_name}: {e}")
        # Fallback an toàn nếu AI lỗi
        return {
            "question": f"[Lượt {turn}] {npc_name} nhìn bạn chờ đợi. 'Cậu nghĩ sao về vấn đề này?'",
            "options": [
                {"text": "Lắng nghe và thấu hiểu", "type": "good", "feedback": "Bạn đang làm rất tốt việc phá băng!"},
                {"text": "Trả lời xã giao", "type": "neutral", "feedback": "Câu trả lời hơi nhạt, hãy cố gắng hơn."},
                {"text": "Ngắt lời NPC", "type": "bad", "feedback": "Kém duyên quá, NPC đang đóng lòng lại đấy."}
            ],
            "turn": turn,
            "is_final_turn": (turn >= 3)
        }

# Chạy thử để Member 2 kiểm soát nội dung
if __name__ == "__main__":
    async def test():
        print("--- TEST LƯỢT 1 (PHÁ BĂNG) ---")
        res1 = await generate_npc_dialog("Chị Lan", "Sự Thấu Cảm", turn=1)
        print(json.dumps(res1, indent=2, ensure_ascii=False))
        
        print("\n--- TEST LƯỢT 3 (CHỐT HẠ) ---")
        res3 = await generate_npc_dialog("Chị Lan", "Sự Thấu Cảm", turn=3)
        print(json.dumps(res3, indent=2, ensure_ascii=False))
        
    asyncio.run(test())