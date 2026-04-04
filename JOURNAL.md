# Weekly Journal

Ghi lại hành trình xây dựng sản phẩm mỗi tuần — những gì đã làm, học được gì, AI giúp như thế nào.

> **Cập nhật mỗi cuối tuần** (trước khi tạo PR). Không cần dài, chỉ cần thật.

---

## Template

```markdown
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
| Gemini | Hỏi đáp về cách làm project và PRD | Biết cách làm và nội dung của project |

### Học được
- Hiểu rằng việc có một bản Brief và PRD tốt giúp team 3 người không bị chồng chéo công việc.
- Hiểu cách dùng AI không chỉ để chat mà để đóng vai trò "Quest Master" tự động tạo nội dung dựa trên dữ liệu người dùng.
### Nếu làm lại, sẽ làm khác
- Sẽ dành nhiều thời gian hơn để nghiên cứu kỹ các đối thủ như Duolingo hay Habitica ngay từ ngày đầu tiên để có cái nhìn trực quan hơn về UI/UX, thay vì mất thời gian tranh luận suông về các tính năng.

### Kế hoạch tuần tới
- Thành viên 1 (BE): Thiết kế chi tiết Database trên PostgreSQL và setup API cơ bản với Anthropic API.

- Thành viên 2 (AI): Viết và tối ưu Prompt cho hệ thống "Adaptive Quest Generation" (sinh nhiệm vụ theo trình độ) sử dụng ngôn ngữ Python.

- Thành viên 3 (FE): Học thiết kế UI bằng Next.js.

Cả team: Hoàn thiện Bước 3 (Data Preparation) - tạo bộ dataset mẫu gồm 20 nhiệm vụ đầu tiên.
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
