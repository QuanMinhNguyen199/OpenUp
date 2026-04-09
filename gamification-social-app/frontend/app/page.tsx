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


// // app/page.tsx
// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header chỉ dành riêng cho trang chủ */}
//       <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
//         <div className="text-2xl font-bold text-blue-600">AI Communicate</div>
//         <div className="space-x-4">
//           <Link href="/login" className="px-5 py-2 text-gray-700 font-medium hover:text-blue-600 transition">
//             Đăng nhập
//           </Link>
//           <Link href="/register" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-md">
//             Đăng ký
//           </Link>
//         </div>
//       </header>

//       {/* Nội dung giới thiệu (Hero Section) */}
//       <main className="flex flex-col items-center justify-center text-center px-6 py-20">
//         <h1 className="text-6xl font-black text-gray-900 leading-tight mb-6">
//           Giao tiếp tự tin <br />
//           <span className="text-blue-600">với trợ lý AI</span>
//         </h1>
//         <p className="text-lg text-gray-500 max-w-2xl mb-10">
//           Hệ thống luyện tập giao tiếp thông minh giúp bạn xử lý mọi tình huống 
//           từ công sở đến đời thường một cách tinh tế nhất.
//         </p>
//         <div className="flex gap-4">
//           <Link href="/register" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition">
//             Bắt đầu miễn phí
//           </Link>
//           <button className="px-8 py-4 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition">
//             Xem bản demo
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// }


// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
