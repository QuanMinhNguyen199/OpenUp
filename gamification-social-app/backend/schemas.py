from pydantic import BaseModel
from typing import List, Optional

# --- SCHEMAS CHO AI & NPC DIALOG ---

class DialogOptionSchema(BaseModel):
    text: str
    option_type: str  # 'good', 'neutral', 'bad'
    feedback: str     # Giải thích lý do EQ

class NPCScenarioResponse(BaseModel):
    npc_name: str
    map_location: str
    turn: int
    is_final_turn: bool
    question: str
    options: List[DialogOptionSchema]
    current_user_chapter: int # Để FE đồng bộ bối cảnh

# --- SCHEMAS CHO GAMEPLAY ---

class ChoiceRequest(BaseModel):
    npc_id: int
    user_id: int
    option_type: str 
    current_turn: int

class ChoiceResponse(BaseModel):
    new_affinity: float
    message: str  # Gộp chung phản hồi để Frontend dễ hiển thị thành 1 popup
    # --- THÔNG TIN VẬT PHẨM ---
    unlocked_item: bool = False
    item_name: Optional[str] = None
    # --- CÁC CỜ TRẠNG THÁI (Dành cho Member 3 điều hướng UI) ---
    is_chapter_completed: bool 
    is_chapter_failed: bool
    is_kicked: bool
    # --- TIẾN TRÌNH CỦA NGƯỜI CHƠI ---
    next_chapter_id: Optional[int] = None # Dùng 'chap' làm savepoint
    current_level: int

# --- SCHEMAS CHO BOSS (SLIDING PUZZLE) ---
class BossChallengeRequest(BaseModel):
    user_id: int
    # Danh sách ID mảnh ghép theo thứ tự người chơi trượt (từ ô 0 đến 8)
    user_tile_sequence: List[int] 

class BossResponse(BaseModel):
    is_correct: bool
    message: str       # Lời thoại Cụ Phan
    status: str        # 'WIN' hoặc 'RETRY'
    correct_count: int # Số lượng mảnh đã nằm đúng vị trí (để làm thanh tiến độ)

# --- SCHEMAS CHO USER & COLLECTION ---

class CollectionItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_owned: bool
    # MỚI: Vị trí đúng trên lưới 3x3 (0 đến 8)
    target_idx: int 
    image_url: Optional[str] # URL mảnh cắt của bức tranh

    class Config:
        from_attributes = True