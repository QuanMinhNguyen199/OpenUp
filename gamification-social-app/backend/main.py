import hashlib
import math
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
from ai_service import gen_dialogue_story_mode, gen_dialogue_singleplayer
from schemas import SingleplayerRequest, StoryModeRequest
from prompts.story_prompts import STORY_MODE_PROMPTS
from prompts.single_prompts import NAMES, JOBS, RELATIONSHIPS, LESSONS
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
    if total_xp <= 0:
        return 1
    # Công thức: S = 50 * (L^2 - L) => L = (1 + sqrt(1 + 0.08 * S)) / 2
    # Cần 100xp lên lv2, thêm 200xp lên lv3, thêm 300xp lên lv4...
    return int((1 + math.sqrt(1 + 0.08 * total_xp)) / 2)

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


@app.post("/api/logout/{user_id}")
async def logout(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(user_id, db, x_token)
    user.token = None
    db.commit()

    return {"status": "success", "message": "Đăng xuất thành công"}


# --- ENDPOINTS GAMEPLAY ---

@app.post("/story_mode")
async def story_mode(
    data: StoryModeRequest,
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(data.user_id, db, x_token)
    
    if data.index < 0 or data.index >= len(STORY_MODE_PROMPTS):
        raise HTTPException(status_code=400, detail="Màn này không có cốt truyện !")
    elif data.index + 1 > user.chap:
        raise HTTPException(status_code=403, detail="Chưa mở khóa chương này !")

    npc_id = data.index + 1
    conv = db.query(models.Conversation).filter_by(user_id=user.id, npc_id=npc_id, game_mode="story").first()
    
    if not conv:
        # TRƯỜNG HỢP 1: Lần đầu tiên chơi Chapter này
        conv = models.Conversation(
            user_id=user.id, 
            npc_id=npc_id, 
            affinity_score=20.0, 
            current_turn=1,
            neutral_streak=0
        )
        db.add(conv)
        db.commit()
    else:
        # TRƯỜNG HỢP 2: Đã từng chơi và đang CHƠI LẠI (Replay)
        # Bắt Bug: Nếu history rỗng -> Tức là vừa bấm vào màn -> Bắt buộc Reset điểm cũ
        if len(data.history) == 0:
            conv.affinity_score = 20.0
            conv.current_turn = 1
            conv.neutral_streak = 0
            db.commit()

    # Gọi AI sinh thoại
    result = await gen_dialogue_story_mode(
        index=data.index,
        event=data.event,
        case=data.case,
        history=data.history,
        current_turn=conv.current_turn  
    )
    
    # Khóa luồng: Buộc user phải chọn đáp án mới được đi tiếp
    conv.is_waiting_for_reply = True
    db.commit()
    
    return result

@app.post("/game/choose-option")
def choose_option(
    npc_id: int, 
    score_change: float,  # Điểm quantity gửi từ FE
    user_id: int, 
    db: Session = Depends(get_db), 
    x_token: str = Header(None)
):
    user = verify_token(user_id, db, x_token)
    
    # 1. Chặn dùng mồm vượt Boss
    if npc_id == 8:
        raise HTTPException(status_code=403, detail="Màn Boss yêu cầu giải đố, không thể chat!")

    # BẢO MẬT: Giới hạn mỗi lượt chỉ được cộng/trừ max 30 điểm
    if score_change > 50.0 or score_change < -50.0:
        raise HTTPException(status_code=400, detail="Hệ thống phát hiện điểm số bất thường (Nghi vấn Hack)!")
    
    # Ép kiểu và giới hạn biên độ an toàn
    score_change = float(score_change)
    score_change = max(-30.0, min(25.0, score_change))

    conv = db.query(models.Conversation).filter_by(user_id=user_id, npc_id=npc_id, game_mode="story").first()
    
    # 2. KIỂM TRA KHÓA CHÉO
    if not conv or not getattr(conv, 'is_waiting_for_reply', True):
        raise HTTPException(status_code=403, detail="Bạn phải đọc kịch bản trước khi chọn!")

    # 3. CHỐNG SPAM (2 giây)
    now = datetime.utcnow()
    if hasattr(conv, 'last_interaction') and conv.last_interaction:
        if (now - conv.last_interaction).total_seconds() < 2:
            raise HTTPException(status_code=429, detail="Bình tĩnh, đừng bấm quá nhanh!")
    
    conv.last_interaction = now

    # 4. TÍNH ĐIỂM MỚI CHUẨN XÁC
    # Luôn lấy điểm hiện tại đang lưu trong DB (sau khi đã được reset an toàn ở API story_mode)
    base_score = float(conv.affinity_score)
    potential_score = base_score + score_change
    
    # 5. Xử lý Neutral Streak (Điểm hời hợt)
    if -3.0 <= score_change <= 3.0:
        conv.neutral_streak += 1
    else:
        conv.neutral_streak = 0

    message = ""
    is_failed = False
    is_completed = False

    # 6. KIỂM TRA ĐIỀU KIỆN THẮNG / THUA
    if npc_id == 7:
        # --- LUẬT CHƠI ĐẢO NGƯỢC (CHAPTER 7 - CỤ PHAN) ---
        if potential_score <= 0:
            conv.affinity_score = 0.0
            if user.chap == 7:
                user.chap += 1
                user.total_xp += 200 
            else:
                user.total_xp += 50  
                
            user.level = calculate_level(user.total_xp)
            is_completed = True
            message = "Cụ Phan mỉm cười: 'Con đã hiểu được giá trị của sự thật và buông bỏ. Bức tranh nhân sinh đã sẵn sàng.' Bạn đã vượt qua bài test cuối cùng!"
            
        elif potential_score >= 100:
            is_failed = True
            conv.affinity_score = 20.0
            conv.current_turn = 1
            conv.neutral_streak = 0 
            message = "Cụ Phan lắc đầu: 'Những lời mật ngọt giả dối không thể cứu rỗi tâm hồn.' Hãy thử lại bằng sự chân thật!"
            
        elif conv.neutral_streak >= 3:
            is_failed = True
            conv.affinity_score = 20.0
            conv.current_turn = 1
            conv.neutral_streak = 0 
            message = "Cụ Phan nhắm mắt dưỡng thần, không muốn tiếp chuyện kẻ thiếu thành tâm."
            
        else:
            conv.affinity_score = max(0.0, min(100.0, potential_score))
            conv.current_turn += 1
            message = f"Cụ Phan gật gù. Hãy tiếp tục bảo vệ quan điểm của bạn! Tâm ngộ: {100 - int(conv.affinity_score)}/100"
            
    else:
        # --- LUẬT CHƠI BÌNH THƯỜNG (CHAPTER 1-6) ---
        if potential_score <= 0:
            is_failed = True
            conv.affinity_score = 20.0 
            conv.current_turn = 1
            conv.neutral_streak = 0 
            message = "NPC thất vọng hoàn toàn. Bạn đã làm hỏng cuộc trò chuyện, hãy làm lại từ đầu!"
            
        elif conv.neutral_streak >= 3:
            is_failed = True
            conv.affinity_score = max(0, conv.affinity_score - 10)
            conv.current_turn = 1
            conv.neutral_streak = 0 
            message = "Bạn quá hời hợt và thiếu thiện chí, NPC không muốn tiếp chuyện nữa."
            
        else:
            conv.affinity_score = min(100.0, potential_score) 
            
            if conv.affinity_score >= 100:
                if user.chap == npc_id:
                    user.chap += 1
                    user.total_xp += 150
                else:
                    user.total_xp += 30 
                    
                user.level = calculate_level(user.total_xp)
                is_completed = True
                
                if conv.current_turn <= 6:
                    message = f"Hoàn hảo! Bằng sự thấu cảm tuyệt vời, bạn đã xoa dịu NPC rất nhanh. Mở khóa Chapter {user.chap}!"
                else:
                    message = f"Dù mất khá nhiều thời gian để thấu hiểu nhau, nhưng cuối cùng bạn cũng làm được! Mở khóa Chapter {user.chap}!"
            else:
                conv.current_turn += 1
                message = f"NPC phản ứng lại. Điểm tình cảm: {int(conv.affinity_score)}/100"

    # 7. Đóng khóa chéo: Chờ User đọc thoại AI lượt tiếp theo
    conv.is_waiting_for_reply = False 
    db.commit()

    return {
        "new_affinity": conv.affinity_score,
        "is_chapter_completed": is_completed,
        "is_failed": is_failed,
        "current_level": user.level,
        "message": message
    }

@app.get("/game/puzzle-state")
def get_puzzle_state(user_id: int, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(user_id, db, x_token)
    
    # 1. Quét DB tìm các NPC (từ 1-7) mà user đã đạt 100 điểm
    completed_convs = db.query(models.Conversation).filter(
        models.Conversation.user_id == user_id,
        models.Conversation.game_mode == "story",
        models.Conversation.affinity_score >= 100
    ).all()
    
    completed_npc_ids = [conv.npc_id for conv in completed_convs if conv.npc_id in range(1, 8)]
    
    # 2. Logic cấp mảnh thứ 8 (Mảnh trung tâm)
    is_ready = len(completed_npc_ids) == 7
    if is_ready:
        completed_npc_ids.append(8) 
        
    return {
        "lit_pieces": completed_npc_ids, # FE sẽ dùng mảng này để thắp sáng hình (VD: [1,2,3,4,5,6,7,8])
        "is_ready_to_shuffle": is_ready, # FE check = True thì mới bắt đầu xáo trộn Sliding Puzzle
        "message": "Bảo vật đã hiển lộ, sẵn sàng ghép hình!" if is_ready else f"Đã thu thập {len(completed_npc_ids)}/7 mảnh."
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


@app.post("/singleplayer")
async def singleplayer(data: SingleplayerRequest, db: Session = Depends(get_db), x_token: str = Header(None)):
    user = verify_token(data.user_id, db, x_token)
    if data.turn < 1:
        raise HTTPException(status_code=400, detail="Game chưa tồn tại!")
    elif data.turn == 1:
        name_idx = random.randint(0, len(NAMES) - 1)
        job_idx = random.randint(0, len(JOBS) - 1)
        relationship_idx = random.randint(0, len(RELATIONSHIPS) - 1)
        lesson_idx = random.randint(0, len(LESSONS) - 1)
        case = random.randint(0, 3)
        result = await gen_dialogue_singleplayer(
            name_idx=name_idx,
            job_idx=job_idx,
            relationship_idx=relationship_idx,
            lesson_idx=lesson_idx,
            event=False,
            case=case,
            turn=data.turn,
            location=data.location,
            history=data.history
        )
        result['num'] = [name_idx, job_idx, relationship_idx, lesson_idx, case]
        result['name'] = NAMES[name_idx]
        result['job'] = JOBS[job_idx] if relationship_idx != 4 else 'Học sinh'
        result['relationship'] = RELATIONSHIPS[relationship_idx]
        return result
    else:
        if len(data.num) != 5:
            raise HTTPException(status_code=400, detail="Data lỗi")
        name_idx, job_idx, relationship_idx, lesson_idx, old_case = data.num
        if name_idx < 0 or name_idx >= len(NAMES) or job_idx < 0 or job_idx >= len(JOBS) or relationship_idx < 0 or relationship_idx >= len(RELATIONSHIPS) or lesson_idx < 0 or lesson_idx >= len(LESSONS) or old_case < 0 or old_case > 3:
            raise HTTPException(status_code=400, detail="Data lỗi")
        case = random.randint(0, 3)
        result = await gen_dialogue_singleplayer(
            name_idx=name_idx,
            job_idx=job_idx,
            relationship_idx=relationship_idx,
            lesson_idx=lesson_idx,
            event=False,
            case=case,
            turn=data.turn,
            location=data.location,
            history=data.history,
            old_case=old_case
        )
        result['num'] = [name_idx, job_idx, relationship_idx, lesson_idx, case]
        return result
        