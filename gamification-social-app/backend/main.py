import hashlib
from fastapi import FastAPI, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import List
import re
import models, schemas, database 
import secrets

# Khởi tạo Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Communication RPG API - Salted Coffee Edition")

# --- CẤU HÌNH BẢO MẬT ---
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    
)

def get_password_hash(password: str):
    """Băm mật khẩu bằng SHA-256 (An toàn và không lỗi trên Windows)"""
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

# --- TỰ ĐỘNG TẠO 2 ADMIN MẶC ĐỊNH ---
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
                # Dùng hàm băm mới
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

# --- ENDPOINTS ---

@app.post("/api/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Sai tài khoản hoặc mật khẩu"
        )
    random_token = secrets.token_hex(32) # Tạo chuỗi 64 ký tự ngẫu nhiên
    user.token = random_token # Lưu token vào database
    db.commit()
    
    return {
        "status": "success",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "token": random_token
    }

@app.post("/api/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # --- 1. KIỂM TRA USERNAME ---
    if len(data.username) < 3 or len(data.username) > 20:
        raise HTTPException(status_code=400, detail="Tên tài khoản phải từ 3 đến 20 ký tự!")
    
    if not re.match("^[a-zA-Z0-9_]*$", data.username):
        raise HTTPException(status_code=400, detail="Tên tài khoản chỉ được chứa chữ, số và dấu gạch dưới (_)")

    # --- 2. KIỂM TRA MẬT KHẨU (PASSWORD) ---
    # Độ dài từ 6 - 50 ký tự
    if len(data.password) < 6 or len(data.password) > 50:
        raise HTTPException(status_code=400, detail="Mật khẩu phải có độ dài từ 6 đến 50 ký tự!")
    
    # Không cho phép chứa khoảng trắng
    if " " in data.password:
        raise HTTPException(status_code=400, detail="Mật khẩu không được chứa khoảng trắng!")

    # (Tùy chọn) Kiểm tra mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số
    if not any(char.isdigit() for char in data.password) or not any(char.isalpha() for char in data.password):
         raise HTTPException(status_code=400, detail="Mật khẩu phải bao gồm cả chữ và số để đảm bảo an toàn!")

    # --- 3. KIỂM TRA TRÙNG LẶP ---
    existing_user = db.query(models.User).filter(models.User.username == data.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên tài khoản đã tồn tại!")
    
    # --- 4. TẠO USER ---
    new_user = models.User(
        username=data.username,
        password_hash=get_password_hash(data.password),
        role="PLAYER" 
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "status": "success",
            "message": "Đăng ký tài khoản thành công!",
            "user_id": new_user.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi database: {e}")

@app.get("/game/scenario/{npc_id}")
def get_scenario(npc_id: int, db: Session = Depends(get_db)):
    # 1. Tìm kịch bản dựa trên npc_id
    scenario = db.query(models.DialogScenario).filter(models.DialogScenario.npc_id == npc_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="NPC này chưa có kịch bản trong Database!")

    # 2. Lấy các lựa chọn (options) đi kèm với kịch bản đó
    options = db.query(models.DialogOption).filter(models.DialogOption.scenario_id == scenario.id).all()
    
    return {
        "scenario_id": scenario.id,
        "npc_question": scenario.npc_question,
        "context": scenario.context,
        "options": [{"id": opt.id, "text": opt.option_text} for opt in options]
    }

@app.post("/game/choose-option")
def choose_option(option_id: int, user_id: int, db: Session = Depends(get_db)):
    option = db.query(models.DialogOption).filter(models.DialogOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Lựa chọn không tồn tại!")

    # 1. Lấy điểm thiện cảm gần nhất của User với NPC này
    last_conv = db.query(models.Conversation).filter_by(
        user_id=user_id, npc_id=option.scenario.npc_id
    ).order_by(models.Conversation.created_at.desc()).first()
    
    current_affinity = last_conv.affinity_score if last_conv else 50.0
    bonus = option.affinity_bonus if option.is_correct else -5.0
    new_affinity = max(0, min(100, current_affinity + bonus)) 

    # 2. Tự động tặng nguyên liệu nếu đạt mốc 80
    unlocked = False
    if new_affinity >= 80.0:
        npc = option.scenario.npc
        if npc and npc.heirloom:
            exists = db.query(models.UserCollection).filter_by(
                user_id=user_id, collection_id=npc.heirloom.id
            ).first()
            if not exists:
                db.add(models.UserCollection(user_id=user_id, collection_id=npc.heirloom.id))
                unlocked = True

    # 3. Lưu lịch sử
    new_conv = models.Conversation(
        user_id=user_id,
        npc_id=option.scenario.npc_id, 
        message=option.option_text,
        sender="user",
        affinity_score=new_affinity
    )
    db.add(new_conv)
    db.commit()

    return {
        "is_correct": option.is_correct,
        "feedback": option.feedback,
        "new_affinity": new_affinity,
        "unlocked_item": unlocked
    }

@app.post("/api/game/mix-recipe")
def mix_recipe(data: MixRecipeRequest, db: Session = Depends(get_db)):
    correct_order = db.query(models.Collection).order_by(models.Collection.step_order).all()
    correct_ids = [c.id for c in correct_order]
    
    if len(data.ingredient_ids) != len(correct_ids):
        return {"status": "FAIL", "message": "Số lượng nguyên liệu chưa đủ để pha chế!"}

    if data.ingredient_ids == correct_ids:
        return {
            "status": "SUCCESS",
            "message": "Cụ Phan: 'Tuyệt vời! Ly Cà Phê Muối chuẩn vị di sản đã hoàn thành.'",
            "ending_unlocked": True
        }
    
    for i, (u_id, c_id) in enumerate(zip(data.ingredient_ids, correct_ids)):
        if u_id != c_id:
            return {
                "status": "FAIL", 
                "message": f"Hương vị bị sai ở bước thứ {i+1}. Hãy kiểm tra lại Codex!",
                "ending_unlocked": False
            }
        
@app.post("/api/logout/{user_id}")
async def logout(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(user_id, db, x_token) # Kiểm tra đúng chủ nhân mới cho logout
    user.token = None # Xóa token trong DB
    db.commit()
    return {"status": "success", "message": "Đã đăng xuất"}        

@app.get("/api/user/codex/{user_id}")
def get_user_codex(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    # Bước kiểm tra bảo mật
    verify_token(user_id, db, x_token)
    # Nếu vượt qua kiểm tra, mới thực hiện logic lấy đồ bên dưới
    unlocked_ids = [c.collection_id for c in db.query(models.UserCollection).filter_by(user_id=user_id).all()]
    all_ingredients = db.query(models.Collection).order_by(models.Collection.step_order).all()
    
    return [{
        "id": item.id,
        "name": item.name if item.id in unlocked_ids else "???",
        "description": item.description if item.id in unlocked_ids else "Bí mật...",
        "is_owned": item.id in unlocked_ids
    } for item in all_ingredients]

@app.get("/")
def read_root():
    return {"message": "API Salted Coffee is Online"}