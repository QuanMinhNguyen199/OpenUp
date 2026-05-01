# Weekly Journal

Ghi lại hành trình xây dựng sản phẩm mỗi tuần — những gì đã làm, học được gì, AI giúp như thế nào.

> **Cập nhật mỗi cuối tuần** (trước khi tạo PR). Không cần dài, chỉ cần thật.

---

## Tuần 5 — 1/5/2026
**Thành viên:** Nguyễn Minh Quân, Nguyễn Minh Trí

### Đã làm
- ui lobby, loading
- fix cursor
- add guardrail
- refactor lại backend
- update file seed cho supabase

### Khó nhất tuần này
- thống nhất gameplay

### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Gemini | vibecode | layout cơ bản |

### Học được
- k có

### Nếu làm lại, sẽ làm khác
- k có

### Kế hoạch tuần tới
- Hoàn thiện singleplayer mode
- fix redis client 

---

## Tuần 4 — 24/04/2026
**Thành viên:** Nguyễn Minh Quân, Nguyễn Minh Trí

### Đã làm
- Hoàn thiện bộ UI đồng nhất cho cụm màn hình Login/Register
- chốt gameplay tổng quan cho story mode
- deploy fe và be
- xây prompt mẫu

### Khó nhất tuần này
- thống nhất gameplay cho ngưởi chơi

### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Gemini | Nhờ nhận xét gameplay mới và cũ, tham khảo 1 số hướng triển khai màn cuối | chốt đc gameplay và màn cuối |

### Học được
- cách deploy 1 dự án

### Nếu làm lại, sẽ làm khác
- k có

### Kế hoạch tuần tới
- Hoàn thiện các prompt cho story mode
- Tạo UI lobby
- Làm route phản hồi cho story mode

---

## Tuần 3 — 17/04/2026
**Thành viên:** Nguyễn Minh Quân, Nguyễn Minh Trí

### Đã làm
- hoàn thiện ui home, fix luồng login
- chốt lại flow login/register
- Thiết kế và áp dụng cơ chế Token-based Authentication thủ công để duy trì phiên đăng nhập (Persistent Session) mà không cần bắt người dùng đăng nhập lại khi refresh trang

### Khó nhất tuần này
- Xây dựng cơ chế xác thực người dùng (Verify User) an toàn nhưng vẫn đảm bảo trải nghiệm người chơi không bị gián đoạn khi tắt/mở trình duyệt.

### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Gemini | Tư vấn kiến trúc hệ thống xác thực và cách thức triển khai Token bảo mật tối ưu cho dự án quy mô nhỏ | Triển khai thành công cột token trong bảng users và logic verify qua Middleware, giải quyết triệt để vấn đề "mò ID" người dùng khác.
 |

### Học được
- Hiểu rõ sự khác biệt và cách phối hợp giữa State (Frontend) và Persistence (Backend/Database).
- Nắm vững quy trình trao đổi thông tin qua HTTP Headers để tăng tính bảo mật cho ứng dụng web

### Nếu làm lại, sẽ làm khác
- k có

### Kế hoạch tuần tới
- Hoàn thiện bộ UI đồng nhất cho cụm màn hình Login/Register
- Chốt thiết kế và triển khai màn hình Dashboard/Lobby (màn hình đầu tiên sau khi đăng nhập thành công) để chuẩn bị cho các tính năng tương tác với NPC

---

## Tuần 2 — 10/04/2026
**Thành viên:** Nguyễn Minh Quân, Nguyễn Minh Trí, Nguyễn Minh Tuấn

### Đã làm
- setup project nextjs
- refactor lại cấu trúc của dự án thành backend và frontend riêng
- code homepage, UI login/register cơ bản
- test prompt để xem tính khả thi của topic

### Khó nhất tuần này
- viết thử system prompt tạo tình huống

### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Gemini | hỏi về luồng login/register | register được bằng email |

### Học được
- supabase hỗ trợ quản lý các phương thức đăng nhập cho dự án

### Nếu làm lại, sẽ làm khác
- đổi be sang dùng typescript để giảm các bước cấu hình

### Kế hoạch tuần tới
- hoàn thiện flow login/register, màn set userId, display name
- code màn hình vào game ban đầu cho role user
- Tạo đc npcs with behaviors và collection

---

## Tuần 1 — 04/04/2026
**Thành viên:** Nguyễn Minh Quân, Nguyễn Minh Trí, Nguyễn Minh Tuấn

### Đã làm
- Đã clone đc git file 
- Setup hook và team viết được PRD
- Học cách fill in Journal và Worklog
- Đã lựa chọn được topic cho project
- Gamification Học Tập — Quest-Based Learning Engine.
- Xác định xong 3 vai trò chính: Backend/Game Logic, AI/Quest Master và Frontend/UI-UX.

### Khó nhất tuần này
- Định hướng và bắt đầu bước đầu làm project

### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Gemini | Hỏi đáp về cách làm project và PRD | Biết cách làm và nội dung của project |

### Học được
- Hiểu rằng việc có một bản Brief và PRD tốt giúp team 3 người không bị chồng chéo công việc.
- Hiểu cách dùng AI không chỉ để chat mà để đóng vai trò "Quest Master" tự động tạo nội dung dựa trên dữ liệu người dùng.

### Nếu làm lại, sẽ làm khác
- Sẽ dành nhiều thời gian hơn để nghiên cứu kỹ các đối thủ như Duolingo hay Habitica ngay từ ngày đầu tiên để có cái nhìn trực quan hơn về UI/UX, thay vì mất thời gian tranh luận suông về các tính năng.

### Kế hoạch tuần tới
- Thiết kế chi tiết Database trên PostgreSQL và setup API cơ bản với Anthropic API.
- Viết và tối ưu Prompt cho hệ thống "Adaptive Quest Generation" (sinh nhiệm vụ theo trình độ) sử dụng ngôn ngữ Python.
- Học thiết kế UI bằng Next.js.

---

## Template

```markdown
## Tuần N — DD/MM/YYYY

### Đã làm
-

### Khó nhất tuần này
-

### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Claude Code | | |

### Học được
-

### Nếu làm lại, sẽ làm khác
-

### Kế hoạch tuần tới
-
```

---

## Ví dụ

### Tuần 1 — 31/03/2026

**Thành viên:** Nguyễn Văn A, Trần Thị B, Lê Văn C

#### Đã làm
- Setup project TypeScript + cấu hình `.env`
- Xây dựng agent loop cơ bản: nhận input → gọi Claude API → in output
- Thêm tool `search_web` đầu tiên (dùng Brave Search API)
- Viết README cho repo nhóm

#### Khó nhất tuần này
- Tool call response của Claude trả về sai format — mất 2 tiếng debug mới phát hiện ra thiếu `"type": "tool_result"` trong message history.
- Lần đầu dùng TypeScript nên type error khá nhiều, phải học cách dùng `as` và generic.

#### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Claude Code | Giải thích Anthropic tool use API, debug message format | Giải quyết được bug trong 15 phút |
| Cursor | Autocomplete TypeScript types | Tiết kiệm khoảng 30% thời gian gõ |

#### Học được
- Tool use trong Claude hoạt động theo vòng lặp: model gọi tool → app trả kết quả → model tiếp tục. Cần giữ đúng message history.
- `zod` rất hữu ích để validate tool input schema.
- Nên đặt timeout cho API call ngay từ đầu, không để sau mới thêm.

#### Nếu làm lại, sẽ làm khác
- Setup TypeScript strict mode ngay từ đầu thay vì thêm sau (refactor mệt hơn).
- Viết unit test cho `parseToolCall()` trước khi tích hợp vào agent loop.

#### Kế hoạch tuần tới
- Thêm tool `read_file` và `write_file`
- Implement memory: lưu conversation history vào file JSON
- Thử chạy agent giải 1 bài tập thực tế

---

### Tuần 2 — 07/04/2026

**Thành viên:** Nguyễn Văn A, Trần Thị B, Lê Văn C

#### Đã làm
- Thêm tool `read_file`, `write_file`, `list_dir`
- Agent có thể tự đọc file trong repo và đề xuất refactor
- Implement conversation memory: lưu 20 message gần nhất
- Thử nghiệm: cho agent tự fix 3 bug đơn giản → thành công 2/3

#### Khó nhất tuần này
- Memory bị lỗi khi conversation quá dài (vượt context window). Phải implement sliding window: chỉ giữ system prompt + 20 message gần nhất.
- Agent đôi khi loop vô hạn khi tool trả lỗi — chưa có stop condition tốt.

#### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Claude Code | Thiết kế sliding window memory, review code agent loop | Phát hiện thêm edge case khi tool throw exception |
| Gemini CLI | So sánh approach lưu memory: file JSON vs SQLite | Tư vấn dùng JSON cho prototype, SQLite khi cần query |

#### Học được
- Context window là resource có hạn — cần thiết kế memory strategy từ sớm.
- Stop condition quan trọng không kém gì agent logic: `max_iterations`, `no_new_tool_calls`, `explicit_done`.
- AI agent review code của mình rất có ích: Claude Code tìm ra 2 potential null pointer mà mình bỏ sót.

#### Nếu làm lại, sẽ làm khác
- Viết interface `Memory` trước, rồi implement sau — thay vì hard-code array từ đầu.
- Log tất cả tool call ra file ngay từ đầu để debug dễ hơn.

#### Kế hoạch tuần tới
- Fix vòng lặp vô hạn: thêm `max_iterations = 10`
- Thêm tool `run_tests` để agent tự kiểm tra code sau khi sửa
- Demo cho instructor cuối tuần
