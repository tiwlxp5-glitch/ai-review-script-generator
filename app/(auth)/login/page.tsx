"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองอีกครั้ง");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดขึ้นในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-3.5 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-2 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            เข้าสู่ระบบ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ยินดีต้อนรับกลับ! เข้าใช้งานเครื่องมือสร้างสคริปต์ AI
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 relative overflow-hidden border border-slate-800/80 shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="glass-input w-full pl-10 pr-4 py-3 text-xs sm:text-sm min-h-[48px] rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  รหัสผ่าน (Password)
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-purple-400 hover:text-purple-300 transition underline underline-offset-4"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-4 py-3 text-xs sm:text-sm min-h-[48px] rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[48px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center space-y-4">
            <p className="text-xs sm:text-sm text-slate-400">
              ยังไม่มีบัญชีผู้ใช้งาน?{" "}
              <Link
                href="/signup"
                className="font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 transition"
              >
                สมัครสมาชิก
              </Link>
            </p>

            {/* Security Guarantee Banner */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] sm:text-xs text-slate-300 flex items-center justify-center space-x-2 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ไม่ต้องห่วงเรื่องความปลอดภัย เพราะทุกข้อมูล รวมถึงบัญชีคุณจะปลอดภัย 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
