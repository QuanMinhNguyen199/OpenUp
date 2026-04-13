import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header chỉ có ở trang chủ */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">AI Communicate</div>
        <div className="space-x-4">
          <Link href="/login" className="px-5 py-2 text-gray-700 hover:text-blue-600 transition font-medium">
            Đăng nhập
          </Link>
          <Link href="/register" className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md">
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Nội dung Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-6xl font-black text-gray-900 mb-6">Luyện giao tiếp cùng AI</h1>
        <p className="text-gray-600 max-w-xl mb-10 text-lg">Hệ thống thực chiến giúp bạn làm chủ mọi tình huống giao tiếp.</p>
        <Link href="/register" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold">Thử ngay miễn phí</Link>
      </section>
    </main>
  );
}

