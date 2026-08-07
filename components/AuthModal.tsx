"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authErr) {
          if (authErr.message.includes("Invalid login credentials")) {
            throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองอีกครั้ง");
          }
          throw new Error(authErr.message);
        }
      } else {
        const { error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split("@")[0],
            },
          },
        });
        if (authErr) throw new Error(authErr.message);
      }

      setLoading(false);
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      console.error("Auth modal error:", err);
      setError(err?.message || "เกิดข้อผิดพลาดขึ้นในการทำรายการ");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-purple-500/30 shadow-2xl bg-slate-950/95 space-y-5 text-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High-Converting Banner Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>รับสคริปต์รีวิวฟรีทันที!</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {mode === "login"
              ? "เข้าสู่ระบบเพื่อรับสคริปต์ของคุณ ✨"
              : "สมัครสมาชิกฟรีใน 1 นาที ✨"}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            สคริปต์รีวิวสินค้าและตาราง B-Roll ของคุณถูกเตรียมไว้พร้อมประมวลผลแล้ว
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              mode === "login"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            เข้าสู่ระบบ (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2 rounded-lg transition ${
              mode === "signup"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            สมัครสมาชิกใหม่ (Signup)
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                ชื่อที่ต้องการให้เรียก (Display Name)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น พี่ทิว สายรีวิว"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              อีเมล (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ & สั่งสร้างสคริปต์ทันที</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกฟรี & สั่งสร้างสคริปต์ทันที</span>
              </>
            )}
          </button>
        </form>

        {/* Security Guarantee Banner */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ข้อมูลสินค้าที่คุณกรอกจะถูกนำไปสร้างสคริปต์ให้อัตโนมัติหลังล็อกอิน</span>
        </div>
      </div>
    </div>
  );
}
