"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateUsername = (val: string) => {
    if (val.length === 0) return "";
    if (val.length < 3 || val.length > 20) return "Username từ 3-20 ký tự!";
    if (!/^[a-zA-Z0-9_]*$/.test(val)) return "Chỉ chứa chữ, số và dấu _";
    return "";
  };

  const validatePassword = (val: string) => {
    if (val.length === 0) return "";
    if (val.length < 6) return "Mật khẩu tối thiểu 6 ký tự!";
    if (!/\d/.test(val)) return "Mật khẩu phải có ít nhất 1 số!";
    return "";
  };

  useEffect(() => {
    setUsernameError(validateUsername(username));
  }, [username]);

  useEffect(() => {
    setPasswordError(validatePassword(password));
  }, [password]);

  const isFormValid =
    username.length > 0 &&
    password.length > 0 &&
    usernameError === "" &&
    passwordError === "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        localStorage.setItem("user_id", data.user_id.toString());
        localStorage.setItem("token", data.token);
        router.push("/lobby");
      } else {
        setErrorMessage("Tên tài khoản hoặc mật khẩu không đúng");
        setErrorVisible(true);
        setTimeout(() => setErrorVisible(false), 2000);
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối server!");
      setErrorVisible(true);
      setTimeout(() => setErrorVisible(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] text-white">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[#050505] overflow-hidden">
        <div
          className="absolute inset-[-100%] animate-strip-fast will-change-transform"
          style={{
            background: `linear-gradient(
              45deg, 
              #050505 5%, 
              #39FF14 25%, 
              #00F0FF 50%, 
              #39FF14 75%, 
              #050505 95%
            )`,
            backgroundSize: '200% 200%',
            opacity: 0.5, // Tăng nhẹ độ sáng
          }}
        />

        {/* Lớp phủ mờ giúp dải màu trông sâu hơn */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#050505]/60 via-transparent to-[#050505]/60 pointer-events-none" />

        {/* Noise làm mịn dải màu */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>


      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        {/* Login Card */}
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-[#00F0FF]/90 hover:shadow-[#00F0FF]/50">
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-[#39FF14] to-[#00F0FF] bg-clip-text text-4xl font-black uppercase text-transparent drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
              Đăng nhập
            </h2>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Username Input */}
              <div className="group relative">
                <label className="mb-2 block text-sm font-bold uppercase text-[#39FF14]">
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-lg border bg-black/50 px-4 py-3 text-white outline-none transition-all placeholder:text-gray-600 ${usernameError
                    ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    : "border-white/10 focus:border-[#39FF14] focus:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                    }`}
                  placeholder="Username"
                />
                {usernameError && (
                  <p className="mt-1 text-sm font-medium text-red-300 animate-pulse">
                    {usernameError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group relative">
                <label className="mb-2 block text-sm font-bold uppercase text-[#00F0FF]">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-lg border bg-black/50 px-4 py-3 text-white outline-none transition-all placeholder:text-gray-600 ${passwordError
                      ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                      : "border-white/10 focus:border-[#00F0FF] focus:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-[#00F0FF]"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.644C3.299 8.041 7.244 4.5 12 4.5c4.756 0 8.773 3.541 9.964 7.178.07.207.07.431 0 .639C20.756 15.959 16.756 19.5 12 19.5c-4.756 0-8.773-3.541-9.964-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm font-medium text-red-300 animate-pulse">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`relative w-full overflow-hidden rounded-lg py-4 font-black uppercase tracking-widest transition-all duration-300 ${isFormValid && !isLoading
                  ? "bg-gradient-to-r from-[#39FF14] to-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95"
                  : "cursor-not-allowed border border-white/5 bg-white/5 text-gray-600"
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Chờ tí...
                  </span>
                ) : (
                  "Vào game"
                )}
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#00F0FF] transition-all hover:text-[#39FF14] hover:underline"
                >
                  Đăng ký
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Futuristic Error Notification */}
      {errorVisible && (
        <div className="fixed inset-x-0 top-10 z-50 flex justify-center px-4">
          <div className="animate-bounce rounded-lg border-2 border-red-500 bg-black/90 px-8 py-4 text-center font-black uppercase tracking-tighter text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <span className="mr-2">⚠</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Global CSS for some effects */}
      <style jsx global>{`
        @keyframes strip-fast {
          0% {
            background-position: 0% 50%;
            transform: rotate(0deg);
          }
          50% {
            /* Di chuyển dải màu cực nhanh qua điểm đối xứng */
            background-position: 100% 50%;
            transform: rotate(4deg) scale(1.1);
          }
          100% {
            background-position: 0% 50%;
            transform: rotate(0deg);
          }
        }

        .animate-strip-fast {
          /* Tốc độ 4 giây */
          animation: strip-fast 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
