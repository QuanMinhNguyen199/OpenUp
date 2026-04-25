from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="PLAYER") 
    token = Column(String, nullable=True)
    # level = Chapter hiện tại của người chơi (1, 2, 3...)
    chap = Column(Integer, default=1)  # Lưu Savepoint cốt truyện (1-8)
    level = Column(Integer, default=1) # Cấp độ RPG (tăng theo XP)
    total_xp = Column(Integer, default=0)
    
    conversations = relationship("Conversation", back_populates="user")
    collections = relationship("UserCollection", back_populates="user")

class NPC(Base):
    __tablename__ = "npcs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    base_prompt = Column(Text)
    map_location = Column(String, default="Cafe")
    
    conversations = relationship("Conversation", back_populates="npc")
    scenarios = relationship("DialogScenario", back_populates="npc")
    heirloom = relationship("Collection", back_populates="npc", uselist=False)

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
    option_type = Column(String, default="neutral") 
    feedback = Column(String) 

    scenario = relationship("DialogScenario", back_populates="options")

class Collection(Base):
    __tablename__ = "collections"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) 
    description = Column(Text)
    npc_id = Column(Integer, ForeignKey("npcs.id"))
    
    # MỚI: Vị trí đúng trong Sliding Puzzle (0-8)
    target_idx = Column(Integer, nullable=True) 
    
    # Vẫn giữ để làm thứ tự thu thập nếu cần
    step_order = Column(Integer, nullable=True) 
    required_affinity = Column(Float, default=100.0) 

    npc = relationship("NPC", back_populates="heirloom")
    owners = relationship("UserCollection", back_populates="collection")

class UserCollection(Base):
    __tablename__ = "user_collections"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), primary_key=True)
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="collections")
    collection = relationship("Collection", back_populates="owners")

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    npc_id = Column(Integer, ForeignKey("npcs.id"))
    neutral_streak = Column(Integer, default=0)
    
    affinity_score = Column(Float, default=0.0) 
    current_turn = Column(Integer, default=1) 
    
    last_interaction = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    npc = relationship("NPC", back_populates="conversations")