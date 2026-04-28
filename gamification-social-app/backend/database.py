from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Xử lý lỗi định dạng postgres:// của Supabase/Heroku
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Kiểm tra nếu chưa cấu hình biến môi trường
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("⚠️ Lỗi: Chưa tìm thấy DATABASE_URL trong file .env!")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,            # Tăng lên 10 nếu có nhiều người chơi
    max_overflow=20,
    pool_recycle=300,
    connect_args={"sslmode": "require"} 
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Lưu ý: Hàm get_db ở đây sẽ được import vào main.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()