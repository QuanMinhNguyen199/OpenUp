"""
Basic agent loop using the Anthropic Claude API.
Receives user input, calls tools as needed, and returns results.
"""

import json
import logging
import os
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

from anthropic import Anthropic
from google import genai  
from google.genai import types
from .config import ANTHROPIC_API_KEY, GEMINI_API_KEY, DEFAULT_MODEL, LOG_LEVEL, is_valid_anthropic_key
from .tools import get_tool_schemas, execute_tool

logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an intelligent AI assistant.
You can use the provided tools to complete tasks.
Think step by step and use tools when necessary."""

VN_TZ = timezone(timedelta(hours=7))


def git(cmd: str) -> str:
    try:
        return subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def log_terminal_chat(prompt: str, response: str, event_type: str = "TerminalChat") -> None:
    entry = {
        "ts": datetime.now(VN_TZ).isoformat(),
        "tool": "terminal-agent",
        "event": event_type,
        "session_id": "",
        "model": DEFAULT_MODEL,
        "repo": git("git remote get-url origin").split("/")[-1].replace(".git", ""),
        "branch": git("git rev-parse --abbrev-ref HEAD"),
        "commit": git("git rev-parse --short HEAD"),
        "student": git("git config user.email"),
        "prompt": prompt[:1000],
        "response_summary": response[:1000],
    }
    log_dir = Path(os.getenv("AI_LOG_DIR", ".ai-log"))
    log_dir.mkdir(exist_ok=True)
    with open(log_dir / "session.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def create_agent():
    # 1. Thử Anthropic trước
    if ANTHROPIC_API_KEY and ANTHROPIC_API_KEY.startswith("sk-ant"):
        try:
            return {"client": Anthropic(api_key=ANTHROPIC_API_KEY), "type": "anthropic"}
        except: pass

    # 2. Sử dụng google-genai (SDK v2)
    if GEMINI_API_KEY:
        # Trong bản mới, ta tạo Client thay vì dùng genai.configure
        client = genai.Client(api_key=GEMINI_API_KEY, http_options={'api_version': 'v1beta'})
        logger.info("Đã khởi tạo Google GenAI Client (v2) thành công.")
        return {"client": client, "type": "gemini"}
    
    raise ValueError("Không tìm thấy API Key hợp lệ.")


def run_agent_loop(agent_data: dict, user_input: str, max_turns: int = 10) -> str:
    client = agent_data["client"]
    is_gemini = agent_data["type"] == "gemini"
    
    # 1. Khởi tạo cấu trúc lịch sử cho từng loại Model
    # Với Gemini v2, ta sẽ dùng list các object Content
    gemini_history = [] 
    # Với Anthropic, ta dùng list các dict đơn giản
    anthropic_messages = [{"role": "user", "content": user_input}]

    # Biến để theo dõi input của từng lượt (đặc biệt quan trọng cho Gemini khi loop tool)
    current_input = user_input

    for turn in range(max_turns):
        turn_info = f"Turn {turn + 1}/{max_turns}"
        logger.info(f"[{agent_data['type'].upper()}] {turn_info}")

        try:
            # --- BƯỚC 1: AI SUY NGHĨ ---
            if is_gemini:
                # Cú pháp SDK v2: dùng client.models.generate_content
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=gemini_history + [types.Content(role="user", parts=[types.Part(text=current_input)])],
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        tools=[types.Tool(function_declarations=get_tool_schemas())]
                    )
                )
                ai_content = response.candidates[0].content
                # v2 dùng check function_call trực tiếp trên các parts
                has_function = any(part.function_call for part in ai_content.parts)
                stop_reason = "tool_use" if has_function else "end_turn"
            else:
                response = client.messages.create(
                    model=DEFAULT_MODEL,
                    max_tokens=4096,
                    system=SYSTEM_PROMPT,
                    tools=get_tool_schemas(),
                    messages=anthropic_messages,
                )
                ai_content = response.content
                stop_reason = response.stop_reason

            # AUTO LOGGING cho trường track
            log_terminal_chat(
                prompt=f"[{turn_info}] {agent_data['type'].upper()} Thinking...",
                response=f"Stop Reason: {stop_reason}",
                event_type="AI_THOUGHT"
            )

            # --- BƯỚC 2: XỬ LÝ KẾT THÚC ---
            if stop_reason == "end_turn":
                final_text = response.text if is_gemini else "".join([b.text for b in ai_content if hasattr(b, "text")])
                log_terminal_chat(user_input, final_text, event_type="FINAL_RESPONSE")
                return final_text

            # --- BƯỚC 3: XỬ LÝ TOOL CALLS ---
            if is_gemini:
                # Gemini v2 yêu cầu: Cất câu trả lời của Assistant vào history trước
                gemini_history.append(types.Content(role="user", parts=[types.Part(text=current_input)]))
                gemini_history.append(ai_content)
                
                tool_parts = []
                for part in ai_content.parts:
                    if part.function_call:
                        name = part.function_call.name
                        args = part.function_call.args
                        logger.info(f"🚀 [AUTO-TRACK] Gemini v2 Calling: {name}")
                        
                        result = execute_tool(name, args)
                        
                        log_terminal_chat(f"Tool: {name}", f"Result: {str(result)[:200]}", "TOOL_LOG")
                        
                        # Tạo part phản hồi kết quả tool theo chuẩn v2
                        tool_parts.append(types.Part.from_function_response(
                            name=name,
                            response={"result": result}
                        ))
                
                # Turn sau của Gemini sẽ là danh sách các kết quả Tool
                # Lưu ý: SDK v2 thường yêu cầu gửi lại toàn bộ history
                gemini_history.append(types.Content(role="tool", parts=tool_parts))
                # Reset current_input vì ta đã đẩy vào history rồi
                current_input = "Hãy xử lý tiếp kết quả trên." 

            else:
                tool_results = []
                for block in ai_content:
                    if block.type == "tool_use":
                        logger.info(f"🚀 [AUTO-TRACK] Anthropic Calling: {block.name}")
                        result = execute_tool(block.name, block.input)
                        log_terminal_chat(f"Tool: {block.name}", f"Result: {str(result)[:200]}", "TOOL_LOG")
                        
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(result),
                        })
                
                anthropic_messages.append({"role": "assistant", "content": ai_content})
                anthropic_messages.append({"role": "user", "content": tool_results})

        except Exception as e:
            error_msg = f"Lỗi tại {turn_info}: {str(e)}"
            logger.error(error_msg)
            return error_msg

    return "Đã đạt giới hạn lượt xử lý (Max turns)."

def main():
    try:
        # Nhận dict chứa client và type
        agent_data = create_agent()
        
        print(f"Agentic App - Mode: {agent_data['type'].upper()}")
        print("-" * 50)

        while True:
            user_input = input("\nYou: ").strip()
            if not user_input or user_input.lower() in ("quit", "exit", "q"):
                break

            response = run_agent_loop(agent_data, user_input)
            print(f"\nAgent: {response}")
            
    except Exception as e:
        print(f"Không thể khởi động App: {e}")


if __name__ == "__main__":
    main()
