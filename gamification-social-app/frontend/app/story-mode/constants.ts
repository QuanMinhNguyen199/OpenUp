// Shared constants for Story Mode

export const CHAPTERS = [
    { id: 1, name: "Chapter 1", title: "Linh - Kẻ Lươn Lẹo", npcName: "Linh", location: "Văn phòng" },
    { id: 2, name: "Chapter 2", title: "Bác Bảo - Cổng Trường", npcName: "Bác Bảo", location: "Cổng trường" },
    { id: 3, name: "Chapter 3", title: "Chị Mai - Quán Cafe", npcName: "Chị Mai", location: "Quán Café" },
    { id: 4, name: "Chapter 4", title: "Nam - Sân Bóng", npcName: "Nam", location: "Sân bóng" },
    { id: 5, name: "Chapter 5", title: "Cô Hoa - Khu Chợ", npcName: "Cô Hoa", location: "Chợ" },
    { id: 6, name: "Chapter 6", title: "Hoàng - Thư Viện", npcName: "Hoàng", location: "Thư viện" },
    { id: 7, name: "Chapter 7", title: "Cụ Phan - Đền Cổ", npcName: "Cụ Phan", location: "Đền Cổ" },
    { id: 8, name: "Chapter Cuối", title: "Thử Thách Giải Đố", npcName: "Boss", location: "???" },
];

export const LESSONS: Record<number, { title: string, content: string }> = {
    1: { title: "Sự Khôn Khéo", content: "Học cách từ chối khéo léo những yêu cầu vô lý và sẵn sàng giúp đỡ khi có lý do chính đáng. Sự cả nể không đúng chỗ sẽ làm hại bản thân." },
    2: { title: "Sự Tôn Trọng", content: "Tôn trọng nguyên tắc và quy định. Đối mặt với người thi hành công vụ cần sự thành thật, lễ phép và kiên nhẫn giải thích thay vì chống đối hoặc dùng tiền bạc." },
    3: { title: "Sự Thấu Cảm", content: "Lắng nghe là một nghệ thuật. Khi người khác mang tâm trạng tiêu cực, một cái gật đầu chân thành và lời khuyên bình tĩnh có sức mạnh to lớn hơn vạn lời trách móc." },
    4: { title: "Tinh Thần Đồng Đội", content: "Trong tập thể, lỗi lầm không quan trọng bằng cách chúng ta cùng nhau khắc phục nó. Sự khích lệ và đồng cảm sẽ gắn kết đồng đội vượt qua lúc khó khăn." },
    5: { title: "Sự Sẻ Chia", content: "Đừng vô cảm trước nỗi vất vả của người lao động. Một hành động giúp đỡ nhỏ nhoi hay sự trung thực trả lại tiền thừa đều gieo mầm cho những giá trị tử tế trong xã hội." },
    6: { title: "Văn Hóa Ứng Xử", content: "Sự tập trung của mỗi người đều đáng quý. Biết nhận lỗi khi làm ồn và chủ động giúp đỡ người khác là biểu hiện của một văn hóa ứng xử văn minh." },
    7: { title: "Sự Thông Thái", content: "Trí tuệ thực sự không chỉ nằm ở kiến thức mà còn ở cách ta đối nhân xử thế. Lựa chọn sự thật dù khó khăn và chăm chỉ từ những việc nhỏ bé nhất là cốt lõi của đạo làm người." }
};
