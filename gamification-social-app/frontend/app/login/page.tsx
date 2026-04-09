"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    
    // Đăng nhập xong thì dẫn vào trang game
    router.push("/game");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="w-96 bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded-lg" onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" className="w-full p-3 mb-6 border rounded-lg" onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Vào game ngay</button>
      </form>
    </div>
  );
}