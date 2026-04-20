from pydantic import BaseModel
from typing import List, Optional

# --- SCHEMAS CHO AI & NPC DIALOG ---

class DialogOptionSchema(BaseModel):
    text: str
    option_type: str  # 'good', 'neutral', 'bad'
    feedback: str     # Giải thích tại sao (dành cho mục đích giáo dục EQ)

class NPCScenarioResponse(BaseModel):
    npc_name: str
    map_location: str
    turn: int         # Lượt hiện tại (1, 2, 3)
    is_final_turn: bool # Đánh dấu lượt cuối để Frontend biết khi nào kết thúc phiên
    question: str
    options: List[DialogOptionSchema]

# --- SCHEMAS CHO GAMEPLAY ---

class ChoiceRequest(BaseModel):
    npc_id: int
    user_id: int
    option_type: str 
    current_turn: int # Gửi kèm turn để DB cập nhật lượt hội thoại

class ChoiceResponse(BaseModel):
    new_affinity: float
    npc_feedback: str   # "Ồ, em thấu hiểu chị quá..."
    system_message: str # "Điểm thiện cảm +10. Bạn đang ở lượt 2/3."
    unlocked_item: bool
    item_name: Optional[str] = None # Tên vật phẩm nếu vừa được mở khóa

# --- SCHEMAS CHO BOSS (DRAG & DROP) ---

class BossChallengeRequest(BaseModel):
    user_id: int
    # Gửi List ID để đảm bảo tính chính xác kỹ thuật
    user_item_ids: List[int] 

class BossResponse(BaseModel):
    is_correct: bool
    message: str       # Lời mắng hoặc khen của Cụ Phan
    status: str        # 'WIN' hoặc 'RETRY'

# --- SCHEMAS CHO USER & COLLECTION ---

class CollectionItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_owned: bool
    step_order: Optional[int] # Để Frontend biết thứ tự sắp xếp trong túi đồ

    class Config:
        from_attributes = True