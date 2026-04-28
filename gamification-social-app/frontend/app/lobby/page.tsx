'use client';

export default function LobbyPage() {
    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden p-8 cyber-grid">

            {/* 1. Top Section: Player Info */}
            <div className="relative z-10 flex items-center gap-4">
                {/* Avatar vát góc */}
                <div className="h-16 w-16 bg-gradient-to-br from-[#39FF14] to-[#00F0FF] [clip-path:polygon(25%_0%,_100%_0%,_75%_100%,_0%_100%)] p-[2px]">
                    <div className="h-full w-full bg-black [clip-path:polygon(25%_0%,_100%_0%,_75%_100%,_0%_100%)] flex items-center justify-center font-black text-cyan-400">
                        OP
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                        CYBER_USER_01
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="bg-[#39FF14] px-2 text-xs font-bold text-black uppercase">Lv. 15</span>
                        {/* Thanh EXP */}
                        <div className="h-2 w-48 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                            <div className="h-full bg-gradient-to-r from-[#39FF14] to-[#00e6ff] shadow-[0_0_10px_#39FF14]" style={{ width: '65%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Center: Decor (Hologram Effect) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-[500px] h-[500px] border border-cyan-500/30 rounded-full animate-spin-slow flex items-center justify-center">
                    <div className="w-[400px] h-[400px] border border-[#39FF14]/20 rounded-full animate-reverse-spin"></div>
                </div>
            </div>

            {/* 3. Right: Main Menu */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-end">
                {[
                    { name: "Story Mode", desc: "Khám phá thế giới AI" },
                    { name: "Single Player", desc: "Luyện tập 1-1" },
                    { name: "Multiplayer", desc: "Thách đấu cộng đồng" }
                ].map((item, index) => (
                    <button key={index} className="group relative text-right">
                        <div className="relative z-10 pr-4 transition-all group-hover:pr-8">
                            <span className="block text-xs uppercase text-[#39FF14] font-bold tracking-widest">{item.desc}</span>
                            <span className="text-4xl font-black uppercase italic group-hover:text-[#00F0FF] transition-colors">
                                {item.name}
                            </span>
                        </div>
                        {/* Thanh gạch dưới khi hover */}
                        <div className="absolute bottom-0 right-0 h-[2px] w-0 bg-[#00F0FF] transition-all group-hover:w-full shadow-[0_0_10px_#00F0FF]"></div>
                    </button>
                ))}
            </div>

            {/* 4. Bottom Bar */}
            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end border-t border-white/10 pt-4">
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
                    System Status: <span className="text-green-500 animate-pulse">Operational</span>
                </div>
                <div className="flex gap-4">
                    <button className="text-xs font-bold hover:text-[#39FF14] transition-colors italic">// SETTINGS</button>
                    <button className="text-xs font-bold hover:text-red-500 transition-colors italic">// LOGOUT</button>
                </div>
            </div>

            <style jsx>{`
        .animate-spin-slow { animation: spin 20s linear infinite; }
        .animate-reverse-spin { animation: spin-reverse 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
        </div>
    );
}