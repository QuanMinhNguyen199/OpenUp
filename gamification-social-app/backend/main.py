import hashlib
from fastapi import FastAPI, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re
import models, schemas, database 
import secrets

# Khởi tạo Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Communication RPG API - Salted Coffee Edition")

# --- CẤU HÌNH BẢO MẬT & HELPER ---

def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

def verify_token(user_id: int, db: Session, x_token: str = Header(None)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.token != x_token or x_token is None:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập hết hạn hoặc không hợp lệ!")
    return user

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class MixRecipeRequest(BaseModel):
    user_id: int
    ingredient_ids: List[int]

# --- ENDPOINTS AUTH ---

@app.post("/api/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Validate Username
    if len(data.username) < 3 or len(data.username) > 20:
        raise HTTPException(status_code=400, detail="Username từ 3-20 ký tự!")
    if not re.match("^[a-zA-Z0-9_]*$", data.username):
        raise HTTPException(status_code=400, detail="Username không chứa ký tự đặc biệt!")

    # 2. Validate Password
    if len(data.password) < 6 or not any(char.isdigit() for char in data.password):
         raise HTTPException(status_code=400, detail="Mật khẩu tối thiểu 6 ký tự và có ít nhất 1 số!")

    # 3. Check Duplicate
    if db.query(models.User).filter_by(username=data.username).first():
        raise HTTPException(status_code=400, detail="Tên tài khoản đã tồn tại!")
    
    # 4. Tạo User + Token (Vào game luôn)
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
    
    return {
        "status": "success",
        "user_id": new_user.id,
        "username": new_user.username,
        "token": random_token,
        "message": "Đăng ký thành công!"
    }

@app.post("/api/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")
    
    random_token = secrets.token_hex(32)
    user.token = random_token
    db.commit()
    
    return {
        "status": "success",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "token": random_token
    }

@app.post("/api/logout/{user_id}")
async def logout(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(user_id, db, x_token)
    user.token = None
    db.commit()
    return {"status": "success", "message": "Đã đăng xuất"}

# --- ENDPOINTS GAMEPLAY ---

@app.get("/game/scenario/{npc_id}")
def get_scenario(npc_id: int, user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    verify_token(user_id, db, x_token) # Bảo vệ API kịch bản
    
    scenario = db.query(models.DialogScenario).filter_by(npc_id=npc_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="NPC chưa có kịch bản!")

    # Member 2 sẽ update logic AI ở đây. Hiện tại lấy 3 lựa chọn từ DB.
    options = db.query(models.DialogOption).filter_by(scenario_id=scenario.id).limit(3).all()
    
    return {
        "scenario_id": scenario.id,
        "npc_question": scenario.npc_question,
        "options": [{"id": opt.id, "text": opt.option_text} for opt in options]
    }

@app.post("/game/choose-option")
def choose_option(option_id: int, user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    verify_token(user_id, db, x_token)
    
    option = db.query(models.DialogOption).get(option_id)
    if not option: raise HTTPException(status_code=404)

    # Lấy hoặc tạo Conversation mới
    conv = db.query(models.Conversation).filter_by(user_id=user_id, npc_id=option.scenario.npc_id).first()
    if not conv:
        conv = models.Conversation(user_id=user_id, npc_id=option.scenario.npc_id, affinity_score=50.0)
        db.add(conv)

    # Logic điểm: Đúng +20, Sai -10
    bonus = 20.0 if option.is_correct else -10.0
    conv.affinity_score = max(0, min(100, conv.affinity_score + bonus))
    conv.message = option.option_text
    conv.sender = "user"

    # Check mở khóa nguyên liệu (Mốc 80)
    unlocked = False
    if conv.affinity_score >= 80.0:
        item = option.scenario.npc.heirloom
        if item:
            exists = db.query(models.UserCollection).filter_by(user_id=user_id, collection_id=item.id).first()
            if not exists:
                db.add(models.UserCollection(user_id=user_id, collection_id=item.id))
                unlocked = True

    db.commit()
    return {
        "is_correct": option.is_correct,
        "new_affinity": conv.affinity_score,
        "feedback": option.feedback,
        "unlocked_item": unlocked
    }

@app.get("/api/user/codex/{user_id}")
def get_user_codex(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    verify_token(user_id, db, x_token)
    unlocked_ids = [c.collection_id for c in db.query(models.UserCollection).filter_by(user_id=user_id).all()]
    all_ingredients = db.query(models.Collection).order_by(models.Collection.step_order).all()
    
    return [{
        "id": item.id,
        "name": item.name if item.id in unlocked_ids else "???",
        "description": item.description if item.id in unlocked_ids else "Bí mật...",
        "is_owned": item.id in unlocked_ids
    } for item in all_ingredients]

@app.post("/api/game/mix-recipe")
def mix_recipe(data: MixRecipeRequest, db: Session = Depends(get_db), x_token: str = Header(None)):
    verify_token(data.user_id, db, x_token)
    correct_order = db.query(models.Collection).order_by(models.Collection.step_order).all()
    correct_ids = [c.id for c in correct_order]
    
    if data.ingredient_ids == correct_ids:
        return {"status": "SUCCESS", "message": "Cụ Phan gật đầu mãn nguyện!"}
    
    return {"status": "FAIL", "message": "Sai công thức rồi, xem lại Codex đi!"}

@app.get("/")
def read_root():
    return {"message": "API Salted Coffee is Online"}