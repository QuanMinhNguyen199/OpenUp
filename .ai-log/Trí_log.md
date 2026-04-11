## 08/04
- **Vấn đề:** Cần hoàn thiện trang giới thiệu và các trang chức năng đăng nhập/đăng ký sau khi cấu hình xong Supabase SSR.
- **AI Suggestion:** Tách biệt Header trang chủ (Landing Page) vào trong file `page.tsx`; xây dựng 2 route `/login` và `/register` sử dụng Browser Client để tương tác trực tiếp với Auth API của Supabase.
- **Thay đổi:** Hoàn thiện UI cho `app/page.tsx`; tạo form xử lý tại `app/login` và `app/register`; thiết lập luồng chuyển hướng người dùng vào `/game` sau khi xác thực thành công.

## 5/4
- **Vấn đề**: dùng nextjs tạo project dạy giao tiếp, khi bấm bắt đầu có tình huống gen bởi AI cùng 3 lựa chọn cho user. Mỗi khi user chọn thì sẽ có câu phản hồi của npc kèm lựa chọn mới. Độ thiện cảm về 0 là thua, 100 thì thắng
- **AI Suggestion**: tạo project nextjs dùng chung cho cả FE và BE, còn database dùng supabase