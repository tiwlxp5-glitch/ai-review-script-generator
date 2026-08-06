"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Crown,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeProModal({
  isOpen,
  onClose,
}: UpgradeProModalProps) {
  const [copiedLineId, setCopiedLineId] = useState(false);

  if (!isOpen) return null;

  const lineId = "tiwlip99";
  const lineUrl = "https://line.me/R/ti/p/~tiwlip99";

  const handleCopyLineId = async () => {
    try {
      await navigator.clipboard.writeText(lineId);
      setCopiedLineId(true);
      setTimeout(() => setCopiedLineId(false), 2500);
    } catch (err) {
      console.error("Failed to copy LINE ID:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl bg-slate-950/95 space-y-6 text-slate-100 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-xl shadow-purple-500/25 ring-4 ring-purple-500/20 text-white">
            <Crown className="w-8 h-8 fill-white/20" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>อัปเกรดบัญชีสมาชิก Pro</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
              สร้างสคริปต์จุใจ <span className="gradient-text">200 ครั้ง/เดือน</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              เพียง <strong className="text-emerald-400 text-lg font-extrabold">99 บาท</strong> / เดือน (ตกครั้งละ 0.50 บาท)
            </p>
          </div>
        </div>

        {/* Pro Benefits Checklist */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-3 text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>สร้างสคริปต์รีวิวสินค้า TikTok & Reels <strong>200 ครั้ง/เดือน</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>ประมวลผลด้วย AI <strong>Gemini 3.6 Flash</strong> ตัวใหม่ล่าสุด</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>บันทึกประวัติย้อนหลังได้ตลอดเวลา ไม่สูญหาย</span>
          </div>
        </div>

        {/* LINE Contact & Payment Step */}
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <p className="text-xs text-slate-300">
              ทักแชทแจ้งชำระเงิน 99 บาทกับแอดมิน เพื่อปรับบัญชีเป็น Pro ทันที:
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs font-medium text-slate-400">Line ID:</span>
              <code className="text-sm font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/30 font-mono">
                {lineId}
              </code>
              <button
                onClick={handleCopyLineId}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition flex items-center space-x-1"
              >
                {copiedLineId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ก๊อปแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Button: Redirect to LINE */}
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:from-emerald-300 hover:to-green-300 shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition duration-200 active:scale-[0.99]"
          >
            <MessageCircle className="w-5 h-5 text-slate-950 fill-slate-950" />
            <span>ติดต่อเพื่ออัปเกรด Pro</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
        </div>
      </div>
    </div>
  );
}
