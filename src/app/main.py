from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, database

# Tạo table trong DB (Chỉ dùng cho prototype nhanh)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Communication RPG API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Communication RPG Learning Engine"}

@app.post("/chat/send", response_model=schemas.MessageResponse)
def send_message(msg: schemas.MessageCreate, db: Session = Depends(database.get_db)):
    # 1. Lưu tin nhắn của User vào DB
    db_user_msg = models.Conversation(
        user_id=1, # Giả định user_id = 1 cho MVP
        npc_id=msg.npc_id,
        message=msg.message,
        sender="user",
        affinity_score=0.0 # User gửi thì chưa đổi điểm
    )
    db.add(db_user_msg)
    
    # 2. Ở đây sau này bạn sẽ gọi Member 2 (AI Member) 
    # để lấy câu trả lời từ AI dựa trên tin nhắn này
    ai_reply = "Chào bạn! Tôi là Lan. Rất vui được gặp bạn." 
    new_affinity = 10.0 # Giả định AI chấm điểm thiện cảm tăng
    
    # 3. Lưu câu trả lời của NPC vào DB
    db_npc_msg = models.Conversation(
        user_id=1,
        npc_id=msg.npc_id,
        message=ai_reply,
        sender="npc",
        affinity_score=new_affinity
    )
    db.add(db_npc_msg)
    db.commit()
    db.refresh(db_npc_msg)
    
    return db_npc_msg

@app.get("/user/profile", response_model=schemas.UserResponse)
def get_user_profile(db: Session = Depends(database.get_db)):
    # Lấy User đầu tiên trong Database để chạy thử MVP
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Chưa có User nào trong DB. Hãy dùng pgAdmin tạo thử 1 dòng.")
    return user