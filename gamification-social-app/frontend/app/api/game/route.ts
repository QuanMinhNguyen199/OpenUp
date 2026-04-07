import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { history, currentAffection, isNewGame, userName } = await req.json();

    if (isNewGame) {
      const prompt = `
        Bạn là Game Master cho trò chơi "Giao tiếp tạo thiện cảm". 
        Nhiệm vụ: 
        - Tạo ra tình huống giao tiếp ngẫu nhiên giữa user (nhân vật nam, tên là "${userName}") và một nhân vật nữ có tính cách ngẫu nhiên (nhưng không tiết lộ cho user biết).
        - Mô tả bối cảnh, thời gian, địa điểm, tên nhân vật nữ, mối quan hệ hoặc sự việc đã/đang xảy ra giữa 2 người, độ thiện cảm ban đầu (dựa vào tình huống và mối quan hệ, trong khoảng 20-60).
        - Có thể cho nhân vật nữ hành động/bắt chuyện trước hoặc cho nhân vật của user chọn hành động/câu nói trước.
        - Phải trả về định dạng JSON chính xác như sau:
        {
          "context_update": "Mô tả bối cảnh/diễn biến (không được nêu suy nghĩ/ý định nội tâm của nhân vật nữ, không cần nêu độ thiện cảm)",
          "npc_say": "Câu nói của nhân vật nữ (nếu nhân vật của user hành động/bắt chuyện trước thì trả về string rỗng)",
          "initial_affection": number,
          "answers": [
            {"ans": "Câu nói/hành động gây mất thiện cảm", "quantity": -10, "reason": "Giải thích tại sao gây mất thiện cảm"},
            {"ans": "Câu nói/hành động không tạo ấn tượng", "quantity": 0, "reason": "Giải thích tại sao không tạo ấn tượng"},
            {"ans": "Câu nói/hành động tăng thiện cảm", "quantity": 10, "reason": "Giải thích tại sao tạo thiện cảm"}
          ],
          "personality": "tính cách/nhân cách của nhân vật nữ"
        }
        - 3 đáp án phải khiến user phân vân khi chọn, đoạn nào trong mỗi đáp án là lời nói thì bọc trong dấu "".
        - các nhân vật là người Việt Nam, nói chuyện theo văn hóa người Việt.
      `
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
    }

    let context = "";
    let effectiveHistory = history;

    // 1. Logic Tóm tắt nếu lịch sử > 3 lượt
    if (history.length > 3) {
      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Bạn là trợ lý tóm tắt cốt truyện game. Hãy tóm tắt diễn biến 3 lượt hội thoại gần nhất thành 1 câu duy nhất để làm ngữ cảnh mới." },
          { role: "user", content: JSON.stringify(history.slice(-3)) }
        ],
      });
      context = summaryResponse.choices[0].message.content || "";
      effectiveHistory = history.slice(-1); // Giữ lại lượt gần nhất để AI bám sát mạch
    }

    // 2. Prompt chính để tạo tình huống và đáp án
    const systemPrompt = `
      Bạn là Game Master cho trò chơi "Giao tiếp tạo thiện cảm". 
      Nhiệm vụ: Tạo ra tình huống giao tiếp giữa User (Nam) và một nhân vật nữ ngẫu nhiên.
      
      Yêu cầu:
      - Nếu là isNewGame: Tạo bối cảnh mới, thời gian, địa điểm bất cứ đâu, tên nhân vật nữ, độ thiện cảm ban đầu (20-60).
      - Nếu tiếp tục: Dựa vào context và history để viết tiếp diễn biến. Có thể thêm sự cố hoặc nhân vật phụ tác động.
      - Phải trả về định dạng JSON chính xác như sau:
      {
        "context_update": "Mô tả bối cảnh/diễn biến mới",
        "npc_say": "Câu nói của nhân vật nữ",
        "initial_affection": number,
        "answers": [
          {"ans": "Câu vô duyên", "quantity": -10, "reason": "Giải thích ngắn gọn tại sao câu này gây mất điểm"},
          {"ans": "Câu nhạt nhẽo", "quantity": 0, "reason": "Giải thích tại sao câu này không tạo được ấn tượng"},
          {"ans": "Câu tinh tế", "quantity": 10, "reason": "Giải thích tại sao câu này ghi điểm mạnh"}
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...effectiveHistory.map((h: any) => ({
          role: "assistant", 
          content: `Cảnh: ${h.context}. Cô ấy nói: ${h.npc_say}. User chọn: ${h.user_ans}`
        })),
        { role: "user", content: `Ngữ cảnh tóm tắt: ${context}. Độ thiện cảm hiện tại: ${currentAffection}. Hãy tiếp tục!` }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (error) {
    return NextResponse.json({ error: "Lỗi gọi AI" }, { status: 500 });
  }
}