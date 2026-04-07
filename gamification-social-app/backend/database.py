from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 1. Đảm bảo load biến môi trường từ file .env
load_dotenv()

# 2. Lấy URL và xử lý lỗi định dạng tiềm ẩn từ Supabase
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Một số thư viện yêu cầu postgresql:// thay vì postgres:// của Supabase
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Khởi tạo Engine với các tham số tối ưu cho Cloud
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # pool_pre_ping giúp tự động kết nối lại nếu Supabase ngắt kết nối tạm thời
    pool_pre_ping=True,
    # Tránh lỗi liên quan đến SSL trên một số môi trường Windows
    connect_args={"sslmode": "require"} if SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Hàm bổ trợ để lấy DB session cho mỗi request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()