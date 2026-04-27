import Link from "next/link";
import Typewriter from "./components/Typewriter";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/bg_poster.jpg"
      >
        <source src="/bg_vid.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08),transparent_70%)]" />

      {/* Content layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar with buttons */}
        <nav className="z-50 flex w-full items-center justify-end gap-3 px-6 py-4">
          {/* <Link
            href="/login"
            id="btn-login"
            // className="rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:shadow-lg hover:shadow-white/10"
            className="rounded-xl border border-cyan-300/40 bg-white/10 px-6 py-2.5 text-lg font-semibold text-white backdrop-blur-md
            transition-all duration-200 ease-out
            hover:bg-cyan-300/10 hover:border-cyan-300/70
            hover:shadow-[0_0_10px_rgba(0,240,255,0.25)]"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            id="btn-register"
            // className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-8 py-2.5 text-lg font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:from-violet-400 hover:to-indigo-400 hover:shadow-xl hover:shadow-violet-500/40"
            className="rounded-xl
            bg-gradient-to-r from-[#2eea12] to-[#00e6ff]
            px-8 py-2.5 text-lg font-semibold text-black
            shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_10px_rgba(0,240,255,0.3),0_0_30px_rgba(0,240,255,0.2)]
            transition-all duration-200 ease-out
            hover:brightness-110
            hover:shadow-[0_0_14px_rgba(0,240,255,0.35),0_0_40px_rgba(0,240,255,0.25)]
            active:scale-95"
          >
            Đăng ký
          </Link> */}

          <Link
            href="/login"
            id="btn-login"
            className="group relative px-6 py-2.5 text-lg font-black text-white transition-all duration-300 uppercase tracking-tighter"
          >
            {/* Lớp nền hình bình hành */}
            <div className="absolute inset-0 skew-x-[-20deg] border border-cyan-300/50 bg-cyan-300/10 backdrop-blur-md 
                  transition-all duration-300 group-hover:border-cyan-300 group-hover:bg-cyan-300/20 
                  group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"></div>

            {/* Nội dung giữ nguyên không nghiêng */}
            <span className="relative z-10 italic">Đăng nhập</span>
          </Link>
          <Link
            href="/register"
            id="btn-register"
            className="group relative px-8 py-2.5 text-lg font-black uppercase tracking-tighter text-black transition-all duration-300"
          >
            {/* Lớp nền hình bình hành đổ màu Gradient */}
            <div className="absolute inset-0 skew-x-[-20deg] bg-gradient-to-r from-[#2eea12] to-[#00e6ff] 
                  shadow-[0_0_20px_rgba(46,234,18,0.3)] transition-all duration-300 
                  group-hover:brightness-110 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] 
                  group-active:scale-95"></div>

            {/* Nội dung bên trong - dùng italic để hợp với độ nghiêng của nút */}
            <span className="relative z-10 italic">Đăng ký</span>
          </Link>
        </nav>

        {/* Centered hero text */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center gap-y-20 mt-[-4rem]">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] [text-shadow:2px_2px_0px_#39FF14]">
            OpenUp: học giao tiếp với AI
          </h1>
          <div className="flex flex-col gap-y-6">
            <p className="mb-3 text-3xl font-medium text-white md:text-4xl flex items-center justify-center gap-2 flex-wrap">
              <span>Bạn muốn:</span>
              <Typewriter />
            </p>
            {/* <p className="text-3xl font-semibold text-cyan-300 drop-shadow md:text-4xl"> */}
            {/* <p className="text-3xl font-semibold md:text-4xl
            bg-gradient-to-r from-[#2eea12] to-[#00e6ff]
            bg-clip-text text-transparent
            drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]"> */}
            <p className="text-3xl font-semibold md:text-4xl
            text-[#00e6ff]
            animate-pulse
            drop-shadow-[0_0_12px_rgba(0,240,255,0.45)]">
              👉🏻 Web này dành cho bạn
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
