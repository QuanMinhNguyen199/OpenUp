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

app = FastAPI(title="Salted Coffee RPG API - Full Version")

# --- CẤU HÌNH CORS ---
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
            detail="Phiên đăng nhập hết hạn hoặc không hợp lệ!"
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
    if len(data.username) < 3 or not re.match("^[a-zA-Z0-9_]*$", data.username):
        raise HTTPException(status_code=400, detail="Username không hợp lệ!")
    
    if db.query(models.User).filter_by(username=data.username).first():
        raise HTTPException(status_code=400, detail="Tài khoản đã tồn tại!")

    random_token = secrets.token_hex(32)
    new_user = models.User(
        username=data.username,
        password_hash=get_password_hash(data.password),
        role="PLAYER",
        token=random_token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"status": "success", "user_id": new_user.id, "token": random_token}

@app.post("/api/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")
    
    random_token = secrets.token_hex(32)
    user.token = random_token
    db.commit()
    return {"status": "success", "user_id": user.id, "token": random_token, "username": user.username}

# --- ENDPOINTS GAMEPLAY (AI & NPC) ---

@app.get("/game/scenario/{npc_id}")
async def get_scenario(
    npc_id: int, 
    user_id: int, 
    turn: int = 1, # Thêm turn để AI biết đang ở lượt mấy (1, 2, hoặc 3)
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    verify_token(user_id, db, x_token)
    
    npc = db.query(models.NPC).get(npc_id)
    if not npc:
        raise HTTPException(status_code=404, detail="NPC không tồn tại!")

    # Member 2: Lấy nguyên liệu từ heirloom
    ingredient_name = npc.heirloom[0].name if npc.heirloom else "bí mật giao tiếp"
    
    # Gọi AI sinh nội dung (Member 1 nhớ cập nhật hàm generate_npc_dialog nhận thêm turn)
    ai_content = await generate_npc_dialog(npc.name, ingredient_name, turn)
    
    options = ai_content["options"]
    random.shuffle(options) 

    return {
        "npc_name": npc.name,
        "map_location": npc.map_location,
        "turn": turn, # Trả về turn để Frontend dễ quản lý
        "npc_question": ai_content["question"],
        "options": options
    }

@app.post("/game/choose-option")
def choose_option(
    npc_id: int, 
    option_type: str, 
    user_id: int, 
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    """
    option_type: 'good', 'neutral', 'bad'
    """
    verify_token(user_id, db, x_token)
    
    # Tìm hoặc tạo mới bản ghi hội thoại
    conv = db.query(models.Conversation).filter_by(user_id=user_id, npc_id=npc_id).first()
    if not conv:
        conv = models.Conversation(user_id=user_id, npc_id=npc_id, affinity_score=0.0)
        db.add(conv)

    # Tính điểm EQ theo thiết kế của Member 2
    points = {"good": 10.0, "neutral": 0.0, "bad": -10.0}
    bonus = points.get(option_type, 0.0)
    
    # Cập nhật điểm (Trigger trên Supabase sẽ tự động tặng đồ nếu chạm 100)
    conv.affinity_score = max(0, min(100, conv.affinity_score + bonus))
    
    db.commit()
    db.refresh(conv)

    return {
        "new_affinity": conv.affinity_score,
        "status": "success",
        "message": f"Điểm thiện cảm: {conv.affinity_score}/100"
    }

# --- ENDPOINT BOSS (DRAG & DROP) ---

@app.post("/game/boss-challenge")
async def boss_challenge(data: BossChallengeRequest, db: Session = Depends(get_db), x_token: str = Header(None)):
    # 1. Bảo mật
    verify_token(data.user_id, db, x_token)
    
    # 2. Gọi logic kiểm tra của Member 2
    result = check_boss_sequence(data.user_items)
    
    return result

@app.get("/api/user/codex/{user_id}")
def get_user_codex(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    verify_token(user_id, db, x_token)
    unlocked_ids = [c.collection_id for c in db.query(models.UserCollection).filter_by(user_id=user_id).all()]
    all_ingredients = db.query(models.Collection).order_by(models.Collection.step_order).all()
    
    return [{
        "id": item.id,
        "name": item.name if item.id in unlocked_ids else "???",
        "is_owned": item.id in unlocked_ids
    } for item in all_ingredients]

@app.get("/")
def read_root():
    return {"message": "API Salted Coffee is Online - Ready for Demo"}