import redis
import os

# Sử dụng một biến môi trường duy nhất (Chuẩn của Render và các Cloud khác)
# Nếu không có biến này (chạy local), nó sẽ mặc định gọi localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

try:
    # Hàm from_url tự động phân tích host, port, user, password từ chuỗi URL
    redis_conn = redis.from_url(
        REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=3
    )
    # Kiểm tra kết nối
    redis_conn.ping()
    print("✅ Đã kết nối thành công tới Redis!")
except Exception as e:
    print(f"⚠️ Cảnh báo: Không thể kết nối Redis ({e}). BXH sẽ tạm thời trống.")
    if 'redis_conn' in locals() and redis_conn:
        try:
            redis_conn.close()
        except:
            pass
    redis_conn = None

def update_leaderboard(username: str, xp: int):
    """Cập nhật điểm XP của người chơi vào BXH"""
    if redis_conn:
        try:
            redis_conn.zadd("leaderboard", {username: xp})
        except Exception as e:
            print(f"⚠️ Lỗi khi ghi vào Redis: {e}")

def get_leaderboard(limit=10):
    """Lấy danh sách Top người chơi"""
    if not redis_conn:
        return []
    
    try:
        raw_data = redis_conn.zrevrange("leaderboard", 0, limit-1, withscores=True)
        return [{"username": name, "xp": int(score)} for name, score in raw_data]
    except Exception as e:
        print(f"⚠️ Lỗi khi đọc từ Redis: {e}")
        return []