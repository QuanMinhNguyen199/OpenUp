from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

# Lưu ý: Bỏ dấu . hoặc src. vì các file nằm cùng cấp thư mục backend
import models, schemas, database 

# Khởi tạo DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Communication RPG API")

# Cấu hình CORS để Next.js (cổng 3000) gọi được vào FastAPI (cổng 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Communication RPG Learning Engine"}

@app.get("/game/scenario/{npc_id}")
def get_scenario(npc_id: int, db: Session = Depends(database.get_db)):
    scenario = db.query(models.DialogScenario).filter(models.DialogScenario.npc_id == npc_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="NPC này chưa có kịch bản!")

    options = db.query(models.DialogOption).filter(models.DialogOption.scenario_id == scenario.id).all()
    
    return {
        "npc_question": scenario.npc_question,
        "context": scenario.context,
        "options": [
            {"id": opt.id, "text": opt.option_text} for opt in options
        ]
    }

@app.post("/game/choose-option")
def choose_option(option_id: int, db: Session = Depends(database.get_db)):
    option = db.query(models.DialogOption).filter(models.DialogOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Lựa chọn không tồn tại!")

    # Logic tính toán Affection (Giả sử mặc định bắt đầu từ 50 nếu chưa có dữ liệu)
    current_affinity = 50.0 
    bonus = option.affinity_bonus if option.is_correct else -5.0
    new_affinity = max(0, min(100, current_affinity + bonus)) # Giới hạn 0-100

    new_conv = models.Conversation(
        user_id=1,
        npc_id=0, 
        message=option.option_text,
        sender="user",
        affinity_score=new_affinity
    )
    db.add(new_conv)
    db.commit()

    return {
        "is_correct": option.is_correct,
        "feedback": option.feedback,
        "new_affinity_level": new_affinity,
        "npc_reaction": "❤ Lan rất hài lòng!" if option.is_correct else "💔 Lan cảm thấy hơi khó xử..."
    }