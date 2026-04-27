import hashlib
from sqlalchemy.orm import Session
from sqlalchemy import text
import models, database
from system_prompts import STORY_MODE_PROMPTS 

def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def run_setup():
    print("🔄 Đang kết nối đến Supabase...")
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    
    try:
        print("🛠 Đang chạy Migrations...")
        migrations = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS chap INTEGER DEFAULT 1;",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;",
            "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS current_turn INTEGER DEFAULT 1;",
            "ALTER TABLE conversations ADD COLUMN IF NOT EXISTS neutral_streak INTEGER DEFAULT 0;",
            "ALTER TABLE collections ADD COLUMN IF NOT EXISTS target_idx INTEGER;",
            "ALTER TABLE collections ADD COLUMN IF NOT EXISTS image_url TEXT;"
        ]
        for sql in migrations:
            db.execute(text(sql))
        db.commit()

        print("📦 Đang nạp dữ liệu từ system_prompts.py...")
        
        # LẶP QUA CÁC PROMPT TRONG FILE 
        for data in STORY_MODE_PROMPTS:
            npc_id = data.get('npc_id')
            if not npc_id:
                continue # Bỏ qua nếu chưa điền ID

            # 1. Nạp NPC
            npc = db.query(models.NPC).filter_by(id=npc_id).first()
            if not npc:
                npc = models.NPC(id=npc_id)
                db.add(npc)
            
            npc.name = data.get('name', f"NPC {npc_id}")
            npc.map_location = data.get('location', "Chưa rõ")
            npc.base_prompt = data.get('prompt') # Cất nguyên cái prompt vào DB luôn
            npc.role = "Nhân viên"
            db.flush() 

            # 2. Nạp Mảnh ghép (Collection)
            collection = db.query(models.Collection).filter_by(npc_id=npc_id).first()
            if not collection:
                collection = models.Collection(npc_id=npc_id)
                db.add(collection)
                
            collection.name = data.get('item', f"Mảnh ghép {npc_id}")
            collection.target_idx = data.get('idx', 0)
            collection.required_affinity = 100.0

        # Khởi tạo Admin
        default_admins = [{"username": "admin_quan", "password": "123456"}]
        for admin in default_admins:
            if not db.query(models.User).filter_by(username=admin["username"]).first():
                new_admin = models.User(
                    username=admin["username"], password_hash=get_password_hash(admin["password"]),
                    role="ADMIN", chap=9, level=99
                )
                db.add(new_admin)

        db.commit()
        print("✅ Đã đồng bộ 100% dữ liệu từ system_prompts sang Supabase!")

    except Exception as e:
        db.rollback()
        print(f"❌ Có lỗi xảy ra: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_setup()