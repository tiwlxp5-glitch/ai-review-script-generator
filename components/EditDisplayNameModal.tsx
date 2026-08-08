"use client";

import { useState, useEffect } from "react";
import { X, User, Check, AlertCircle, Loader2, Save } from "lucide-react";

interface EditDisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisplayName: string;
  onNameUpdated: (newName: string) => void;
}

export default function EditDisplayNameModal({
  isOpen,
  onClose,
  currentDisplayName,
  onNameUpdated,
}: EditDisplayNameModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setDisplayName(currentDisplayName);
    setError(null);
    setSuccess(false);
  }, [currentDisplayName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();

    if (!trimmed || trimmed.length < 2) {
      setError("ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 2 ตัวอักษร");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนชื่อ");
      }

      setSuccess(true);
      onNameUpdated(trimmed);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "ไม่สามารถเปลี่ยนชื่อได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-card rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-8 border border-purple-500/30 shadow-2xl bg-slate-950/95 space-y-5 sm:space-y-6 text-slate-100 overflow-hidden my-auto max-h-[90dvh] overflow-y-auto">
        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition cursor-pointer flex items-center justify-center shrink-0 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pr-8">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">แก้ไขชื่อผู้ใช้งาน</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              ชื่อผู้ใช้ต้องไม่ซ้ำกับสมาชิกท่านอื่นในระบบ
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>เปลี่ยนชื่อผู้ใช้งานสำเร็จแล้ว!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-purple-300">
              ชื่อผู้ใช้งานใหม่
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="พิมพ์ชื่อผู้ใช้งานของคุณ..."
              className="w-full px-4 py-3 text-xs sm:text-sm min-h-[48px] rounded-2xl text-slate-100 placeholder-slate-500 border border-slate-800 bg-slate-900/90 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>กำลังบันทึกชื่อผู้ใช้...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>บันทึกสำเร็จ!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 shrink-0" />
                <span>บันทึกเปลี่ยนชื่อ</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
