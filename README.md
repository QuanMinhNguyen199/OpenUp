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
- 📖 **Story Mode**: Người chơi vượt qua 8 chương truyện, trong đó Chapter 8 là màn đánh Boss (Giải đố Sliding Puzzle).
- 🎯 **Singleplayer Mode**: Luyện tập các tình huống giao tiếp nhanh với nhiều kiểu nhân vật.
- 🛠️ **Custom Play Mode**: Tự tạo kịch bản giao tiếp theo ý muốn (Mục tiêu, tính cách, giới tính, bối cảnh).
- ⚔️ **Multiplayer Mode**: Tương tác và thi đấu trực tiếp với người chơi khác qua WebSockets theo thời gian thực.
- ❤️ **Affinity Score**: Hệ thống điểm tình cảm phản ánh chất lượng tương tác với NPC, quyết định thắng thua (100 điểm để chiến thắng).
- ⭐ **XP, Level & Rank**: Người chơi nhận kinh nghiệm, lên cấp và theo dõi tiến bộ thông qua hệ thống Rank.
- 🔐 **Đăng ký / Đăng nhập / Admin**: Quản lý tài khoản, phiên đăng nhập, và phân quyền Admin quản trị thống kê.
- 🏆 **Leaderboard**: Ghi nhận thành tích realtime (thông qua Redis) để tăng tính cạnh tranh.
- 🗄️ **Lưu dữ liệu bằng Supabase PostgreSQL**: Lưu người dùng, hội thoại, điểm số và tiến trình.

## 5. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js, TypeScript, TailwindCSS |
| Backend | Python, FastAPI, WebSockets |
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
4. Chọn **Story Mode** để tương tác với NPC theo từng chương truyện. Điểm số bắt đầu từ 20, hãy giao tiếp để đạt 100 điểm.
5. Vượt qua 7 chương hội thoại để mở khóa Chapter 8 (Giải đố Sliding Puzzle).
6. Trải nghiệm **Singleplayer** và **Custom Play** để thử nghiệm các tình huống ngẫu nhiên/tuỳ chỉnh.
7. Chơi **Multiplayer** để cọ xát với người chơi khác theo thời gian thực.
8. Theo dõi Level, Rank và Leaderboard để cạnh tranh với những người chơi khác.
9. Xem lại minh chứng phát triển, test và worklog trong **Thư mục Minh chứng** được liên kết ở đầu README.
