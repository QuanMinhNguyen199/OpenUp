from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, database
from fastapi.middleware.cors import CORSMiddleware

# Khởi tạo DB (Tạo bảng dựa trên models.py)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Communication RPG API")

# Cấu hình CORS để Next.js gọi được vào
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Communication RPG Learning Engine"}


@app.post("/game/choose-option")
def choose_option(option_id: int, db: Session = Depends(database.get_db)):
    # 1. Tìm phương án
    option = db.query(models.DialogOption).filter(models.DialogOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Lựa chọn không tồn tại!")

    # 2. Tìm bản ghi hội thoại gần nhất hoặc bảng thiện cảm của User với NPC này
    # Ở đây mình sẽ lưu/cập nhật trực tiếp vào bảng Conversation hoặc một bảng Affinity riêng
    # Giả định chúng ta cập nhật vào một biến để trả về cho Frontend hiển thị thanh bar
    
    current_affinity = 50.0  # Giả định điểm hiện tại lấy từ DB
    bonus = option.affinity_bonus if option.is_correct else -5.0 # Sai thì trừ điểm
    
    new_affinity = current_affinity + bonus
    
    # Giới hạn thanh điểm từ 0 đến 100
    if new_affinity > 100: new_affinity = 100
    if new_affinity < 0: new_affinity = 0

    # 3. Lưu vào lịch sử (tạm thời chưa dùng XP)
    new_conv = models.Conversation(
        user_id=1,
        npc_id=0, 
        message=option.option_text,
        sender="user",
        affinity_score=new_affinity # Lưu điểm sau khi thay đổi
    )
    db.add(new_conv)
    db.commit()

    return {
        "is_correct": option.is_correct,
        "feedback": option.feedback,
        "new_affinity_level": new_affinity, # Trả về số để Next.js vẽ thanh bar
        "npc_reaction": "❤ Lan cảm thấy rất vui!" if option.is_correct else "💔 Lan hơi thất vọng..."
    }

@app.get("/game/scenario/{npc_id}")
def get_scenario(npc_id: int, db: Session = Depends(database.get_db)):
    """
    Lấy câu hỏi của NPC và 3 lựa chọn để hiện lên Next.js
    """
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