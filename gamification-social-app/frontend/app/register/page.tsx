"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    
    alert("Đăng ký thành công! Hãy kiểm tra email (nếu có yêu cầu xác nhận).");
    router.push("/game");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="w-96 bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-6 text-center">Tạo tài khoản mới</h2>
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded-lg" onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" className="w-full p-3 mb-6 border rounded-lg" onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">Đăng ký tài khoản</button>
      </form>
    </div>
  );
}