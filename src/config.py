import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "claude-sonnet-4-20250514")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


def is_valid_anthropic_key(key: str) -> bool:
    # Nếu bạn muốn bỏ qua lỗi 'invalid' để chạy thử, hãy sửa thành:
    return bool(key) and key != "your-anthropic-key"
