| Hạng mục | Liên kết |
|---|---|
| 🚀 Live URL | [https://a20-app-061.onrender.com/](#) |
| 🎬 Video Demo | [Điền link YouTube](#) |
| 📊 Pitch Deck | [Điền link Google Slide](#) |
| 🏗️ Sơ đồ Kiến trúc | [Architecture.png](./Architecture.png) |
| 📁 Thư mục Minh chứng | [Điền link Google Drive chứa worklog, test...](#) |

## 1. Tên dự án

**[OpenUP - Gamification Học Tập cho giao tiếp ứng xử]**

## 2. Mô tả ngắn gọn

**[OpenUp]** là một game nhập vai giao tiếp xã hội ứng dụng AI, nơi người chơi tương tác với các NPC có cảm xúc, tính cách và ngữ cảnh riêng. Trò chơi kết hợp cơ chế hội thoại, lựa chọn tình huống, điểm thân thiện, chương truyện và thử thách để biến việc luyện giao tiếp thành một trải nghiệm có tính nhập vai, có tiến trình và có phản hồi tức thì.

Hệ thống sử dụng **OpenAI gpt-4o-mini** ở chế độ **JSON mode** để tạo phản hồi có cấu trúc, giúp NPC phản ứng nhất quán theo luật xưng hô, trạng thái cảm xúc và logic tình huống trong từng lượt chơi.

## 3. Mục tiêu / Vấn đề giải quyết

Trong giao tiếp thực tế, nhiều người gặp khó khăn khi phải chọn cách nói phù hợp với từng vai vế, cảm xúc và bối cảnh xã hội. Việc luyện tập thường thiếu môi trường an toàn, thiếu phản hồi cá nhân hóa và khó duy trì động lực lâu dài.

Dự án giải quyết vấn đề này bằng cách:

- 🎭 Mô phỏng các tình huống giao tiếp với NPC có cảm xúc và phản ứng linh hoạt.
- 🧠 Dùng AI để tạo hội thoại tự nhiên, có kiểm soát bằng system prompt và JSON mode.
- 🎮 Áp dụng gamification như điểm kinh nghiệm, mở khóa chương, bảng xếp hạng và thử thách.
- 📈 Giúp người chơi luyện kỹ năng ứng xử qua phản hồi trực tiếp trong từng lựa chọn.
- 🛡️ Tạo môi trường thử nghiệm an toàn, nơi người chơi có thể sai, học lại và cải thiện.

## 4. Tính năng chính

- 🤖 **Hội thoại AI với NPC**: NPC phản hồi theo bối cảnh, cảm xúc và quan hệ với người chơi.
- 📖 **Story Mode**: Người chơi vượt qua các chương truyện, mở khóa nội dung theo tiến trình.
- 🎯 **Singleplayer Mode**: Luyện tập các tình huống giao tiếp nhanh với nhiều kiểu nhân vật.
- ❤️ **Affinity Score**: Hệ thống điểm thân thiện phản ánh chất lượng tương tác với NPC.
- ⭐ **XP và Level**: Người chơi nhận kinh nghiệm, lên cấp và theo dõi tiến bộ.
- 🧩 **Boss / Puzzle Logic**: Một số màn yêu cầu giải quyết tình huống đặc biệt thay vì chỉ trò chuyện.
- 🔐 **Đăng ký / Đăng nhập**: Quản lý tài khoản, phiên đăng nhập và tiến trình người chơi.
- 🏆 **Leaderboard**: Ghi nhận thành tích để tăng tính cạnh tranh và động lực.
- 🗄️ **Lưu dữ liệu bằng Supabase PostgreSQL**: Lưu người dùng, hội thoại, điểm số và tiến trình.

## 5. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend |  Next.js / TypeScript |
| Backend | Python, FastAPI |
| Database | Supabase, PostgreSQL |
| AI Model | OpenAI gpt-4o-mini |
| AI Output Control | JSON mode, system prompt xử lý luật xưng hô và cảm xúc NPC |
| ORM / Database Layer | SQLAlchemy |
| Realtime / Cache / Leaderboard | Redis |
| Package Manager | npm, pip |
| Deployment | [Render  / Supabase] |

## 6. Hướng dẫn cài đặt

### 6.1. Clone repository

```bash
git clone <repository-url>
cd A20-App-061
```

### 6.2. Cài đặt hook logging cho AI20K

```bash
bash scripts/setup_hooks.sh
```

### 6.3. Cài đặt Backend

```bash
cd gamification-social-app/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> Trên Windows PowerShell, có thể kích hoạt môi trường ảo bằng:

```bash
venv/Scripts/Activate.ps1
```

### 6.4. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

### 6.5. Cấu hình biến môi trường

Tạo file `.env` cho backend trong thư mục `gamification-social-app/backend` và bổ sung các biến cần thiết:

```bash
OPENAI_API_KEY=<your-openai-api-key>
DATABASE_URL=<your-supabase-postgresql-url>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
REDIS_URL=<your-redis-url>
```

Tạo file môi trường cho frontend trong thư mục `gamification-social-app/frontend` nếu cần:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## 7. Hướng dẫn chạy dự án

### 7.1. Chạy Backend FastAPI

```bash
cd gamification-social-app/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại:

```bash
http://localhost:8000
```

Tài liệu API tự động của FastAPI:

```bash
http://localhost:8000/docs
```

### 7.2. Chạy Frontend

Mở terminal mới và chạy:

```bash
cd gamification-social-app/frontend
npm run dev
```

Frontend sẽ chạy tại:

```bash
http://localhost:3000
```

### 7.3. Kiểm tra build Frontend

```bash
cd gamification-social-app/frontend
npm run build
```

## 8. Hướng dẫn sử dụng sản phẩm

1. Truy cập **Live URL** hoặc mở frontend tại `http://localhost:3000`.
2. Tạo tài khoản mới bằng màn hình **Register**.
3. Đăng nhập bằng tài khoản đã tạo để vào khu vực chơi.
4. Chọn **Lobby** để xem các chế độ và tiến trình hiện tại.
5. Vào **Story Mode** để bắt đầu tương tác với NPC theo từng chương truyện.
6. Đọc tình huống, chọn phản hồi hoặc nhập câu trả lời phù hợp với bối cảnh.
7. Quan sát phản ứng của NPC, điểm thân thiện, cảm xúc và tiến trình mở khóa.
8. Chơi **Singleplayer Mode** để luyện các tình huống giao tiếp nhanh.
9. Hoàn thành thử thách, tích lũy XP, tăng level và cải thiện thứ hạng trên leaderboard.
10. Xem lại minh chứng phát triển, test và worklog trong **Thư mục Minh chứng** được liên kết ở đầu README.
