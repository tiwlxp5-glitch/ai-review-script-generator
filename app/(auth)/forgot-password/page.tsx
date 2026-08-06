"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSent, setSuccessSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: redirectUrl,
        }
      );

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSuccessSent(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-4 shadow-lg shadow-purple-500/10">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ลืมรหัสผ่าน?
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-800/80 shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {successSent ? (
            <div className="text-center space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  กรุณาเช็กกล่องข้อความอีเมลของคุณที่:
                </p>
                <p className="font-mono text-xs sm:text-sm text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl inline-block font-semibold">
                  {email}
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  (หากไม่พบใน Inbox กรุณาตรวจสอบในโฟลเดอร์ อีเมลขยะ / Spam)
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>กลับไปยังหน้าเข้าสู่ระบบ</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                >
                  อีเมลบัญชีของคุณ (Registered Email)
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>กำลังส่งอีเมลรีเซ็ต...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
                </Link>
              </div>
            </form>
          )}

          {/* Security Assurance Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-center space-x-2">
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
