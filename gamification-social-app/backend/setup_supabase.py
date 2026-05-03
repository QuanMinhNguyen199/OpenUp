import hashlib
from sqlalchemy.orm import Session
from sqlalchemy import text
import models, database
# Đảm bảo đường dẫn import đúng với cấu thư mục của bạn
from prompts.story_prompts import STORY_MODE_PROMPTS 

def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def run_setup():
    print("🔄 Đang kết nối đến cơ sở dữ liệu...")
    # Tạo bảng nếu chưa tồn tại
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    
    try:
        print("🛠 Chạy Migrations (Cập nhật cấu trúc bảng)...")
        # Danh sách các cột cần đảm bảo có mặt trong Database
        migrations = {
            "chap": "ALTER TABLE users ADD COLUMN IF NOT EXISTS chap INTEGER DEFAULT 1;",
            "total_xp": "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;",
            "level": "ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;",
            "current_turn": "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS current_turn INTEGER DEFAULT 1;",
            "neutral_streak": "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS neutral_streak INTEGER DEFAULT 0;",
            "affinity_score": "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS affinity_score FLOAT DEFAULT 20.0;",
            "is_waiting_for_reply": "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_waiting_for_reply BOOLEAN DEFAULT FALSE;",
            "game_mode": "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'story';",
            "target_idx": "ALTER TABLE collections ADD COLUMN IF NOT EXISTS target_idx INTEGER;",
            "image_url": "ALTER TABLE collections ADD COLUMN IF NOT EXISTS image_url TEXT;"
        }
        for sql in migrations:
            try:
                db.execute(text(sql))
            except Exception as e:
                # Bỏ qua nếu lỗi (thường là do cột đã tồn tại ở một số phiên bản DB cũ)
                print(f"⏩ Thông báo: {sql.split('ADD COLUMN')[1].split(' ')[1]} đã được xử lý.")
        db.commit()

        print(f"📦 Đang nạp {len(STORY_MODE_PROMPTS)} Chapter vào Database...")
        
        for data in STORY_MODE_PROMPTS:
            npc_id = data.get('npc_id')
            if not npc_id:
                continue 

            # 1. Đồng bộ NPC
            npc = db.query(models.NPC).filter_by(id=npc_id).first()
            if not npc:
                npc = models.NPC(id=npc_id)
                db.add(npc)
            
            npc.name = data.get('name')
            npc.map_location = data.get('location')
            npc.base_prompt = data.get('prompt')
            npc.role = "Story NPC"
            db.flush() # Để lấy ID nếu là tạo mới

            # 2. Đồng bộ Mảnh ghép (Collection)
            collection = db.query(models.Collection).filter_by(npc_id=npc_id).first()
            if not collection:
                collection = models.Collection(npc_id=npc_id)
                db.add(collection)
                
            collection.name = data.get('item')
            collection.target_idx = data.get('idx')
            collection.description = f"Vật phẩm nhận được từ {npc.name}"
            collection.required_affinity = 100.0

        # 3. Khởi tạo Admin (Quyền cao nhất để test game)
        default_admins = [
            {"username": "admin_quan", "password": "123456"},
            {"username": "admin_tri", "password": "654321"}
        ]
        for admin in default_admins:
            if not db.query(models.User).filter_by(username=admin["username"]).first():
                new_admin = models.User(
                    username=admin["username"], 
                    password_hash=get_password_hash(admin["password"]),
                    role="ADMIN", 
                    chap=9,   # Có thể vào mọi Chapter
                    level=99, # Level tối đa
                    total_xp=99999
                )
                db.add(new_admin)

        db.commit()
        print("✅ Chúc mừng! Dữ liệu 7 Chapters và Admin đã được đồng bộ lên Supabase.")

    except Exception as e:
        db.rollback()
        print(f"❌ Thất bại: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_setup()