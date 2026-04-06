from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    conversations = relationship("Conversation", back_populates="user")

class NPC(Base):
    __tablename__ = "npcs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    base_prompt = Column(Text)
    conversations = relationship("Conversation", back_populates="npc")
    # Thêm quan hệ với các tình huống hội thoại
    scenarios = relationship("DialogScenario", back_populates="npc")

class DialogScenario(Base):
    __tablename__ = "dialog_scenarios"
    id = Column(Integer, primary_key=True, index=True)
    npc_id = Column(Integer, ForeignKey("npcs.id"))
    npc_question = Column(Text, nullable=False)
    context = Column(Text)
    
    npc = relationship("NPC", back_populates="scenarios")
    options = relationship("DialogOption", back_populates="scenario")

class DialogOption(Base):
    __tablename__ = "dialog_options"
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("dialog_scenarios.id"))
    option_text = Column(String)
    is_correct = Column(Boolean, default=False)
    affinity_bonus = Column(Float, default=5.0)
    feedback = Column(String)

    scenario = relationship("DialogScenario", back_populates="options")

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    npc_id = Column(Integer, ForeignKey("npcs.id"))
    message = Column(Text)
    sender = Column(String) 
    affinity_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    npc = relationship("NPC", back_populates="conversations")