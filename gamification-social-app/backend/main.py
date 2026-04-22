import hashlib
import re
import secrets
from typing import List, Optional
import random

from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models, schemas, database
from boss_logic import check_boss_sequence
from ai_service import generate_npc_dialog

# Khởi tạo Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="OpenUp! Social RPG API - Chapter System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://a20-app-061.onrender.com", "http://localhost:3000"],  # Khi deploy thật hãy thay "*" bằng URL của Vercel
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

def verify_token(user_id: int, db: Session, x_token: str = Header(None)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.token != x_token or x_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Phiên đăng nhập hết hạn!"
        )
    return user

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

                    role="ADMIN"

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

class BossChallengeRequest(BaseModel):
    user_id: int
    user_items: List[str]

# --- ENDPOINTS AUTH ---
@app.post("/api/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Validate Username (Thêm lowercase để tránh tạo 2 account "Admin" và "admin")
    clean_username = data.username.strip().lower()
    if len(clean_username) < 3 or not re.match("^[a-zA-Z0-9_]*$", clean_username):
        raise HTTPException(status_code=400, detail="Username không hợp lệ (tối thiểu 3 ký tự, không dấu)!")
    
    if db.query(models.User).filter_by(username=clean_username).first():
        raise HTTPException(status_code=400, detail="Tài khoản này đã có người sử dụng!")

    # 2. Tạo Token và User mới
    random_token = secrets.token_hex(32)
    new_user = models.User(
        username=clean_username,
        password_hash=get_password_hash(data.password),
        role="PLAYER",
        token=random_token,
        level=1, # Đảm bảo bắt đầu từ Chap 1
        total_xp=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "status": "success", 
        "user_id": new_user.id, 
        "token": random_token,
        "current_chapter": new_user.level
    }

@app.post("/api/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    clean_username = data.username.strip().lower()
    user = db.query(models.User).filter_by(username=clean_username).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không chính xác")
    
    # Tạo token mới mỗi lần login để đảm bảo an toàn
    random_token = secrets.token_hex(32)
    user.token = random_token
    db.commit()
    
    return {
        "status": "success", 
        "user_id": user.id, 
        "token": random_token, 
        "username": user.username,
        "current_chapter": user.level # Trả về level để Frontend load Map
    }

# --- ENDPOINTS GAMEPLAY (CHAPTER LOGIC) ---

@app.get("/game/scenario/{npc_id}")
async def get_scenario(
    npc_id: int, 
    user_id: int, 
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(user_id, db, x_token)
    
    # 1. Kiểm tra quyền vào Chapter (Chặn nhảy cóc)
    if npc_id > user.level and npc_id != 8:
        raise HTTPException(status_code=403, detail="Bạn chưa mở khóa Chapter này!")

    # 2. Lấy hội thoại hiện tại hoặc tạo mới
    conv = db.query(models.Conversation).filter_by(user_id=user_id, npc_id=npc_id).first()
    if not conv:
        conv = models.Conversation(user_id=user_id, npc_id=npc_id, affinity_score=20.0)
        db.add(conv)
        db.commit()
        db.refresh(conv)

    npc = db.query(models.NPC).get(npc_id)
    if not npc:
        raise HTTPException(status_code=404, detail="NPC không tồn tại!")

    artifact_name = npc.heirloom.name if npc.heirloom else "Mảnh ghép tri thức"
    
    # Gọi AI sinh nội dung dựa trên lượt hiện tại của User với NPC này
    ai_content = await generate_npc_dialog(npc.name, artifact_name, conv.current_turn)
    
    options = ai_content["options"]
    random.shuffle(options) 

    return {
        "npc_name": npc.name,
        "map_location": npc.map_location,
        "turn": conv.current_turn,
        "npc_question": ai_content["question"],
        "options": options,
        "current_affinity": conv.affinity_score
    }

@app.post("/game/choose-option")
def choose_option(
    npc_id: int, 
    option_type: str, 
    user_id: int, 
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(user_id, db, x_token)
    
    conv = db.query(models.Conversation).filter_by(user_id=user_id, npc_id=npc_id).first()
    if not conv:
        conv = models.Conversation(user_id=user_id, npc_id=npc_id, affinity_score=20.0)
        db.add(conv)

    # 1. Xử lý Neutral Streak (Chống Loop)
    if option_type == "neutral":
        conv.neutral_streak += 1
    else:
        conv.neutral_streak = 0

    # 2. Định nghĩa bảng điểm
    points = {"good": 10.0, "neutral": 0.0, "bad": -25.0} # Phạt Bad nặng để tăng kịch tính
    bonus = points.get(option_type, 0.0)
    
    potential_score = conv.affinity_score + bonus
    
    is_chapter_failed = False
    is_kicked = False
    unlocked_new_chapter = False
    message = ""

    # 3. KIỂM TRA ĐIỀU KIỆN THẤT BẠI
    if potential_score <= 0:
        is_chapter_failed = True
        conv.affinity_score = 20.0  # Reset Chapter hiện tại về điểm vốn
        conv.current_turn = 1       # Reset về lượt đầu
        conv.neutral_streak = 0
        message = "Thất bại! NPC đã mất sạch lòng tin. Bạn phải làm lại Chapter này từ đầu."
    
    elif conv.neutral_streak >= 3:
        is_kicked = True
        conv.affinity_score = max(0, conv.affinity_score - 10.0)
        conv.current_turn = 1 
        conv.neutral_streak = 0
        message = "NPC cảm thấy bạn quá hời hợt và không muốn tiếp chuyện nữa."

    # 4. KIỂM TRA ĐIỀU KIỆN THÀNH CÔNG
    else:
        conv.affinity_score = min(100, potential_score)
        
        if conv.affinity_score >= 100 and user.level == npc_id:
            user.level += 1  # Auto-save: Tiến trình tổng tăng lên
            user.total_xp += 100
            unlocked_new_chapter = True
            conv.current_turn = 1 # Reset lượt cho lần gặp sau (nếu có)
            message = "Chúc mừng! Bạn đã nhận được mảnh ghép và mở khóa Chapter tiếp theo!"
        else:
            conv.current_turn += 1
            message = f"Thiện cảm: {conv.affinity_score}/100"

    db.commit()

    return {
        "new_affinity": conv.affinity_score,
        "is_chapter_completed": unlocked_new_chapter,
        "is_chapter_failed": is_chapter_failed,
        "is_kicked": is_kicked,
        "next_chapter_id": user.level if unlocked_new_chapter else None,
        "message": message
    }

# --- ENDPOINT BOSS (SLIDING PUZZLE) ---

@app.post("/game/boss-challenge")
async def boss_challenge(
    user_id: int, 
    user_tile_sequence: List[int], # ID các mảnh theo thứ tự từ ô 0-8
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(user_id, db, x_token)
    
    if user.level < 8:
        raise HTTPException(status_code=400, detail="Cháu chưa đủ trải nghiệm để gặp ta!")

    # Member 2 check logic puzzle trượt hình
    result = check_boss_sequence(user_tile_sequence)
    
    if result["is_correct"]:
        user.level = 9 # Trạng thái phá đảo Chapter 1
        db.commit()

    return result

@app.get("/api/user/status/{user_id}")
def get_user_status(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(user_id, db, x_token)
    return {
        "username": user.username,
        "current_chapter": user.level,
        "total_xp": user.total_xp,
        "is_finished_v1": user.level >= 9
    }

@app.get("/")
def read_root():
    return {"message": "OpenUp! Engine - Social RPG Logic Online"}