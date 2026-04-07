import redis

# Kết nối tới Redis container
redis_conn = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def set_leaderboard(user_id, score):
    # Dùng Sorted Set trong Redis để làm BXH cực nhanh
    redis_conn.zadd("leaderboard", {user_id: score})

def get_top_rank(limit=10):
    return redis_conn.zrevrange("leaderboard", 0, limit-1, withscores=True)