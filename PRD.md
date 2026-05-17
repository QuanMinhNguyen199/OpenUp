# Product Requirements Document (PRD) - OpenUP

## 1. Tổng quan dự án (Project Overview)
**Tên dự án:** OpenUP - Gamification Học Tập cho giao tiếp ứng xử
**Nền tảng:** Web Application
**Mô tả:** OpenUP là một game nhập vai (RPG) giao tiếp xã hội ứng dụng AI. Người chơi sẽ tương tác với các NPC (Non-Player Character) được mô phỏng với cảm xúc, tính cách và ngữ cảnh riêng biệt. Thông qua các cơ chế hội thoại, lựa chọn tình huống, điểm thân thiện (affinity), chương truyện và thử thách, OpenUP biến việc luyện tập kỹ năng giao tiếp thành một trải nghiệm nhập vai, có tiến trình và nhận được phản hồi tức thì.

## 2. Mục tiêu (Objectives & Goals)
- **Vấn đề cần giải quyết:** Người dùng gặp khó khăn trong việc lựa chọn cách giao tiếp, từ ngữ, thái độ phù hợp với các vai vế, cảm xúc và bối cảnh xã hội khác nhau. Thiếu môi trường an toàn để thực hành, thiếu phản hồi cá nhân hóa và khó duy trì động lực.
- **Giải pháp OpenUP:** 
  - Tạo ra môi trường mô phỏng (Safe Space) với các NPC linh hoạt được điều khiển bởi AI.
  - Sử dụng AI (OpenAI gpt-4o-mini) để phân tích, đưa ra phản hồi tự nhiên và kiểm soát bối cảnh hội thoại một cách chặt chẽ thông qua JSON mode.
  - Áp dụng các yếu tố Gamification (XP, Level, Rank, Leaderboard) để tạo động lực học tập.

## 3. Đối tượng người dùng (Target Audience)
- Những người muốn cải thiện kỹ năng giao tiếp, ứng xử xã hội (sinh viên, người đi làm).
- Những người mắc chứng lo âu xã hội, cần một môi trường ảo an toàn để tập dượt trước các tình huống thực tế (phỏng vấn, giao tiếp công sở, đàm phán).

## 4. Yêu cầu tính năng (Feature Requirements)

### 4.1. Chế độ chơi (Game Modes)
- **Story Mode (Chế độ cốt truyện):** 
  - Hệ thống bao gồm 8 chương truyện (Chapters).
  - Vượt qua 7 chương hội thoại để mở khóa Chapter 8 (Màn đánh Boss - Giải đố Sliding Puzzle).
  - Yêu cầu đạt 100 điểm Affinity (điểm tình cảm) trong mỗi chương để giành chiến thắng và đi tiếp.
- **Singleplayer Mode (Chơi đơn):** Luyện tập các tình huống giao tiếp nhanh, ngẫu nhiên với nhiều kiểu nhân vật khác nhau.
- **Custom Play Mode (Tùy chỉnh):** Cho phép người chơi tự thiết lập kịch bản giao tiếp (Mục tiêu, tính cách NPC, giới tính, bối cảnh).
- **Multiplayer Mode (Chơi nhiều người):** Tương tác và thi đấu trực tiếp với người chơi khác qua WebSockets (Real-time).

### 4.2. Hệ thống AI và Hội thoại (AI & Dialogue System)
- **NPC Personality & Emotion:** NPC có cảm xúc thay đổi linh hoạt theo ngữ cảnh và cách phản hồi của người chơi.
- **AI Core:** Tích hợp OpenAI `gpt-4o-mini` ở chế độ `JSON mode`.
- **System Prompt:** Hệ thống prompt quản lý chặt chẽ luật xưng hô, trạng thái cảm xúc, và logic tiến trình tình huống.

### 4.3. Hệ thống Gamification (Tiến trình & Động lực)
- **Affinity Score:** Điểm tình cảm tăng/giảm sau mỗi câu trả lời của người chơi. Đạt mốc 100 điểm để chiến thắng.
- **Hệ thống Kinh nghiệm (XP), Cấp độ (Level) & Xếp hạng (Rank):** Tích lũy qua từng ván chơi để thăng cấp.
- **Leaderboard (Bảng xếp hạng):** Cập nhật thành tích thời gian thực (Real-time bằng Redis) để tạo tính cạnh tranh.

### 4.4. Quản lý Tài khoản (User Management)
- Đăng ký, Đăng nhập, Quản lý phiên làm việc.
- Quản lý tiến trình học tập, lịch sử hội thoại, điểm số của từng người dùng.
- **Quyền Admin:** Bảng điều khiển quản trị thống kê và kiểm soát dữ liệu.

## 5. Yêu cầu kỹ thuật (Technical Requirements)

### 5.1. Tech Stack
- **Frontend:** Next.js, TypeScript, TailwindCSS
- **Backend:** Python, FastAPI, WebSockets (cho tính năng Multiplayer)
- **Database:** Supabase (PostgreSQL), SQLAlchemy (ORM)
- **Cache/Realtime:** Redis (quản lý Leaderboard và tối ưu hệ thống)
- **AI Integration:** OpenAI API (gpt-4o-mini)

### 5.2. Môi trường triển khai (Deployment & Infrastructure)
- **Backend:** Render hoặc tương đương.
- **Database:** Supabase.
- **Frontend:** Vercel hoặc Render.
- Hỗ trợ chạy Docker / Docker Compose cho môi trường local.

## 6. Luồng người dùng cơ bản (User Flow)
1. **Onboarding:** Truy cập web -> Đăng ký/Đăng nhập.
2. **Dashboard:** Xem cấp độ (Level), xếp hạng (Rank) hiện tại và Bảng xếp hạng chung (Leaderboard).
3. **Gameplay:** 
   - Chọn chế độ chơi (Story, Single, Custom, Multiplayer).
   - Tương tác nhập vai với NPC bằng cách nhập câu trả lời.
   - AI chấm điểm phản hồi tức thì (cộng/trừ Affinity) kèm nhận xét đánh giá.
4. **Kết quả:** Đạt/Không đạt mục tiêu (100 điểm), nhận XP, thăng hạng và quay về Dashboard.

## 7. Các cột mốc & Phiên bản (Milestones & Release Plan)
- **Giai đoạn 1:** Hoàn thiện Core AI, Story Mode cơ bản và hệ thống điểm.
- **Giai đoạn 2:** Thêm hệ thống Level, Rank, Leaderboard và Authentication.
- **Giai đoạn 3:** Ra mắt tính năng Custom Play và màn đánh Boss (Sliding Puzzle).
- **Giai đoạn 4:** Hoàn thiện tính năng Multiplayer (WebSockets) và tối ưu hóa hệ thống.
