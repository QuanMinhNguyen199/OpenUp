import redis
import os

# Sử dụng biến môi trường để dễ cấu hình khi deploy
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

try:
    redis_conn = redis.Redis(
        host=REDIS_HOST, 
        port=REDIS_PORT, 
        db=0, 
        decode_responses=True,
        socket_connect_timeout=3 # Không để server đợi quá lâu nếu Redis sập
    )
    # Kiểm tra kết nối
    redis_conn.ping()
except redis.ConnectionError:
    print("⚠️ Cảnh báo: Không thể kết nối Redis. Bảng xếp hạng sẽ tạm thời trống.")
    redis_conn = None

def update_leaderboard(username: str, xp: int):
    """Cập nhật điểm XP của người chơi vào BXH"""
    if redis_conn:
        # Dùng username sẽ tiện cho Frontend hiển thị hơn là ID
        redis_conn.zadd("leaderboard", {username: xp})

def get_leaderboard(limit=10):
    """Lấy danh sách Top người chơi"""
    if not redis_conn:
        return []
    
    # Trả về list các dict cho Frontend dễ dùng
    raw_data = redis_conn.zrevrange("leaderboard", 0, limit-1, withscores=True)
    return [{"username": name, "xp": int(score)} for name, score in raw_data]