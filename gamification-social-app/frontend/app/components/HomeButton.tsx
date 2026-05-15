"use client";

import Link from "next/link";

const HomeButton = () => {
    return (
        <Link 
            href="/lobby" 
            className="group relative flex items-center justify-center p-3 border border-[#00F0FF]/30 bg-black/40 hover:bg-[#00F0FF]/10 transition-all duration-300 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:border-[#00F0FF]"
        >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-[#00F0FF]"></div>
            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-[#00F0FF]"></div>
            <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-[#00F0FF]"></div>
            <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-[#00F0FF]"></div>

            <div className="flex flex-col items-center">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-6 h-6 text-[#00F0FF] group-hover:scale-110 transition-transform"
                >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="h-0 overflow-hidden group-hover:h-4 group-hover:mt-2 text-[10px] font-black uppercase tracking-widest text-[#00F0FF] transition-all duration-300">
                    LOBBY
                </span>
            </div>
        </Link>

    );
};

export default HomeButton;
