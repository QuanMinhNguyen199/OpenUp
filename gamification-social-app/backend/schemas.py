from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Schema cho tin nhắn
class MessageBase(BaseModel):
    message: str
    npc_id: int

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: int
    sender: str
    message: str
    affinity_score: float
    created_at: datetime

    class Config:
        from_attributes = True # Cho phép làm việc với SQLAlchemy model

class UserResponse(BaseModel):
    id: int
    username: str
    level: int
    total_xp: int

    class Config:
        from_attributes = True
