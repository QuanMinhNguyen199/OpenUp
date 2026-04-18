import os
import json
import asyncio
from google import genai
from dotenv import load_dotenv
from prompts import NPC_SYSTEM_PROMPT, SPECIFIC_NPC_CONTEXT

load_dotenv()

# Sử dụng API Key từ file .env
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_npc_dialog(npc_name: str, ingredient: str):
    """
    Hàm gọi AI để sinh kịch bản hội thoại dựa trên tính cách NPC và nguyên liệu.
    """
    # Lấy ngữ cảnh bổ sung để AI tạo các câu trả lời "gây lú"
    extra_context = SPECIFIC_NPC_CONTEXT.get(npc_name, "")
    
    try:
        # Gọi model Gemini (Khuyên dùng gemini-1.5-flash cho tốc độ nhanh hoặc 2.0-flash nếu đã có)
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            config={
                'system_instruction': NPC_SYSTEM_PROMPT,
                'response_mime_type': 'application/json'
            },
            contents=f"NPC: {npc_name}. Nguyên liệu: {ingredient}. Lưu ý kỹ thuật: {extra_context}"
        )
        
        # Chuyển đổi phản hồi từ JSON string sang Python Dictionary
        result = json.loads(response.text)
        return result

    except Exception as e:
        print(f"Lỗi AI Service: {e}")
        # Fallback (Dự phòng) nếu AI lỗi để game không bị crash
        return {
            "question": f"Chào cậu, cậu muốn hỏi tôi về {ingredient} phải không?",
            "options": [
                {"text": "Đúng vậy, tôi muốn học", "type": "good", "feedback": "Rất tốt!"},
                {"text": "Cũng bình thường thôi", "type": "neutral", "feedback": "Vậy à..."},
                {"text": "Tôi không quan tâm lắm", "type": "bad", "feedback": "Thế thì về đi!"}
            ]
        }

# Đoạn mã chạy thử để kiểm tra (có thể xóa khi chạy chính thức)
if __name__ == "__main__":
    async def test():
        print(await generate_npc_dialog("Anh Minh", "Bột Cà Phê Robusta"))
    asyncio.run(test())