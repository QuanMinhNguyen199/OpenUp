from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- SCHEMAS CHO AI & NPC DIALOG ---

class DialogOptionSchema(BaseModel):
    text: str
    option_type: str  # 'good', 'neutral', 'bad'
    feedback: str

class NPCScenarioResponse(BaseModel):
    npc_name: str
    map_location: str
    question: str
    options: List[DialogOptionSchema]

# --- SCHEMAS CHO GAMEPLAY ---

class ChoiceRequest(BaseModel):
    npc_id: int
    user_id: int
    option_type: str # Frontend gửi về 'good', 'neutral' hoặc 'bad'

class ChoiceResponse(BaseModel):
    new_affinity: float
    feedback: str
    unlocked_item: bool
    message: str # Thông báo ví dụ: "Bạn nhận được Muối biển!"

# --- SCHEMAS CHO BOSS (DRAG & DROP) ---

class BossChallengeRequest(BaseModel):
    user_id: int
    # Danh sách tên nguyên liệu hoặc ID theo thứ tự người chơi xếp
    user_items: List[str] 

class BossResponse(BaseModel):
    is_correct: bool
    message: str
    status: str # 'WIN' hoặc 'RETRY'

# --- SCHEMAS CHO USER & COLLECTION ---

class UserResponse(BaseModel):
    id: int
    username: str
    level: int
    total_xp: int

    class Config:
        from_attributes = True

class CollectionItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_owned: bool

    class Config:
        from_attributes = True