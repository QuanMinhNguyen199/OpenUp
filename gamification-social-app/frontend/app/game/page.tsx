"use client";
import { useState, useEffect } from 'react';

export default function GamePage() {
  const [gameState, setGameState] = useState<any>(null);
  const [affection, setAffection] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [status, setStatus] = useState<'playing' | 'win' | 'lose'>('playing');

  const fetchNextTurn = async (isNew: boolean = false) => {
    setLoading(true);
    setSelectedAns(null);
    const res = await fetch('/api/game', {
      method: 'POST',
      body: JSON.stringify({ 
        history, 
        currentAffection: isNew ? 0 : affection, 
        isNewGame: isNew,
        userName: 'Hùng'
      }),
    });
    const data = await res.json();
    // Trộn mảng đáp án ngay tại đây
    if (data.answers && Array.isArray(data.answers)) {
        data.answers = data.answers.sort(() => Math.random() - 0.5);
    }
    setGameState(data);
    if (isNew) setAffection(data.initial_affection);
    setLoading(false);
  };

  useEffect(() => { fetchNextTurn(true); }, []);

  const handleAnswer = (ansObj: any, index: number) => {
    setSelectedAns(index);
    const newAffection = affection + ansObj.quantity;
    setAffection(newAffection);

    // Lưu vào lịch sử để gửi cho AI lượt sau
    setHistory([...history, { 
      context: gameState.context_update, 
      npc_say: gameState.npc_say, 
      user_ans: ansObj.ans 
    }]);

    if (newAffection <= 0) setStatus('lose');
    else if (newAffection >= 100) setStatus('win');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Đang kết nối với AI...</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header chỉ số */}
      <div className="flex justify-between font-bold text-lg">
        <span>💘 Thiện cảm: {affection}%</span>
      </div>

      {/* Box tình huống */}
      <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-sm italic text-gray-600 mb-2">{gameState?.context_update}</p>
        <p className="font-semibold text-blue-600">"{gameState?.npc_say}"</p>
      </div>

      {/* Danh sách đáp án */}
      <div className="space-y-3">
        {gameState?.answers.map((item: any, i: number) => (
          <button
            key={i}
            disabled={selectedAns !== null}
            onClick={() => handleAnswer(item, i)}
            className={`text-blue-600 w-full p-4 text-left rounded-xl border transition-all ${
              selectedAns === i 
                ? (item.quantity > 0 ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500") 
                : "bg-white hover:border-blue-300"
            }`}
          >
            {item.ans}
          </button>
        ))}
      </div>

      {/* Hiển thị lý do và nút tiếp theo */}
      {selectedAns !== null && status === 'playing' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded mb-4">
            💡 {gameState.answers[selectedAns].reason}
          </p>
          <button onClick={() => fetchNextTurn()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
            Tiếp tục hội thoại
          </button>
        </div>
      )}

      {/* Trạng thái Kết thúc */}
      {status !== 'playing' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl text-center">
            <h2 className="text-green-600 text-2xl font-bold mb-4">{status === 'win' ? "🏆 CHIẾN THẮNG!" : "💀 THẤT BẠI..."}</h2>
            <p className="mb-6 text-green-500">{status === 'win' ? "Bạn đã chinh phục được cô ấy. Nhận +10 XP & +10 Vàng." : "Cô ấy đã chặn số bạn rồi."}</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-2 rounded-full">
              Chơi lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}