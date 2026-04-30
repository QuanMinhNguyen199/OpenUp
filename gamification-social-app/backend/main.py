import hashlib
import re
import secrets
from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
import random
from redis_client import update_leaderboard
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models, schemas, database
from boss_logic import check_boss_sequence
from ai_service import gen_dialogue_story_mode
# Khởi tạo Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="OpenUp! Social RPG API - Final Secure Version")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://a20-app-061.onrender.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER FUNCTIONS ---

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

def is_strong_password(password: str) -> bool:
    if len(password) < 6:
        return False
    return bool(re.search(r"[a-zA-Z]", password) and re.search(r"\d", password))

def verify_token(user_id: int, db: Session, x_token: str = Header(None)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.token != x_token or x_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn!"
        )
    return user

def calculate_level(total_xp: int) -> int:
    if total_xp < 200:
        return 1
    # Mốc Level 2 là 200 XP, Level 3 là 300 XP... (mỗi mức cách nhau 100)
    return total_xp // 100

# --- TỰ ĐỘNG TẠO ADMIN ---

@app.on_event("startup")
async def startup_event():
    db = database.SessionLocal()
    try:
        default_admins = [
            {"username": "admin_quan", "password": "123456"},
            {"username": "admin_tri", "password": "654321"}
        ]
        for admin in default_admins:
            exists = db.query(models.User).filter_by(username=admin["username"]).first()
            if not exists:
                new_admin = models.User(
                    username=admin["username"],
                    password_hash=get_password_hash(admin["password"]),
                    role="ADMIN",
                    chap=9 # Admin mở full chap
                )
                db.add(new_admin)
        db.commit()
    except Exception as e:
        print(f"Lỗi khởi tạo Admin: {e}")
    finally:
        db.close()

# --- SCHEMAS ---
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class History(TypedDict):
    role: str
    content: str

class StoryModeRequest(BaseModel):
    user_id: int
    index: int # NPC Index (0-7)
    event: bool
    case: int
    history: List[History]

# --- ENDPOINTS AUTH ---

