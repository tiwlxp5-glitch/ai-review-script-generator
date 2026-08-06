"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  X,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Crown,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "plus" | "pro";
  currentPlan?: "free" | "plus" | "pro" | "admin" | "member" | "guest";
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  defaultPlan = "pro",
  currentPlan = "free",
}: UpgradeProModalProps) {
  const [copiedLineId, setCopiedLineId] = useState(false);
  const isCurrentPlus = currentPlan === "plus";
  const isCurrentProOrAdmin = currentPlan === "pro" || currentPlan === "admin";

  // If user is already Plus, default selection MUST be "pro"
  const [selectedPlan, setSelectedPlan] = useState<"plus" | "pro">(
    isCurrentPlus ? "pro" : defaultPlan
  );

  useEffect(() => {
    if (isCurrentPlus) {
      setSelectedPlan("pro");
    } else {
      setSelectedPlan(defaultPlan);
    }
  }, [defaultPlan, isCurrentPlus, isOpen]);

  if (!isOpen) return null;

  const lineId = "tiwlip99";
  const lineUrl = `https://line.me/R/ti/p/~tiwlip99`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-5 sm:p-7 border border-purple-500/30 shadow-2xl bg-slate-950/95 space-y-6 text-slate-100 my-auto">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ยกระดับบัญชีผู้ใช้งาน</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isCurrentPlus ? "อัปเกรดเป็น Pro Plan" : "เลือกแพ็กเกจที่เหมาะกับคุณ"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {isCurrentPlus
              ? "คุณเป็นสมาชิก Plus อยู่แล้ว อัปเกรดเป็น Pro เพื่อรับสิทธิ์ 200 ครั้ง/เดือน + ตาราง B-Roll และ Teleprompter!"
              : "สร้างสคริปต์รีวิวสินค้า TikTok & Reels อย่างมืออาชีพประหยัดเวลาทำคลิปไปเกิน 80%"}
          </p>
        </div>

        {/* Pricing Cards Grid (Plus vs Pro) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Plus Plan Card */}
          <div
            onClick={() => {
              if (!isCurrentPlus) {
                setSelectedPlan("plus");
              }
            }}
            className={`relative rounded-2xl p-5 border transition-all space-y-4 flex flex-col justify-between ${
              isCurrentPlus
                ? "bg-slate-900/40 border-slate-800/80 cursor-not-allowed opacity-80"
                : selectedPlan === "plus"
                ? "bg-slate-900/95 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10 cursor-pointer"
                : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 opacity-90 hover:opacity-100 cursor-pointer"
            }`}
          >
            {/* Active Current Plan Badge */}
            {isCurrentPlus && (
              <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>แพ็กเกจปัจจุบันของคุณ</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Plus Plan</span>
                </span>
                {isCurrentPlus ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    ใช้งานอยู่
                  </span>
                ) : selectedPlan === "plus" ? (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">99</span>
                  <span className="text-xs font-semibold text-slate-400">บาท / เดือน</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">ตกครั้งละประมาณ 0.99 บาท</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>สร้างสคริปต์ <strong>100 ครั้ง / เดือน</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>เลือก Tone of Voice <strong>5 สไตล์</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ประมวลผลด้วย AI Gemini 3.6</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="line-through">ตารางกำกับภาพ Visual B-Roll</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="line-through">โหมดอ่านบท Teleprompter</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. Pro Plan Card (Recommended) */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className={`relative rounded-2xl p-5 border transition-all cursor-pointer space-y-4 flex flex-col justify-between ${
              selectedPlan === "pro"
                ? "bg-slate-900/95 border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/15"
                : "bg-slate-900/60 border-slate-800/80 hover:border-amber-500/40 opacity-90 hover:opacity-100"
            }`}
          >
            {/* Top Ribbon Badge */}
            {isCurrentProOrAdmin ? (
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>แพ็กเกจปัจจุบันของคุณ</span>
              </div>
            ) : (
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                {isCurrentPlus ? "⚡ อัปเกรดบวกเพิ่ม 100.-" : "🔥 คุ้มค่าที่สุด"}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Pro Plan (แนะนำ)</span>
                </span>
                {isCurrentProOrAdmin ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    ใช้งานอยู่
                  </span>
                ) : selectedPlan === "pro" ? (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-amber-400">199</span>
                  <span className="text-xs font-semibold text-slate-400">บาท / เดือน</span>
                  <span className="text-[10px] text-slate-500 line-through">ปกติ 299.-</span>
                </div>
                <p className="text-[11px] text-amber-300/90 font-medium pt-0.5">
                  {isCurrentPlus
                    ? "เพิ่มเงินอีกเพียง 100 บาท เพื่อปลดล็อกโควตา 200 ครั้ง + ฟีเจอร์ Pro ทั้งหมด!"
                    : "ตกครั้งละเพียง 0.99 บาท + ฟีเจอร์ระดับพรีเมียมครบเซ็ต"}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>สร้างสคริปต์จุใจ <strong>200 ครั้ง / เดือน</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>สคริปต์ตาราง Shot-by-Shot Visual B-Roll</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>ใช้งานโหมดเครื่องอ่านบท Teleprompter</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>ฟรี! แคปชัน TikTok & แฮชแท็ก + ปักตะกร้า</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>เลือก Tone of Voice <strong>5 สไตล์</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* LINE Payment Box & Direct Contact Action */}
        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-300">
              ทักแชทแจ้งชำระเงิน{" "}
              <strong className="text-amber-400 font-bold">
                {selectedPlan === "pro" ? "199 บาท (Pro)" : "99 บาท (Plus)"}
              </strong>{" "}
              กับแอดมิน เพื่อปรับปรับบัญชีทันที:
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

          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-4 px-6 rounded-2xl text-base font-bold transition duration-200 active:scale-[0.99] flex items-center justify-center space-x-2 shadow-xl ${
              selectedPlan === "pro"
                ? "text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-amber-500/30"
                : "text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30"
            }`}
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>
              {isCurrentPlus && selectedPlan === "pro"
                ? "ติดต่ออัปเกรดจาก Plus เป็น Pro Plan (199.-)"
                : `ติดต่ออัปเกรด ${selectedPlan === "pro" ? "Pro Plan (199.-)" : "Plus Plan (99.-)"}`}
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
