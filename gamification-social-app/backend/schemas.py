from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- 1. SCHEMAS CHO STORY MODE (AI) ---

class HistoryItem(BaseModel):
    role: str    # 'user' hoặc 'assistant'
    content: str

class StoryModeRequest(BaseModel):
    user_id: int
    index: int   # NPC Index (0-7)
    event: bool
    case: int
    history: List[HistoryItem]

# Schema cho Options trả về từ AI
class DialogOptionAI(BaseModel):
    option: str
    quantity: int

class StoryModeResponse(BaseModel):
    npc_behavior: str
    npc_say: str
    event: Optional[str] = None
    options: List[DialogOptionAI]

# --- 2. SCHEMAS CHO GAMEPLAY (HÀNH ĐỘNG CHỌN) ---

class ChoiceRequest(BaseModel):
    npc_id: int
    option_type: str # 'good', 'neutral', 'bad'
    user_id: int

class ChoiceResponse(BaseModel):
    new_affinity: float
    message: str
    is_chapter_completed: bool 
    is_failed: bool # Gộp chung cả Failed điểm <= 0 và Kicked
    current_level: int
    next_chapter_id: Optional[int] = None

# --- 3. SCHEMAS CHO BOSS (SLIDING PUZZLE) ---

class BossChallengeRequest(BaseModel):
    user_id: int
    user_tile_sequence: List[int] 

class BossResponse(BaseModel):
    is_correct: bool
    message: str
    status: str      # 'WIN' hoặc 'RETRY'
    correct_count: int

# --- 4. SCHEMAS CHO USER & COLLECTION ---

class UserStatusResponse(BaseModel):
    username: str
    current_chap: int
    level: int
    total_xp: int
    is_winner: bool

class CollectionItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_owned: bool
    target_idx: int 
    image_url: Optional[str]

    class Config:
        from_attributes = True # Cho phép Pydantic đọc dữ liệu từ SQLAlchemy Model

# --- 5. SCHEMAS CHO SINGLEPLAYER MODE (MEMBER 2) ---

class ChatHistory(BaseModel):
    role: str
    content: str

class SingleplayerRequest(BaseModel):
    user_id: int
    event: bool
    history: List[ChatHistory]
    num: List[int]