from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Float
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    # Quan hệ: Một user có nhiều hội thoại
    conversations = relationship("Conversation", back_populates="user")

class NPC(Base):
    __tablename__ = "npcs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    base_prompt = Column(Text)
    conversations = relationship("Conversation", back_populates="npc")

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Đã có bảng users để trỏ tới
    npc_id = Column(Integer, ForeignKey("npcs.id"))
    message = Column(Text)
    sender = Column(String) # "user" hoặc "npc"
    affinity_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    npc = relationship("NPC", back_populates="conversations")