@app.post("/api/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    clean_username = data.username.strip().lower()
    if len(clean_username) < 3 or not re.match("^[a-zA-Z0-9_]*$", clean_username):
        raise HTTPException(status_code=400, detail="Username không hợp lệ!")
    
    if db.query(models.User).filter_by(username=clean_username).first():
        raise HTTPException(status_code=400, detail="Tên tài khoản đã tồn tại!")
    
    if not is_strong_password(data.password):
        raise HTTPException(status_code=400, detail="Mật khẩu quá yếu!")

    random_token = secrets.token_hex(32)
    new_user = models.User(
        username=clean_username,
        password_hash=get_password_hash(data.password),
        role="PLAYER",
        token=random_token,
        chap=1, 
        total_xp=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"status": "success", "user_id": new_user.id, "token": random_token}

@app.post("/api/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    clean_username = data.username.strip().lower()
    user = db.query(models.User).filter_by(username=clean_username).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập!")
    
    random_token = secrets.token_hex(32)
    user.token = random_token
    db.commit()
    
    return {
        "status": "success", 
        "user_id": user.id, 
        "token": random_token, 
        "username": user.username,
        "current_chap": user.chap
    }

# --- ENDPOINTS GAMEPLAY ---

@app.post("/story_mode")
async def story_mode(
    data: StoryModeRequest,
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(data.user_id, db, x_token)
    
    # Bảo mật: Chặn nhảy chap
    if data.index < 0 or data.index > 7:
        raise HTTPException(status_code=400, detail="NPC không tồn tại!")
    elif data.index + 1 > user.chap:
        raise HTTPException(status_code=403, detail="Chưa mở khóa chương này!")

    # Gọi AI sinh kịch bản
    result = await gen_dialogue_story_mode(
        index=data.index,
        event=data.event,
        case=data.case,
        history=data.history
    )
    
    # KHÓA CHÉO: Đánh dấu đang chờ trả lời cho NPC này
    npc_id = data.index + 1
    conv = db.query(models.Conversation).filter_by(user_id=user.id, npc_id=npc_id).first()
    if not conv:
        conv = models.Conversation(user_id=user.id, npc_id=npc_id, affinity_score=20.0)
        db.add(conv)
    
    conv.is_waiting_for_reply = True # Mở khóa cho hàm choose_option
    db.commit()
    
    return result

@app.post("/game/choose-option")
def choose_option(
    npc_id: int, 
    option_type: str, 
    user_id: int, 
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(user_id, db, x_token)
    
    # 1. Chặn dùng mồm vượt Boss
    if npc_id == 8:
        raise HTTPException(status_code=403, detail="Màn Boss yêu cầu giải đố, không thể chat!")

    conv = db.query(models.Conversation).filter_by(user_id=user_id, npc_id=npc_id).first()
    
    # 2. KIỂM TRA KHÓA CHÉO (Phải gọi story_mode trước)
    if not conv or not getattr(conv, 'is_waiting_for_reply', True):
        raise HTTPException(status_code=403, detail="Bạn phải đọc kịch bản trước khi chọn!")

    # 3. CHỐNG SPAM (2 giây)
    now = datetime.utcnow()
    if hasattr(conv, 'last_interaction') and conv.last_interaction:
        if (now - conv.last_interaction).total_seconds() < 2:
            raise HTTPException(status_code=429, detail="Bình tĩnh, đừng bấm quá nhanh!")
    
    conv.last_interaction = now

    # Logic tính điểm (Backend độc tài quyết định)
    points = {"good": 10.0, "neutral": 0.0, "bad": -25.0}
    bonus = points.get(option_type, 0.0)
    potential_score = conv.affinity_score + bonus
    
    # Xử lý Neutral Streak
    conv.neutral_streak = (conv.neutral_streak + 1) if option_type == "neutral" else 0

    message = ""
    is_failed = False
    is_completed = False

    if potential_score <= 0:
        is_failed = True
        conv.affinity_score = 20.0
        conv.current_turn = 1
        message = "NPC thất vọng hoàn toàn. Làm lại từ đầu chap nhé!"
    elif conv.neutral_streak >= 3:
        is_failed = True
        conv.affinity_score = max(0, conv.affinity_score - 10)
        conv.current_turn = 1
        message = "Bạn quá hời hợt, NPC không muốn tiếp chuyện nữa."
    else:
        conv.affinity_score = min(100, potential_score)
        if conv.affinity_score >= 100 and user.chap == npc_id:
            user.chap += 1
            user.total_xp += 150
            update_leaderboard(user.username, user.total_xp)
            user.level = calculate_level(user.total_xp)
            is_completed = True
            message = f"Tuyệt vời! Mở khóa Chapter {user.chap}!"
        else:
            conv.current_turn += 1
            message = f"Điểm hiện tại: {conv.affinity_score}/100"

    # Đóng khóa chéo: Phải gọi story_mode lại mới được chọn tiếp
    conv.is_waiting_for_reply = False 
    db.commit()

    return {
        "new_affinity": conv.affinity_score,
        "is_chapter_completed": is_completed,
        "is_failed": is_failed,
        "current_level": user.level,
        "message": message
    }

@app.post("/game/boss-challenge")
async def boss_challenge(
    user_id: int, 
    user_tile_sequence: List[int], 
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(user_id, db, x_token)
    
    if user.chap < 8:
        raise HTTPException(status_code=400, detail="Chưa đủ trình gặp Boss!")

    result = check_boss_sequence(user_tile_sequence)
    
    if result["is_correct"]:
        user.chap = 9 # Phá đảo
        user.total_xp += 500
        user.level = calculate_level(user.total_xp)
        db.commit()

    return result

@app.get("/api/user/status/{user_id}")
def get_user_status(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(user_id, db, x_token)
    return {
        "username": user.username,
        "current_chap": user.chap,
        "level": user.level,
        "total_xp": user.total_xp,
        "is_winner": user.chap >= 9,
        "role": user.role
    }

@app.get("/")
def read_root():
    return {"message": "OpenUp! Engine - Secure Mode Online"}


# SINGLEPLAYER MODE, don't fix code below unless you are coding this mode
