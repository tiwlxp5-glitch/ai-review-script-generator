"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-3.5 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-2 shadow-lg shadow-purple-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ตั้งรหัสผ่านใหม่
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            กรุณากำหนดรหัสผ่านใหม่ที่คุณต้องการใช้งาน
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 relative overflow-hidden border border-slate-800/80 shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {success ? (
            <div className="text-center space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white leading-snug">
                  เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  คุณสามารถใช้รหัสผ่านใหม่ในการเข้าสู่ระบบและเริ่มใช้งานได้ทันที
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    router.refresh();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 transition cursor-pointer min-h-[48px]"
                >
                  <span>เข้าสู่ระบบ และไปหน้าสร้างสคริปต์</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                >
                  รหัสผ่านใหม่ (New Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••••••• (อย่างน้อย 6 ตัวอักษร)"
                    className="glass-input w-full pl-10 pr-4 py-3 text-xs sm:text-sm min-h-[48px] rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                >
                  ยืนยันรหัสผ่านใหม่ (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="•••••••• (กรอกรหัสผ่านใหม่อีกครั้ง)"
                    className="glass-input w-full pl-10 pr-4 py-3 text-xs sm:text-sm min-h-[48px] rounded-xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[48px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span>กำลังอัปเดตรหัสผ่าน...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>บันทึกรหัสผ่านใหม่</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Assurance Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
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
