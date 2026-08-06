"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            display_name: displayName || email.split("@")[0],
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // If user session created immediately (e.g. email confirmation disabled in Supabase)
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation is required
        setEmailConfirmationNeeded(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดขึ้นในการสมัครสมาชิก");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-md">
        {emailConfirmationNeeded ? (
          /* Dedicated Email Confirmation Instruction View */
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl bg-slate-950/90 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Top Mail Icon Badge */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-xl shadow-purple-500/30 text-white mx-auto ring-4 ring-purple-500/20">
              <Mail className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>สมัครสมาชิกสำเร็จ!</span>
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                กรุณาตรวจสอบอีเมลของคุณ
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                เราได้ส่งลิงก์ยืนยันตัวตนไปที่อีเมล:
              </p>
              <p className="font-mono text-sm text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl inline-block font-semibold">
                {email}
              </p>
            </div>

            {/* Clear Step-by-Step Instructions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3 text-xs sm:text-sm">
              <p className="font-bold text-slate-200 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>ขั้นตอนการกดยืนยันตัวตน:</span>
              </p>
              <ol className="space-y-2.5 text-slate-300 leading-relaxed">
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                    1
                  </span>
                  <span>เปิดแอปหรือกล่องข้อความอีเมลของคุณ</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                    2
                  </span>
                  <span>
                    กดที่ปุ่มสีฟ้า{" "}
                    <strong className="text-purple-300 font-semibold underline">
                      "Confirm your mail"
                    </strong>{" "}
                    ในอีเมล
                  </span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                    3
                  </span>
                  <span>
                    เมื่อยืนยันแล้ว สามารถกดเข้าสู่ระบบแล้วเริ่มสร้างสคริปต์ได้ทันที!
                  </span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 transition"
              >
                <span>ไปยังหน้าเข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setEmailConfirmationNeeded(false)}
                className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
              >
                ต้องการเปลี่ยนอีเมลหรือกรอกข้อมูลใหม่?
              </button>
            </div>
          </div>
        ) : (
          /* Normal Signup Form View */
          <>
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-4 shadow-lg shadow-purple-500/10">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                สมัครสมาชิก
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                สร้างบัญชีใหม่เพื่อเริ่มสร้างสคริปต์รีวิวสินค้าด้วย AI
              </p>
            </div>

            {/* Glassmorphic Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-800/80 shadow-2xl">
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    ชื่อผู้ใช้งาน (Display Name)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="สมชาย สายรีวิว"
                      className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

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
                      className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (อย่างน้อย 6 ตัวอักษร)"
                      className="glass-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>กำลังสมัครสมาชิก...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>สมัครสมาชิก</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer inside card */}
              <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
                <p className="text-sm text-slate-400">
                  มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 transition"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
